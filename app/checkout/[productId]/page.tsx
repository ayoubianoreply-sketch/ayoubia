'use client';

import StorefrontHeader from '@/components/StorefrontHeader';
import StorefrontFooter from '@/components/StorefrontFooter';
import { FormEvent, use, useEffect, useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { mockCategories } from '@/lib/mock-categories';
import { useLocale } from '@/components/LocaleProvider';

type ProductColor = string | { color: string; image_url?: string | null };
type Product = { id: number | string; name_ar: string; name_fr?: string; description_ar?: string; price_dzd: number; image_url?: string; colors?: ProductColor[] };
type Wilaya = { id: number; name_ar: string; name_fr?: string };
type Daira = { id: number; name_ar: string; name_fr?: string };
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
  const { locale } = useLocale();
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
  const [selectedColor, setSelectedColor] = useState('');
  const [pointsBalance, setPointsBalance] = useState(0);
  const [signedIn, setSignedIn] = useState(false);
  const [usePoints, setUsePoints] = useState(false);

  useEffect(() => {
    const client = createBrowserSupabaseClient();
    let active = true;
    const loadPoints = async (userId?: string) => {
      setSignedIn(Boolean(userId));
      if (!userId) { setPointsBalance(0); setUsePoints(false); return; }
      const { data, error } = await client.from('profiles').select('points').eq('id', userId).maybeSingle();
      if (!active) return;
      if (error) { console.error('Error loading loyalty points:', error); setPointsBalance(0); return; }
      const balance = Number(data?.points || 0);
      setPointsBalance(balance);
      if (balance < 10000) setUsePoints(false);
    };
    void client.auth.getSession().then(({ data }) => loadPoints(data.session?.user.id));
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => { if (active) void loadPoints(session?.user.id); }, 0);
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    const client = createBrowserSupabaseClient();
    void Promise.all([
      client.from('products').select('id,name_ar,name_fr,description_ar,price_dzd,image_url,colors').eq('is_active', true),
      client.from('wilayas').select('id,name_ar,name_fr').order('id'),
    ]).then(([productResult, wilayaResult]) => {
      const found = productResult.data?.find((item) => String(item.id) === productId);
      setDbReady(Boolean(found) && !productResult.error && !wilayaResult.error && Boolean(wilayaResult.data?.length));
      const selected = (found as Product | undefined) || fallbackProducts.find((item) => String(item.id) === productId) || mockProducts.find((item) => item.id === productId) || null;
      setProduct(selected);
      const firstColor = selected?.colors?.[0];
      setSelectedColor(typeof firstColor === 'string' ? firstColor : firstColor?.color || '');
      if (wilayaResult.data?.length) setWilayas(wilayaResult.data as Wilaya[]);
    }).catch(() => { setDbReady(false); setProduct(fallbackProducts.find((item) => String(item.id) === productId) || mockProducts.find((item) => item.id === productId) || null); });
  }, [productId]);

  useEffect(() => {
    if (!wilayaId) { setDairas([]); return; }
    const selectedWilaya = wilayas.find((item) => String(item.id) === wilayaId);
    const client = createBrowserSupabaseClient();
    void Promise.resolve(client.from('dairas').select('id,name_ar,name_fr').eq('wilaya_id', Number(wilayaId)).order('name_ar')).then(({ data, error }) => {
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
        p_items: [{ product_id: product.id, quantity: 1, daira_name_ar: selectedDaira?.name_ar, selected_color: selectedColor || null }],
        p_points_used: usePoints ? 10000 : 0,
      });
      if (error) throw error;
      const result = Array.isArray(data) ? data[0] : data;
      setOrderNumber(String(result?.order_number || result?.orderNumber || result?.id || ''));
      if (usePoints) { setPointsBalance((current) => Math.max(0, current - 10000)); setUsePoints(false); }
      setMessage(text('تم استلام طلبك بنجاح. سنتواصل معك لتأكيد التفاصيل.', 'Votre commande a bien été reçue. Nous vous contacterons pour confirmer les détails.'));
    } catch (error) {
      setMessage(!dbReady ? text('قاعدة بيانات Supabase لم تُجهّز بعد. طبّق ملف الترحيل SQL ثم أعد المحاولة.', 'La base Supabase n’est pas prête. Appliquez la migration SQL puis réessayez.') : error instanceof Error ? error.message : text('تعذّر إرسال الطلب.', 'Impossible d’envoyer la commande.'));
    } finally { setBusy(false); }
  }

  const text = (ar: string, fr: string) => locale === 'ar' ? ar : fr;
  const productName = product ? (locale === 'ar' ? product.name_ar : product.name_fr || product.name_ar) : '';
  const money = (value: number) => `${new Intl.NumberFormat(locale === 'fr' ? 'fr-DZ' : 'ar-DZ').format(value || 0)} ${locale === 'fr' ? 'DA' : 'دج'}`;
  const subtotal = Number(product?.price_dzd || 0);
  const shipping = shippingCostDzd || 0;
  const canRedeemPoints = signedIn && pointsBalance >= 10000;
  const redemptionAvailable = subtotal + shipping >= 20000;
  const discount = usePoints && redemptionAvailable ? 20000 : 0;
  const total = Math.max(0, subtotal + shipping - discount);
  const colorOptions = (product?.colors || []).map((item) => typeof item === 'string' ? { color: item, image_url: null } : item);
  const activeColor = colorOptions.find((item) => item.color === selectedColor);
  const productImage = activeColor?.image_url || product?.image_url || '';
  return <><StorefrontHeader /><main className="checkout-page"><div className="checkout-title"><span className="eyebrow">{text('خطوة واحدة تفصلك','Encore une étape')}</span><h1>{text('أكملي طلبك','Finaliser ma commande')}</h1><p>{text('يمكنك الطلب كزائر دون إنشاء حساب.','Vous pouvez commander en tant qu’invité, sans créer de compte.')}</p></div><div className="checkout-layout"><section className="checkout-form-card"><h2>{text('بيانات التوصيل','Informations de livraison')}</h2><form onSubmit={submit}><div className="field-row"><label>{text('الاسم','Prénom')}<input name="firstName" required placeholder={text('الاسم','Prénom')} autoComplete="given-name" /></label><label>{text('اللقب','Nom')}<input name="lastName" required placeholder={text('اللقب','Nom')} autoComplete="family-name" /></label></div><div className="field-row"><label>{text('رقم الهاتف 1','Téléphone 1')}<input name="phone1" required type="tel" minLength={8} placeholder="05 xx xx xx xx" autoComplete="tel" /></label><label>{text('رقم الهاتف 2','Téléphone 2')} <small>({text('اختياري','facultatif')})</small><input name="phone2" type="tel" placeholder="06 xx xx xx xx" /></label></div><div className="field-row"><label>{text('الولاية','Wilaya')}<select required value={wilayaId} onChange={(event) => setWilayaId(event.target.value)}><option value="">{text('اختاري الولاية','Choisir la wilaya')}</option>{wilayas.map((wilaya) => <option value={wilaya.id} key={wilaya.id}>{locale === 'ar' ? wilaya.name_ar : wilaya.name_fr || wilaya.name_ar}</option>)}</select></label><label>{text('الدائرة','Daïra')}<select name="dairaId" required disabled={!wilayaId || !dairas.length}><option value="">{wilayaId ? text('اختاري الدائرة','Choisir la daïra') : text('اختاري الولاية أولاً','Choisir une wilaya')}</option>{dairas.map((daira) => <option value={daira.id} key={daira.id}>{locale === 'ar' ? daira.name_ar : daira.name_fr || daira.name_ar}</option>)}</select></label></div><label>{text('العنوان / أقرب نقطة دالة','Adresse / repère à proximité')}<input name="address" placeholder={text('الحي، الشارع أو أقرب معلم','Quartier, rue ou repère')} /></label><button className="button button-green submit-order" disabled={busy || !product || !dbReady}>{busy ? text('جارٍ إرسال الطلب…','Envoi en cours…') : text('تأكيد الطلب','Confirmer la commande')} <span>←</span></button>{message && <div className={`notice ${orderNumber ? 'success' : 'error'}`} role="status">{message}{orderNumber && <strong>{text('رقم الطلب:','N° de commande :')} {orderNumber}</strong>}</div>}</form><div className="checkout-assurance"><span>🔒</span><span>{text('الدفع عند الاستلام. بياناتك محفوظة لإتمام الطلب فقط.','Paiement à la livraison. Vos données servent uniquement au traitement de la commande.')}</span></div>{!dbReady && <p className="db-note">{text('وضع معاينة: طبّق ترحيل Supabase لتفعيل حفظ الطلبات.','Aperçu : appliquez ترحيل Supabase لتفعيل حفظ الطلبات.')}</p>}</section><aside className="order-summary"><h2>{text('ملخص الطلب','Résumé de la commande')}</h2>{product ? <><div className="summary-product"><img src={productImage} alt={productName} /><div><span>AYOUBIA</span><h3>{productName}</h3><small>{text('الكمية: 1','Quantité : 1')}</small></div></div>{Boolean(colorOptions.length) && <fieldset className="product-colors"><legend>{text('اختاري اللون','Choisir une couleur')}</legend><div>{colorOptions.map((color) => <button type="button" key={color.color} className={`color-swatch ${selectedColor === color.color ? 'active' : ''}`} style={{ backgroundColor: color.color }} onClick={() => setSelectedColor(color.color)} aria-label={color.color} aria-pressed={selectedColor === color.color} />)}</div></fieldset>}<div className="summary-line"><span>{text('سعر المنتج','Prix')}</span><strong>{money(product.price_dzd)}</strong></div><div className="summary-line"><span>{text('التوصيل','Livraison')}</span><strong>{shippingCostDzd === null ? text('اختاري الولاية','Choisir la wilaya') : money(shippingCostDzd)}</strong></div>{usePoints && redemptionAvailable && <div className="summary-line loyalty-discount"><span>{text('خصم النقاط','Remise fidélité')}</span><strong>−{money(20000)}</strong></div>}{canRedeemPoints && <label className="loyalty-option"><input type="checkbox" checked={usePoints} disabled={!redemptionAvailable || busy || Boolean(orderNumber)} onChange={(event) => setUsePoints(event.target.checked)} /><span>{text('استخدام 10,000 نقطة للحصول على خصم 20,000 دج','Utiliser 10 000 points pour une remise de 20 000 DA')}</span></label>}{signedIn && <div className="loyalty-balance">{text('رصيد نقاطك','Votre solde de points')}: <strong>{new Intl.NumberFormat(locale === 'fr' ? 'fr-DZ' : 'ar-DZ').format(pointsBalance)}</strong></div>}{canRedeemPoints && !redemptionAvailable && <small className="delivery-note">{text('يتطلب الخصم أن يبلغ إجمالي الطلب 20,000 دج على الأقل.','Le total doit atteindre 20 000 DA pour utiliser cette remise.')}</small>}<div className="summary-total"><span>{text('المجموع','Total')}</span><strong>{money(total)}</strong></div><p className="delivery-note">{text('يُحسب سعر التوصيل حسب الولاية المختارة.','Les frais de livraison dépendent de la wilaya.')}</p></> : <p>{text('جارٍ تحميل المنتج…','Chargement du produit…')}</p>}</aside></div></main><StorefrontFooter /></>;
}

