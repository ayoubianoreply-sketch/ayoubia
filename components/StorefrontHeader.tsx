'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { openAuth, openCart } from '@/lib/store-events';
import { useLocale } from '@/components/LocaleProvider';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

type HeaderProfile = { first_name: string; last_name: string; avatar_url: string | null };

export default function StorefrontHeader() {
  const { locale, setLocale } = useLocale();
  const [count, setCount] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<HeaderProfile | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
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
    let active = true;
    let requestId = 0;
    let supabase: ReturnType<typeof createBrowserSupabaseClient>;
    try { supabase = createBrowserSupabaseClient(); }
    catch { return; }

    const loadAccount = async (nextUser: User | null) => {
      const id = ++requestId;
      if (!active) return;
      setUser(nextUser);
      setAccountOpen(false);
      if (!nextUser) { setProfile(null); return; }
      const metadata = nextUser.user_metadata ?? {};
      const fullName = String(metadata.full_name ?? metadata.name ?? '').trim().split(/\s+/);
      const fallback = {
        first_name: String(metadata.first_name ?? metadata.given_name ?? fullName[0] ?? ''),
        last_name: String(metadata.last_name ?? metadata.family_name ?? fullName.slice(1).join(' ')),
        avatar_url: null,
      };
      setProfile(fallback);
      const { data, error } = await supabase.from('profiles').select('first_name,last_name,avatar_url').eq('id', nextUser.id).maybeSingle();
      if (!active || id !== requestId) return;
      if (error) console.error('Error loading navbar profile:', error);
      if (data) setProfile({ first_name: data.first_name || fallback.first_name, last_name: data.last_name || fallback.last_name, avatar_url: data.avatar_url || null });
    };

    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.error('Error reading auth session for navbar:', error);
      if (active) void loadAccount(data.session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => { if (active) void loadAccount(session?.user ?? null); }, 0);
    });
    const onProfileUpdated = () => {
      void supabase.auth.getSession().then(({ data }) => { if (active) void loadAccount(data.session?.user ?? null); });
    };

    const outsideClick = (event: MouseEvent) => {
      if (event.target instanceof Node && !accountRef.current?.contains(event.target)) setAccountOpen(false);
    };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setAccountOpen(false); };
    document.addEventListener('mousedown', outsideClick);
    document.addEventListener('keydown', escape);
    window.addEventListener('ayoubia:profile-updated', onProfileUpdated);
    return () => {
      active = false;
      subscription.unsubscribe();
      document.removeEventListener('mousedown', outsideClick);
      document.removeEventListener('keydown', escape);
      window.removeEventListener('ayoubia:profile-updated', onProfileUpdated);
    };
  }, []);

  const displayName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim()
    || String(user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email ?? 'AYOUBIA');
  const initials = ([profile?.first_name?.trim()[0], profile?.last_name?.trim()[0]].filter(Boolean).join('')
    || displayName.trim()[0] || 'A').toLocaleUpperCase();

  const logout = async () => {
    try {
      const { error } = await createBrowserSupabaseClient().auth.signOut();
      if (error) throw error;
      setAccountOpen(false);
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
      alert(error instanceof Error ? `تعذر تسجيل الخروج: ${error.message}` : 'تعذر تسجيل الخروج.');
    }
  };

  return <header className="site-header"><nav className="navbar" aria-label="التنقل الرئيسي">
    <div className="nav-tools">
      <a className="icon-link search-icon" href="/#branches" aria-label="بحث"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></svg></a>
      {user ? <div className="account-menu-wrap" ref={accountRef}>
        <button className="account-avatar" type="button" onClick={() => setAccountOpen((open) => !open)} aria-label={displayName} aria-expanded={accountOpen} aria-haspopup="menu">{profile?.avatar_url ? <img src={profile.avatar_url} alt="" /> : initials}</button>
        {accountOpen && <div className="account-dropdown" dir={locale === 'ar' ? 'rtl' : 'ltr'} role="menu">
          <div className="account-dropdown-heading"><strong>{displayName}</strong><small>{user.email}</small></div>
          <Link href="/account" role="menuitem" onClick={() => setAccountOpen(false)}>{locale === 'ar' ? 'ملفي الشخصي' : 'Mon profil'}</Link>
          <Link href="/track" role="menuitem" onClick={() => setAccountOpen(false)}>{locale === 'ar' ? 'طلباتي' : 'Mes commandes'}</Link>
          <button className="account-logout" type="button" role="menuitem" onClick={() => void logout()}>{locale === 'ar' ? 'تسجيل الخروج' : 'Déconnexion'}</button>
        </div>}
      </div> : <button className="icon-link" type="button" onClick={openAuth} aria-label="حساب المستخدم"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.7-3.5 3.2-5.3 7-5.3s6.3 1.8 7 5.3"/></svg></button>}
      <button className="icon-link cart-trigger" type="button" onClick={openCart} aria-label="سلة التسوق"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 8h13l1.2 12H4.3L5.5 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>{count > 0 && <small>{count}</small>}</button>
      <Link className="nav-track-link" href="/track" aria-label={locale === 'ar' ? 'تتبع طلبي' : 'Suivre ma commande'}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5h16v14H4z"/><path d="M8 9h8M8 12.5h5"/><path d="m14.5 16 1.5 1.5 3-3"/></svg>
        <span>{locale === 'ar' ? 'تتبع طلبي' : 'Suivre ma commande'}</span>
      </Link>
      <button className="locale-toggle" type="button" onClick={() => setLocale(locale === 'ar' ? 'fr' : 'ar')} aria-label="Changer la langue / تغيير اللغة">{locale === 'ar' ? 'FR' : 'عربي'}</button>
    </div>
    <div className="nav-links">
      <Link href="/">{locale === 'ar' ? 'الرئيسية' : 'Accueil'}</Link>
      <Link href="/branch/literie">{locale === 'ar' ? 'أيوبيا مستلزمات الفراش' : 'Ayoubia Literie'}</Link>
      <Link href="/branch/salon">{locale === 'ar' ? 'أيوبيا صالون' : 'Ayoubia Salon'}</Link>
      <Link href="/works">{locale === 'ar' ? 'أعمالنا' : 'Nos Réalisations'}</Link>
      <Link href="/about">{locale === 'ar' ? 'من نحن' : 'À propos'}</Link>
    </div>
    <Link href="/" className="brand" aria-label="AYOUBIA الصفحة الرئيسية"><img className="filter brightness-0" src="/logo.png" alt="AYOUBIA Logo" /></Link>
  </nav></header>;
}
