'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import type { CartProduct } from '@/lib/store-events';

type CartItem = CartProduct & { quantity: number };
const CART_KEY = 'ayoubia-cart';
const money = (amount: number) => `${new Intl.NumberFormat('ar-DZ').format(amount)} دج`;

export default function StorefrontOverlays() {
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    try { setCart(JSON.parse(localStorage.getItem(CART_KEY) || '[]')); } catch { setCart([]); }
    const onCart = () => setCartOpen(true);
    const onAuth = () => setAuthOpen(true);
    const onAdd = (event: Event) => {
      const product = (event as CustomEvent<CartProduct>).detail;
      const current = JSON.parse(localStorage.getItem(CART_KEY) || '[]') as CartItem[];
      const existing = current.find((item) => String(item.id) === String(product.id));
      const next = existing ? current.map((item) => String(item.id) === String(product.id) ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { ...product, quantity: 1 }];
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      setCart(next);
      window.dispatchEvent(new CustomEvent('ayoubia:cart-count', { detail: next.reduce((sum, item) => sum + item.quantity, 0) }));
      setCartOpen(true);
    };
    window.addEventListener('ayoubia:open-cart', onCart);
    window.addEventListener('ayoubia:open-auth', onAuth);
    window.addEventListener('ayoubia:add-to-cart', onAdd);
    return () => {
      window.removeEventListener('ayoubia:open-cart', onCart);
      window.removeEventListener('ayoubia:open-auth', onAuth);
      window.removeEventListener('ayoubia:add-to-cart', onAdd);
    };
  }, []);

  const saveCart = (next: CartItem[]) => {
    setCart(next);
    localStorage.setItem(CART_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('ayoubia:cart-count', { detail: next.reduce((sum, item) => sum + item.quantity, 0) }));
  };
  const closeAll = () => { setCartOpen(false); setAuthOpen(false); };
  useEffect(() => {
    if (!cartOpen && !authOpen) return;
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') closeAll(); };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [cartOpen, authOpen]);

  return <>
    <div className={`drawer-backdrop${cartOpen ? ' open' : ''}`} onClick={() => setCartOpen(false)} aria-hidden="true" />
    <aside className={`cart-drawer${cartOpen ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label="سلة التسوق" aria-hidden={!cartOpen}>
      <div className="overlay-heading"><h2>سلة التسوق <span>({cart.reduce((sum, item) => sum + item.quantity, 0)})</span></h2><button type="button" onClick={() => setCartOpen(false)} aria-label="إغلاق">×</button></div>
      {cart.length ? <><div className="cart-items">{cart.map((item) => <article className="cart-item" key={item.id}><img src={item.image_url} alt={item.name_ar} /><div><h3>{item.name_ar}</h3><strong>{money(item.price_dzd)}</strong><div className="cart-quantity"><button onClick={() => saveCart(item.quantity > 1 ? cart.map((row) => row.id === item.id ? { ...row, quantity: row.quantity - 1 } : row) : cart.filter((row) => row.id !== item.id))}>−</button><span>{item.quantity}</span><button onClick={() => saveCart(cart.map((row) => row.id === item.id ? { ...row, quantity: row.quantity + 1 } : row))}>+</button></div></div></article>)}</div><div className="cart-total"><span>المجموع</span><strong>{money(cart.reduce((sum, item) => sum + item.price_dzd * item.quantity, 0))}</strong></div><Link href={`/checkout/${cart[0].id}`} className="button button-green drawer-checkout" onClick={() => setCartOpen(false)}>متابعة إتمام الطلب <span>←</span></Link></> : <div className="cart-empty"><span className="empty-bag"><svg viewBox="0 0 32 32"><path d="M7 11h18l2 17H5l2-17Z"/><path d="M12 11a4 4 0 0 1 8 0"/></svg></span><h3>سلة التسوق فارغة</h3><p>لم تضيفي أي منتجات إلى سلتك بعد.</p><button className="button button-green" onClick={() => setCartOpen(false)}>متابعة التسوق</button><div className="drawer-login">هل تملك حساباً؟ <button onClick={() => { setCartOpen(false); setAuthOpen(true); }}>سجل الدخول للدفع بشكل أسرع</button></div></div>}
    </aside>
    {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
  </>;
}

function AuthModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const google = async () => {
    setBusy(true); setMessage('');
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/auth/callback', queryParams: { prompt: 'select_account' } } });
      if (error) throw error;
    } catch (error) { setMessage(error instanceof Error ? error.message : 'تعذر بدء تسجيل الدخول باستخدام Google.'); setBusy(false); }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setMessage('');
    const data = new FormData(event.currentTarget);
    const email = String(data.get('email')).trim();
    const password = String(data.get('password'));
    try {
      const supabase = createBrowserSupabaseClient();
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage('تم تسجيل الدخول بنجاح.');
        onClose();
      } else {
        if (password !== data.get('confirmPassword')) throw new Error('كلمتا المرور غير متطابقتين.');
        if (!data.get('terms')) throw new Error('يرجى الموافقة على شروط الخصوصية وسياسة الاستخدام.');
        const firstName = String(data.get('firstName') ?? '').trim();
        const lastName = String(data.get('lastName') ?? '').trim();
        const phone = `${data.get('countryCode')}${String(data.get('phone') ?? '').trim()}`;
        const { data: signupData, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + '/auth/callback',
            data: { first_name: firstName, last_name: lastName, phone, phone_secondary: data.get('phone2') || null },
          },
        });
        if (error) {
          console.error('Error creating account:', error);
          alert(`تعذر إنشاء الحساب: ${error.message}`);
          setMessage(error.message);
          return;
        }

        if (!signupData.session) {
          const confirmationMessage = 'تم إنشاء الحساب! يرجى مراجعة بريدك الإلكتروني لتأكيد الحساب.';
          alert(confirmationMessage);
          onClose();
          return;
        }
        if (!signupData.user) throw new Error('تم بدء الجلسة لكن لم يُرجع Supabase بيانات المستخدم.');

        // Do not write to profiles until Supabase has authenticated this user.
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: signupData.user.id,
          first_name: firstName,
          last_name: lastName,
          phone,
        }, { onConflict: 'id' }).select();
        if (profileError) {
          console.error('Error saving signup profile:', profileError);
          alert(`تم تسجيل الدخول، لكن تعذر حفظ بيانات الملف الشخصي: ${profileError.message}`);
        }
        alert('تم إنشاء الحساب وتسجيل الدخول بنجاح.');
        onClose();
        window.location.assign('/');
        return;
      }
    } catch (error) {
      const details = error instanceof Error ? error.message : 'تعذر إكمال الطلب.';
      console.error('Authentication error:', error);
      setMessage(details);
      alert(`حدث خطأ: ${details}`);
    }
    finally { setBusy(false); }
  };

  return <div className="auth-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
    <button className="auth-close" onClick={onClose} aria-label="إغلاق">×</button><div className="auth-brand"><img src="/logo.png" alt="AYOUBIA Logo" /></div>
    <div className="auth-tabs"><button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setMessage(''); }}>تسجيل الدخول</button><button className={mode === 'signup' ? 'active' : ''} onClick={() => { setMode('signup'); setMessage(''); }}>إنشاء حساب</button></div>
    <h2 id="auth-title">{mode === 'signup' ? 'مرحباً بك في AYOUBIA' : 'سجّلي الدخول إلى حسابك'}</h2>
    <div className="google-actions"><button disabled={busy} onClick={google}><GoogleMark />تسجيل الدخول باستخدام Google</button><button disabled={busy} onClick={google}><GoogleMark />إنشاء حساب باستخدام Google</button></div>
    <div className="form-divider"><span>أو بالبريد الإلكتروني</span></div>
    <form className="auth-form" onSubmit={submit}>
      {mode === 'signup' && <div className="field-row"><label>الاسم<input name="firstName" required placeholder="الاسم" autoComplete="given-name" /></label><label>اللقب<input name="lastName" required placeholder="اللقب" autoComplete="family-name" /></label></div>}
      <label>البريد الإلكتروني<input name="email" type="email" required placeholder="name@example.com" autoComplete="email" dir="ltr" /></label>
      {mode === 'signup' && <><label>رقم الهاتف<div className="phone-input" dir="ltr"><select name="countryCode" aria-label="رمز الدولة"><option value="+213">🇩🇿 +213</option><option value="+33">🇫🇷 +33</option></select><input name="phone" type="tel" required placeholder="رقم الهاتف" autoComplete="tel-national" /></div></label><label>رقم هاتف ثانٍ <small>(اختياري)</small><input name="phone2" type="tel" placeholder="رقم هاتف إضافي" dir="ltr" /></label></>}
      <label>كلمة المرور<input name="password" type="password" minLength={8} required placeholder="8 أحرف على الأقل" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} dir="ltr" /></label>
      {mode === 'signup' && <><label>تأكيد كلمة المرور<input name="confirmPassword" type="password" minLength={8} required placeholder="أعيدي كتابة كلمة المرور" dir="ltr" /></label><label className="terms-check"><input name="terms" type="checkbox" required /><span>أوافق على شروط الخصوصية وسياسة الاستخدام</span></label></>}
      {message && <p className={`auth-message${message.includes('تم ') ? ' success' : ''}`} role="status">{message}</p>}
      <button className="button button-green auth-submit" disabled={busy}>{busy ? mode === 'signup' ? 'جاري الإنشاء...' : 'جارٍ تسجيل الدخول…' : mode === 'signup' ? 'إنشاء حساب' : 'تسجيل الدخول'}</button>
    </form>
  </section></div>;
}

function GoogleMark() { return <svg className="google-mark" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.52h3.23c1.89-1.74 2.99-4.3 2.99-7.37Z"/><path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.63-2.4l-3.23-2.52c-.9.6-2.05.96-3.4.96-2.61 0-4.82-1.76-5.61-4.12H3.05v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.39 13.92A6.01 6.01 0 0 1 6.08 12c0-.67.12-1.32.31-1.92v-2.6H3.05A10 10 0 0 0 2 12c0 1.62.39 3.15 1.05 4.52l3.34-2.6Z"/><path fill="#EA4335" d="M12 5.96c1.47 0 2.79.5 3.83 1.52l2.88-2.88C16.97 2.98 14.7 2 12 2a10 10 0 0 0-8.95 5.48l3.34 2.6C7.18 7.72 9.39 5.96 12 5.96Z"/></svg>; }
