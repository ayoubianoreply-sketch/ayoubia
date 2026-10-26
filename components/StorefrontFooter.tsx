'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

export default function StorefrontFooter() {
  const [logoUrl, setLogoUrl] = useState('/logo.png');
  useEffect(() => {
    const loadLogo = async () => {
      try {
        const { data } = await createBrowserSupabaseClient().from('settings').select('value').eq('key', 'logo_url').maybeSingle();
        if (typeof data?.value === 'string' && data.value) setLogoUrl(data.value);
      } catch { /* Keep the local logo when public settings are unavailable. */ }
    };
    void loadLogo();
  }, []);
  return <footer className="site-footer">
    <div className="footer-brand"><Link href="/" className="brand"><img src={logoUrl} alt="AYOUBIA Logo" /></Link><p>أناقة منزلك.. تبدأ من هنا</p></div>
    <div className="footer-socials" aria-label="تابعونا على شبكات التواصل الاجتماعي">
      <a href="https://www.facebook.com/profile.php?id=100063836632324&locale=fr_FR" aria-label="فيسبوك" target="_blank" rel="noreferrer"><svg viewBox="0 0 24 24"><path d="M14 8h3V4h-3c-3 0-5 2-5 5v2H6v4h3v5h4v-5h3l1-4h-4V9c0-.7.3-1 1-1Z"/></svg></a>
      <a href="https://www.instagram.com/ayoub_textille/?hl=ar" aria-label="إنستغرام" target="_blank" rel="noreferrer"><svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.7" cy="6.7" r=".8" className="social-fill"/></svg></a>
      <a className="whatsapp-link" href="https://wa.me/213666404303" aria-label="واتساب" target="_blank" rel="noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><path className="whatsapp-mark" d="M12 2.25A9.73 9.73 0 0 0 3.66 17l-1.3 4.75 4.87-1.28A9.75 9.75 0 1 0 12 2.25Zm0 17.65a7.87 7.87 0 0 1-4.01-1.1l-.29-.17-2.89.76.77-2.81-.19-.3A7.9 7.9 0 1 1 12 19.9Z"/><path className="whatsapp-phone" d="M9.03 7.7c-.2-.46-.4-.47-.6-.48h-.51c-.18 0-.47.07-.72.34s-.95.93-.95 2.27.97 2.63 1.1 2.81c.14.18 1.87 3 4.63 4.08 2.28.9 2.75.72 3.25.67.5-.04 1.61-.66 1.84-1.3.23-.63.23-1.17.16-1.28-.07-.12-.25-.19-.52-.32-.28-.14-1.62-.8-1.87-.89-.25-.1-.43-.14-.61.13-.18.27-.7.89-.86 1.07-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.34-.8-.72-1.34-1.61-1.5-1.88-.15-.27-.02-.42.12-.56.12-.12.27-.32.41-.48.13-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.6-1.48-.84-2.02Z"/></svg></a>
    </div>
    <Link className="tracking-footer-link" href="/track">تتبّعي طلبك</Link><small>© AYOUBIA 2026</small>
  </footer>;
}

