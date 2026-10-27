-- Careers applications. CVs are private: only authenticated administrators can read them.
begin;

create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(btrim(full_name)) between 2 and 150),
  email text not null check (char_length(email) between 5 and 254),
  phone text not null check (char_length(regexp_replace(phone, '[^0-9+]', '', 'g')) between 8 and 16),
  position text not null check (char_length(btrim(position)) between 2 and 160),
  cv_path text not null check (cv_path like 'applications/%.pdf'),
  status text not null default 'new' check (status in ('new', 'reviewing', 'accepted', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists job_applications_created_idx on public.job_applications(created_at desc);
alter table public.job_applications enable row level security;
grant insert (full_name, email, phone, position, cv_path) on public.job_applications to anon, authenticated;
grant select on public.job_applications to authenticated;
grant update (status) on public.job_applications to authenticated;

drop policy if exists job_applications_public_submit on public.job_applications;
create policy job_applications_public_submit on public.job_applications
  for insert to anon, authenticated with check (status = 'new');
drop policy if exists job_applications_admin_read on public.job_applications;
create policy job_applications_admin_read on public.job_applications
  for select to authenticated using ((select public.current_admin_role()) in ('super_admin', 'sub_admin'));
drop policy if exists job_applications_admin_update on public.job_applications;
create policy job_applications_admin_update on public.job_applications
  for update to authenticated
  using ((select public.current_admin_role()) in ('super_admin', 'sub_admin'))
  with check ((select public.current_admin_role()) in ('super_admin', 'sub_admin'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cvs', 'cvs', false, 10485760, array['application/pdf'])
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists cvs_application_upload on storage.objects;
create policy cvs_application_upload on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'cvs' and (storage.foldername(name))[1] = 'applications' and lower(name) like '%.pdf');
drop policy if exists cvs_admin_read on storage.objects;
create policy cvs_admin_read on storage.objects
  for select to authenticated
  using (bucket_id = 'cvs' and (select public.current_admin_role()) in ('super_admin', 'sub_admin'));

commit;
