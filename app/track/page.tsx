'use client';

import { useEffect, useState, type FormEvent } from 'react';
import StorefrontHeader from '@/components/StorefrontHeader';
import StorefrontFooter from '@/components/StorefrontFooter';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { useLocale } from '@/components/LocaleProvider';

type TrackedOrder = { order_number: string; status: string; created_at: string; updated_at: string; total_dzd: number; items: { name: string; quantity: number }[] };
const states = ['new', 'processing', 'in_transit', 'delivered'];
const labelsAr: Record<string, string> = { new: 'جديد', processing: 'قيد التجهيز', in_transit: 'قيد الوصول', delivered: 'تم التسليم', cancelled: 'ملغي' };
const labelsFr: Record<string, string> = { new: 'Nouvelle', processing: 'En préparation', in_transit: 'En livraison', delivered: 'Livrée', cancelled: 'Annulée' };
const money = (n: number, ar: boolean) => `${new Intl.NumberFormat(ar ? 'ar-DZ' : 'fr-DZ').format(n || 0)} ${ar ? 'دج' : 'DA'}`;

export default function OrderTrackingPage() {
  const { locale } = useLocale();
  const ar = locale === 'ar';
  const labels = ar ? labelsAr : labelsFr;
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!order) return;
    const refresh = async () => {
      const { data } = await createBrowserSupabaseClient().rpc('track_store_order', { p_order_number: orderNumber.trim(), p_phone: phone.trim() });
      if (data) setOrder(data as TrackedOrder);
    };
    const timer = window.setInterval(() => { void refresh(); }, 15000);
    return () => window.clearInterval(timer);
  }, [order?.order_number, orderNumber, phone]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage(''); setOrder(null);
    try {
      const { data, error } = await createBrowserSupabaseClient().rpc('track_store_order', { p_order_number: orderNumber.trim(), p_phone: phone.trim() });
      if (error) throw error;
      if (!data) { setMessage(ar ? 'لم نعثر على طلب بهذه البيانات. تحقق من رقم الطلب ورقم الهاتف.' : 'Aucune commande trouvée. Vérifiez le numéro de commande et le téléphone.'); return; }
      setOrder(data as TrackedOrder);
    } catch { setMessage(ar ? 'تعذر جلب حالة الطلب الآن. حاول مرة أخرى بعد قليل.' : 'Impossible de récupérer le statut. Réessayez dans un instant.'); }
    finally { setBusy(false); }
  }

  const activeIndex = order ? states.indexOf(order.status) : -1;
  return <>
    <StorefrontHeader />
    <main className="tracking-page" dir={ar ? 'rtl' : 'ltr'}>
      <div className="tracking-heading"><span className="eyebrow">AYOUBIA · {ar ? 'خدمة العملاء' : 'SERVICE CLIENT'}</span><h1>{ar ? 'تتبع طلبك' : 'Suivre ma commande'}</h1><p>{ar ? 'أدخل رقم الطلب ورقم الهاتف المستخدم عند الشراء.' : 'Saisissez votre numéro de commande et le téléphone utilisé lors de l’achat.'}</p></div>
      <form className="tracking-form" onSubmit={submit}>
        <label>{ar ? 'رقم الطلب' : 'Numéro de commande'}<input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="AY-261026-AB12CD34" required /></label>
        <label>{ar ? 'رقم الهاتف' : 'Téléphone'}<input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={ar ? 'رقم الهاتف المسجل للطلب' : 'Téléphone associé à la commande'} required /></label>
        <button className="button button-green" disabled={busy}>{busy ? (ar ? 'جارٍ البحث…' : 'Recherche…') : (ar ? 'تتبع الطلب' : 'Suivre')} <span>{ar ? '←' : '→'}</span></button>
        {message && <p className="tracking-message" role="status">{message}</p>}
      </form>
      {order && <section className="tracking-result">
        <div className="tracking-result-head"><div><small>{ar ? 'رقم الطلب' : 'Commande'}</small><h2 dir="ltr">{order.order_number}</h2></div><strong className={`tracking-status ${order.status}`}>{labels[order.status] || order.status}</strong></div>
        {order.status === 'cancelled' ? <p className="tracking-cancelled">{ar ? 'تم إلغاء هذا الطلب. تواصل معنا إذا كنت بحاجة إلى مساعدة.' : 'Cette commande a été annulée. Contactez-nous si vous avez besoin d’aide.'}</p> : <ol className="tracking-steps">{states.map((status, index) => <li key={status} className={index <= activeIndex ? 'complete' : ''}><i>{index < activeIndex ? '✓' : index + 1}</i><span>{labels[status]}</span></li>)}</ol>}
        <div className="tracking-items">{order.items?.map((item, i) => <p key={`${item.name}-${i}`}>{item.name} <span>× {item.quantity}</span></p>)}</div>
        <div className="tracking-total"><span>{ar ? 'إجمالي الطلب' : 'Total de la commande'}</span><strong>{money(order.total_dzd, ar)}</strong></div>
        <small className="tracking-updated">{ar ? 'آخر تحديث:' : 'Dernière mise à jour :'} {new Date(order.updated_at || order.created_at).toLocaleString(ar ? 'ar-DZ' : 'fr-DZ')}</small>
      </section>}
    </main>
    <StorefrontFooter />
  </>;
}
