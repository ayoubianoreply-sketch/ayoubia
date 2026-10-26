'use client';

import { useEffect, useState } from 'react';
import StorefrontHeader from '@/components/StorefrontHeader';
import StorefrontFooter from '@/components/StorefrontFooter';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

type TrackedOrder = { order_number: string; status: string; created_at: string; updated_at: string; total_dzd: number; items: { name: string; quantity: number }[] };
const states = ['new', 'confirmed', 'processing', 'shipped', 'delivered'];
const labels: Record<string, string> = { new: 'تم استلام الطلب', confirmed: 'تم تأكيد الطلب', processing: 'قيد التجهيز', shipped: 'في الطريق إليك', delivered: 'تم التوصيل', cancelled: 'أُلغي الطلب' };
const money = (n: number) => `${new Intl.NumberFormat('ar-DZ').format(n || 0)} دج`;

export default function OrderTrackingPage() {
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
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage(''); setOrder(null);
    try {
      const { data, error } = await createBrowserSupabaseClient().rpc('track_store_order', { p_order_number: orderNumber.trim(), p_phone: phone.trim() });
      if (error) throw error;
      if (!data) { setMessage('لم نعثر على طلب بهذه البيانات. تحققي من رقم الطلب ورقم الهاتف.'); return; }
      setOrder(data as TrackedOrder);
    } catch { setMessage('تعذر جلب حالة الطلب الآن. حاولي مرة أخرى بعد قليل.'); }
    finally { setBusy(false); }
  }
  const activeIndex = order ? states.indexOf(order.status) : -1;
  return <><StorefrontHeader /><main className="tracking-page"><div className="tracking-heading"><span className="eyebrow">AYOUBIA · خدمة العملاء</span><h1>تتبّعي طلبك</h1><p>أدخلي رقم الطلب ورقم الهاتف المستخدم عند الشراء.</p></div><form className="tracking-form" onSubmit={submit}><label>رقم الطلب<input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="مثال: AY-261026-AB12CD34" required /></label><label>رقم الهاتف<input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="رقم الهاتف المسجل للطلب" required /></label><button className="button button-green" disabled={busy}>{busy ? 'جارٍ البحث…' : 'عرض حالة الطلب'} <span>←</span></button>{message && <p className="tracking-message" role="status">{message}</p>}</form>{order && <section className="tracking-result"><div className="tracking-result-head"><div><small>رقم الطلب</small><h2 dir="ltr">{order.order_number}</h2></div><strong className={`tracking-status ${order.status}`}>{labels[order.status] || order.status}</strong></div>{order.status === 'cancelled' ? <p className="tracking-cancelled">تم إلغاء هذا الطلب. تواصلي معنا إذا كنت بحاجة إلى مساعدة.</p> : <ol className="tracking-steps">{states.map((status, index) => <li key={status} className={index <= activeIndex ? 'complete' : ''}><i>{index < activeIndex ? '✓' : index + 1}</i><span>{labels[status]}</span></li>)}</ol>}<div className="tracking-items">{order.items?.map((item, i) => <p key={`${item.name}-${i}`}>{item.name} <span>× {item.quantity}</span></p>)}</div><div className="tracking-total"><span>إجمالي الطلب</span><strong>{money(order.total_dzd)}</strong></div><small className="tracking-updated">آخر تحديث: {new Date(order.updated_at || order.created_at).toLocaleString('ar-DZ')}</small></section>}</main><StorefrontFooter /></>;
}
