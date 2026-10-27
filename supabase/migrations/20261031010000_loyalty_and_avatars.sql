-- Customer avatars, loyalty balances, atomic redemption and delivery rewards.
begin;

alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists points integer not null default 0;
alter table public.profiles drop constraint if exists profiles_points_nonnegative;
alter table public.profiles add constraint profiles_points_nonnegative check (points >= 0);

alter table public.orders
  add column if not exists points_earned integer not null default 0,
  add column if not exists points_used integer not null default 0;
alter table public.orders drop constraint if exists orders_points_nonnegative;
alter table public.orders add constraint orders_points_nonnegative check (points_earned >= 0 and points_used >= 0);

grant update (avatar_url) on public.profiles to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists avatars_public_read on storage.objects;
create policy avatars_public_read on storage.objects
  for select to anon, authenticated using (bucket_id = 'avatars');
drop policy if exists avatars_owner_insert on storage.objects;
create policy avatars_owner_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists avatars_owner_update on storage.objects;
create policy avatars_owner_update on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists avatars_owner_delete on storage.objects;
create policy avatars_owner_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- A status change and its loyalty credit happen in one transaction, once only.
create or replace function public.admin_update_order_status_with_points(p_order_id bigint, p_status text)
returns jsonb
language plpgsql security definer set search_path = ''
as $function$
declare
  v_order public.orders%rowtype;
  v_award integer := 0;
begin
  if (select public.current_admin_role()) not in ('super_admin', 'sub_admin') then
    raise exception 'صلاحية إدارة الطلبات مطلوبة.' using errcode = '42501';
  end if;
  if p_status not in ('new', 'processing', 'in_transit', 'delivered', 'cancelled') then
    raise exception 'حالة الطلب غير صالحة.' using errcode = '22023';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'لم يتم العثور على الطلب.' using errcode = 'P0002'; end if;

  if p_status = 'delivered' and v_order.points_earned = 0 and v_order.user_id is not null then
    v_award := case
      when v_order.total_dzd > 1000000 then 10000
      when v_order.total_dzd > 200000 then 1000
      when v_order.total_dzd > 50000 then 500
      when v_order.total_dzd > 5000 then 100
      else 0
    end;
    if v_award > 0 then
      update public.profiles set points = points + v_award, updated_at = now()
      where id = v_order.user_id;
      if not found then v_award := 0; end if;
    end if;
  end if;

  update public.orders
  set status = p_status,
      points_earned = case when v_order.points_earned = 0 then v_award else v_order.points_earned end,
      updated_at = now()
  where id = p_order_id;

  return jsonb_build_object('status', p_status, 'points_earned', case when v_order.points_earned = 0 then v_award else v_order.points_earned end);
end;
$function$;
revoke all on function public.admin_update_order_status_with_points(bigint, text) from public;
grant execute on function public.admin_update_order_status_with_points(bigint, text) to authenticated;
revoke update (status, updated_at) on public.orders from authenticated;

-- Replace the guest order RPC with an authenticated-points-aware version.
drop function if exists public.create_store_order(text,text,text,text,smallint,bigint,text,jsonb);
create function public.create_store_order(
  p_first_name text, p_last_name text, p_phone1 text, p_phone2 text,
  p_wilaya_id smallint, p_daira_id bigint, p_address text, p_items jsonb,
  p_points_used integer default 0
) returns jsonb
language plpgsql security definer set search_path = ''
as $function$
declare
  v_order_id bigint;
  v_order_number text;
  v_subtotal bigint := 0;
  v_shipping bigint := 0;
  v_total bigint := 0;
  v_item jsonb;
  v_product public.products%rowtype;
  v_quantity integer;
  v_color text;
  v_points integer := 0;
  v_user_id uuid := auth.uid();
