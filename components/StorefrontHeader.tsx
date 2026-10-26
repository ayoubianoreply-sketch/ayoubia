'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { openAuth, openCart } from '@/lib/store-events';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { useLocale } from '@/components/LocaleProvider';

export default function StorefrontHeader() {
  const { locale, setLocale } = useLocale();
  const [count, setCount] = useState(0);
  const [logoUrl, setLogoUrl] = useState('/logo.png');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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
      <a className="icon-link search-icon" href="/#branches" aria-label="بحث"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></svg></a>
      <button className="icon-link" type="button" onClick={openAuth} aria-label="حساب المستخدم"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.7-3.5 3.2-5.3 7-5.3s6.3 1.8 7 5.3"/></svg></button>
      <button className="icon-link cart-trigger" type="button" onClick={openCart} aria-label="سلة التسوق"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 8h13l1.2 12H4.3L5.5 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>{count > 0 && <small>{count}</small>}</button>
      <Link className="nav-track-link" href="/track" aria-label={locale === 'ar' ? 'تتبع طلبي' : 'Suivre ma commande'}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5h16v14H4z"/><path d="M8 9h8M8 12.5h5"/><path d="m14.5 16 1.5 1.5 3-3"/></svg>
        <span>{locale === 'ar' ? 'تتبع طلبي' : 'Suivre ma commande'}</span>
      </Link>
      <button className="mobile-menu-toggle" type="button" onClick={() => setMobileNavOpen((open) => !open)} aria-label={mobileNavOpen ? (locale === 'ar' ? 'إغلاق القائمة' : 'Fermer le menu') : (locale === 'ar' ? 'فتح القائمة' : 'Ouvrir le menu')} aria-expanded={mobileNavOpen}>
        {mobileNavOpen ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>}
      </button>
      <button className="locale-toggle" type="button" onClick={() => setLocale(locale === 'ar' ? 'fr' : 'ar')} aria-label="Changer la langue / تغيير اللغة">{locale === 'ar' ? 'FR' : 'عربي'}</button>
    </div>
    <div className={`nav-links${mobileNavOpen ? ' mobile-open' : ''}`}>
      <Link href="/" onClick={() => setMobileNavOpen(false)}>{locale === 'ar' ? 'الرئيسية' : 'Accueil'}</Link>
      <Link href="/branch/literie" onClick={() => setMobileNavOpen(false)}>{locale === 'ar' ? 'أيوبيا مستلزمات الفراش' : 'Ayoubia Literie'}</Link>
      <Link href="/branch/salon" onClick={() => setMobileNavOpen(false)}>{locale === 'ar' ? 'أيوبيا صالون' : 'Ayoubia Salon'}</Link>
      <Link href="/about" onClick={() => setMobileNavOpen(false)}>{locale === 'ar' ? 'من نحن' : 'À propos'}</Link>
    </div>
    <Link href="/" className="brand" aria-label="AYOUBIA الصفحة الرئيسية"><img src={logoUrl} alt="AYOUBIA Logo" /></Link>
  </nav></header>;
}
