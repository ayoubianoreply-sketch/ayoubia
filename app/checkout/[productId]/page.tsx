'use client';

import StorefrontHeader from '@/components/StorefrontHeader';
import StorefrontFooter from '@/components/StorefrontFooter';
import { FormEvent, use, useEffect, useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { mockCategories } from '@/lib/mock-categories';

type Product = { id: number | string; name_ar: string; description_ar?: string; price_dzd: number; image_url?: string };
type Wilaya = { id: number; name_ar: string };
type Daira = { id: number; name_ar: string };
const fallbackProducts: Product[] = [
  { id: 1, name_ar: 'طقم جلوس عصري', price_dzd: 268000, image_url: '/assets/reference/product-268000.png' },
  { id: 2, name_ar: 'مخدات ديكور', price_dzd: 6900, image_url: '/assets/reference/product-6900.png' },
  { id: 3, name_ar: 'ستائر فاخرة', price_dzd: 12500, image_url: '/assets/reference/product-12500.png' },
  { id: 4, name_ar: 'سرير نوم مودرن', price_dzd: 48900, image_url: '/assets/reference/product-48900.png' },
  { id: 5, name_ar: 'طقم جلوس عصري', price_dzd: 165000, image_url: '/assets/reference/product-165000.png' },
];
const mockProducts: Product[] = Object.values(mockCategories).flatMap((category) => category.products);
const fallbackWilayas = ['أدرار','الشلف','الأغواط','أم البواقي','باتنة','بجاية','بسكرة','بشار','البليدة','البويرة','تمنراست','تبسة','تلمسان','تيارت','تيزي وزو','الجزائر','الجلفة','جيجل','سطيف','سعيدة','سكيكدة','سيدي بلعباس','عنابة','قالمة','قسنطينة','المدية','مستغانم','المسيلة','معسكر','ورقلة','وهران','البيض','إليزي','برج بوعريريج','بومرداس','الطارف','تندوف','تيسمسيلت','الوادي','خنشلة','سوق أهراس','تيبازة','ميلة','عين الدفلى','النعامة','عين تموشنت','غرداية','غليزان','تيميمون','برج باجي مختار','أولاد جلال','بني عباس','عين صالح','عين قزام','تقرت','جانت','المغير','المنيعة','آفلو','بريكة','القنطرة','بئر العاتر','العريشة','قصر الشلالة','عين وسارة','مسعد','قصر البخاري','بوسعادة','الأبيض سيدي الشيخ'].map((name_ar, index) => ({ id: index + 1, name_ar }));
const fallbackDairas = (wilaya: Wilaya) => [{ id: wilaya.id, name_ar: wilaya.name_ar }];

export default function Checkout({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [wilayas, setWilayas] = useState<Wilaya[]>(fallbackWilayas);
  const [dairas, setDairas] = useState<Daira[]>([]);
  const [wilayaId, setWilayaId] = useState('');
  const [shippingCostDzd, setShippingCostDzd] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [dbReady, setDbReady] = useState(true);

  useEffect(() => {
    const client = createBrowserSupabaseClient();
    void Promise.all([
      client.from('products').select('id,name_ar,description_ar,price_dzd,image_url').eq('is_active', true),
      client.from('wilayas').select('id,name_ar').order('id'),
    ]).then(([productResult, wilayaResult]) => {
      const found = productResult.data?.find((item) => String(item.id) === productId);
      setDbReady(Boolean(found) && !productResult.error && !wilayaResult.error && Boolean(wilayaResult.data?.length));
      setProduct((found as Product | undefined) || fallbackProducts.find((item) => String(item.id) === productId) || mockProducts.find((item) => item.id === productId) || null);
      if (wilayaResult.data?.length) setWilayas(wilayaResult.data as Wilaya[]);
    }).catch(() => { setDbReady(false); setProduct(fallbackProducts.find((item) => String(item.id) === productId) || mockProducts.find((item) => item.id === productId) || null); });
  }, [productId]);

  useEffect(() => {
    if (!wilayaId) { setDairas([]); return; }
    const selectedWilaya = wilayas.find((item) => String(item.id) === wilayaId);
    const client = createBrowserSupabaseClient();
    void Promise.resolve(client.from('dairas').select('id,name_ar').eq('wilaya_id', Number(wilayaId)).order('name_ar')).then(({ data, error }) => {
      setDairas(data?.length ? data as Daira[] : selectedWilaya ? fallbackDairas(selectedWilaya) : []);
      if (error) setDbReady(false);
    }).catch(() => setDairas(selectedWilaya ? fallbackDairas(selectedWilaya) : []));
  }, [wilayaId, wilayas]);

  useEffect(() => {
    if (!wilayaId) { setShippingCostDzd(null); return; }
    let active = true;
    const loadRate = async () => {
      try {
        const { data } = await createBrowserSupabaseClient().from('shipping_rates').select('price').eq('wilaya_id', Number(wilayaId)).maybeSingle();
        if (active) setShippingCostDzd(data ? Number(data.price) : null);
      } catch { if (active) setShippingCostDzd(null); }
    };
    void loadRate();
    return () => { active = false; };
  }, [wilayaId]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!product) return;
    setBusy(true); setMessage('');
    const form = new FormData(event.currentTarget);
    const selectedDaira = dairas.find((item) => String(item.id) === String(form.get('dairaId')));
    try {
      const { data, error } = await createBrowserSupabaseClient().rpc('create_store_order', {
        p_first_name: String(form.get('firstName')).trim(), p_last_name: String(form.get('lastName')).trim(),
        p_phone1: String(form.get('phone1')).trim(), p_phone2: String(form.get('phone2') || '').trim() || null,
        p_wilaya_id: Number(wilayaId), p_daira_id: Number(form.get('dairaId')),
        p_address: String(form.get('address') || '').trim() || null,
        p_items: [{ product_id: product.id, quantity: 1, daira_name_ar: selectedDaira?.name_ar }],
      });
      if (error) throw error;
      const result = Array.isArray(data) ? data[0] : data;
      setOrderNumber(String(result?.order_number || result?.orderNumber || result?.id || ''));
      setMessage('تم استلام طلبك بنجاح. سنتواصل معك لتأكيد التفاصيل.');
    } catch (error) {
      setMessage(!dbReady ? 'قاعدة بيانات Supabase لم تُجهّز بعد. طبّق ملف الترحيل SQL ثم أعد المحاولة.' : error instanceof Error ? error.message : 'تعذّر إرسال الطلب.');
    } finally { setBusy(false); }
  }

  const money = (value: number) => `${new Intl.NumberFormat('ar-DZ').format(value || 0)} دج`;
  return <><StorefrontHeader /><main className="checkout-page"><div className="checkout-title"><span className="eyebrow">خطوة واحدة تفصلك</span><h1>أكملي طلبك</h1><p>أدخلي بياناتك وسنتواصل معك لتأكيد التفاصيل.</p></div><div className="checkout-layout"><section className="checkout-form-card"><h2>بيانات التوصيل</h2><form onSubmit={submit}><div className="field-row"><label>الاسم<input name="firstName" required placeholder="الاسم" autoComplete="given-name" /></label><label>اللقب<input name="lastName" required placeholder="اللقب" autoComplete="family-name" /></label></div><div className="field-row"><label>رقم الهاتف 1<input name="phone1" required type="tel" minLength={8} placeholder="05 xx xx xx xx" autoComplete="tel" /></label><label>رقم الهاتف 2 <small>(اختياري)</small><input name="phone2" type="tel" placeholder="06 xx xx xx xx" /></label></div><div className="field-row"><label>الولاية<select required value={wilayaId} onChange={(event) => setWilayaId(event.target.value)}><option value="">اختاري الولاية</option>{wilayas.map((wilaya) => <option value={wilaya.id} key={wilaya.id}>{wilaya.name_ar}</option>)}</select></label><label>الدائرة<select name="dairaId" required disabled={!wilayaId || !dairas.length}><option value="">{wilayaId ? 'اختاري الدائرة' : 'اختاري الولاية أولاً'}</option>{dairas.map((daira) => <option value={daira.id} key={daira.id}>{daira.name_ar}</option>)}</select></label></div><label>العنوان / أقرب نقطة دالة<input name="address" placeholder="الحي، الشارع أو أقرب معلم" /></label><button className="button button-green submit-order" disabled={busy || !product || !dbReady}>{busy ? 'جارٍ إرسال الطلب…' : 'تأكيد الطلب'} <span>←</span></button>{message && <div className={`notice ${orderNumber ? 'success' : 'error'}`} role="status">{message}{orderNumber && <strong>رقم الطلب: {orderNumber}</strong>}</div>}</form><div className="checkout-assurance"><span>🔒</span><span>الدفع عند الاستلام. بياناتك محفوظة لإتمام الطلب فقط.</span></div>{!dbReady && <p className="db-note">وضع معاينة: طبّق ترحيل Supabase لتفعيل حفظ الطلبات.</p>}</section><aside className="order-summary"><h2>ملخص الطلب</h2>{product ? <><div className="summary-product"><img src={product.image_url} alt={product.name_ar} /><div><span>اختيار AYOUBIA</span><h3>{product.name_ar}</h3><small>الكمية: 1</small></div></div><div className="summary-line"><span>سعر المنتج</span><strong>{money(product.price_dzd)}</strong></div><div className="summary-line"><span>التوصيل</span><strong>{shippingCostDzd === null ? 'اختاري الولاية' : money(shippingCostDzd)}</strong></div><div className="summary-total"><span>المجموع</span><strong>{money(product.price_dzd + (shippingCostDzd || 0))}</strong></div><p className="delivery-note">يُحسب سعر التوصيل حسب الولاية المختارة.</p></> : <p>جارٍ تحميل المنتج…</p>}</aside></div></main><StorefrontFooter /></>;
}