begin
  if pg_catalog.length(pg_catalog.btrim(p_first_name)) not between 1 and 100
     or pg_catalog.length(pg_catalog.btrim(p_last_name)) not between 1 and 100
     or pg_catalog.length(pg_catalog.regexp_replace(p_phone1, '[^0-9+]', '', 'g')) not between 8 and 16 then
    raise exception 'أدخل الاسم ورقم هاتف صحيحاً.' using errcode = '22023';
  end if;
  if not exists (select 1 from public.dairas d where d.id = p_daira_id and d.wilaya_id = p_wilaya_id) then
    raise exception 'الدائرة لا تتبع الولاية المختارة.' using errcode = '22023';
  end if;
  if p_items is null or pg_catalog.jsonb_typeof(p_items) <> 'array' or pg_catalog.jsonb_array_length(p_items) < 1 or pg_catalog.jsonb_array_length(p_items) > 20 then
    raise exception 'قائمة المنتجات غير صالحة.' using errcode = '22023';
  end if;
  if p_points_used not in (0, 10000) then raise exception 'عدد نقاط الخصم غير صالح.' using errcode = '22023'; end if;

  for v_item in select value from pg_catalog.jsonb_array_elements(p_items) loop
    v_quantity := (v_item ->> 'quantity')::integer;
    if v_quantity < 1 or v_quantity > 20 then raise exception 'الكمية غير صالحة.' using errcode = '22023'; end if;
    select * into v_product from public.products where id = (v_item ->> 'product_id')::bigint and is_active = true for update;
    if not found then raise exception 'أحد المنتجات غير متاح.' using errcode = '22023'; end if;
    if v_product.stock < v_quantity then raise exception 'الكمية المطلوبة غير متوفرة.' using errcode = '22023'; end if;
    v_color := nullif(pg_catalog.btrim(v_item ->> 'selected_color'), '');
    if v_color is not null and not exists (
      select 1 from pg_catalog.jsonb_array_elements(v_product.colors) as available(value)
      where coalesce(available.value ->> 'color', available.value #>> '{}') = v_color
    ) then raise exception 'اللون المختار غير متاح لهذا المنتج.' using errcode = '22023'; end if;
    v_subtotal := v_subtotal + (v_product.price_dzd * v_quantity);
  end loop;

  select coalesce(sr.price, 0) into v_shipping from public.shipping_rates sr where sr.wilaya_id = p_wilaya_id;
  v_total := v_subtotal + coalesce(v_shipping, 0);
  if p_points_used = 10000 then
    if v_user_id is null then raise exception 'سجّل الدخول لاستخدام نقاط الولاء.' using errcode = '42501'; end if;
    if v_total < 20000 then raise exception 'يجب أن يبلغ مجموع الطلب 20,000 دج على الأقل لاستخدام النقاط.' using errcode = '22023'; end if;
    select p.points into v_points from public.profiles p where p.id = v_user_id for update;
    if not found or coalesce(v_points, 0) < 10000 then raise exception 'رصيد نقاطك غير كافٍ.' using errcode = '22023'; end if;
    update public.profiles set points = points - 10000, updated_at = now() where id = v_user_id;
    v_total := v_total - 20000;
  end if;

  v_order_number := 'AY-' || pg_catalog.to_char(pg_catalog.clock_timestamp(), 'YYMMDD') || '-' || pg_catalog.upper(pg_catalog.substr(pg_catalog.replace(pg_catalog.gen_random_uuid()::text, '-', ''), 1, 8));
  insert into public.orders(order_number, user_id, first_name, last_name, phone1, phone2, wilaya_id, daira_id, address, status, total_dzd, shipping_dzd, points_used)
  values(v_order_number, v_user_id, pg_catalog.btrim(p_first_name), pg_catalog.btrim(p_last_name), pg_catalog.btrim(p_phone1), nullif(pg_catalog.btrim(p_phone2), ''), p_wilaya_id, p_daira_id, nullif(pg_catalog.btrim(p_address), ''), 'new', v_total, coalesce(v_shipping, 0), p_points_used)
  returning id into v_order_id;

  for v_item in select value from pg_catalog.jsonb_array_elements(p_items) loop
    v_quantity := (v_item ->> 'quantity')::integer;
    update public.products set stock = stock - v_quantity, updated_at = pg_catalog.now() where id = (v_item ->> 'product_id')::bigint;
    v_color := nullif(pg_catalog.btrim(v_item ->> 'selected_color'), '');
    insert into public.order_items(order_id, product_id, product_name, product_image_url, unit_price_dzd, quantity, selected_color)
      select v_order_id, id, name_ar, image_url, price_dzd, v_quantity, v_color from public.products where id = (v_item ->> 'product_id')::bigint;
  end loop;
  return pg_catalog.jsonb_build_object('id', v_order_id, 'order_number', v_order_number, 'total_dzd', v_total, 'shipping_dzd', coalesce(v_shipping, 0), 'points_used', p_points_used);
end;
$function$;
revoke all on function public.create_store_order(text,text,text,text,smallint,bigint,text,jsonb,integer) from public;
grant execute on function public.create_store_order(text,text,text,text,smallint,bigint,text,jsonb,integer) to anon, authenticated;

notify pgrst, 'reload schema';
commit;
