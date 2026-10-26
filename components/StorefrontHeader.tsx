'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { openAuth, openCart } from '@/lib/store-events';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

export default function StorefrontHeader() {
  const [count, setCount] = useState(0);
  const [logoUrl, setLogoUrl] = useState('/logo.png');
  useEffect(() => {
    try {
      const cart = JSON.parse(localStorage.getItem('ayoubia-cart') || '[]') as { quantity: number }[];
      setCount(cart.reduce((sum, item) => sum + item.quantity, 0));
    } catch { /* Ignore malformed stored cart data. */ }
    const onCount = (event: Event) => setCount((event as CustomEvent<number>).detail || 0);
    window.addEventListener('ayoubia:cart-count', onCount);
    return () => window.removeEventListener('ayoubia:cart-count', onCount);
  }, []);
  useEffect(() => {
    const loadLogo = async () => {
      try {
        const { data } = await createBrowserSupabaseClient().from('settings').select('value').eq('key', 'logo_url').maybeSingle();
        if (typeof data?.value === 'string' && data.value) setLogoUrl(data.value);
      } catch { /* Keep the local logo when public settings are unavailable. */ }
    };
    void loadLogo();
  }, []);

  return <header className="site-header"><nav className="navbar" aria-label="التنقل الرئيسي">
    <div className="nav-tools">
      <a className="icon-link search-icon" href="#products" aria-label="بحث"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></svg></a>
      <button className="icon-link" type="button" onClick={openAuth} aria-label="حساب المستخدم"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.7-3.5 3.2-5.3 7-5.3s6.3 1.8 7 5.3"/></svg></button>
      <button className="icon-link cart-trigger" type="button" onClick={openCart} aria-label="سلة التسوق"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 8h13l1.2 12H4.3L5.5 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>{count > 0 && <small>{count}</small>}</button>
      <a className="delivery" href="#shipping"><svg className="delivery-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 6.5h12v11h-12zM14.5 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="1.8"/><circle cx="18" cy="18" r="1.8"/></svg><span>توصيل لجميع الولايات <b>69 ولاية</b></span></a>
    </div>
    <div className="nav-links"><Link href="/">الرئيسية</Link><Link href="/category/salon">غرف الجلوس</Link><Link href="/category/chambres">غرف النوم</Link><Link href="/category/rideaux">الستائر</Link><Link href="/category/deco">الديكور</Link><a href="/#about">من نحن</a></div>
    <Link href="/" className="brand" aria-label="AYOUBIA الصفحة الرئيسية"><img src={logoUrl} alt="AYOUBIA Logo" /></Link>
  </nav></header>;
}
