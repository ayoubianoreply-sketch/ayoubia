'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import StorefrontHeader from '@/components/StorefrontHeader';
import StorefrontFooter from '@/components/StorefrontFooter';
import { useLocale } from '@/components/LocaleProvider';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { openAuth } from '@/lib/store-events';

type Profile = { first_name: string | null; last_name: string | null; phone: string | null; avatar_url: string | null; points: number };

export default function AccountPage() {
  const { locale } = useLocale();
  const ar = locale === 'ar';
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadFailed, setUploadFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const supabase = createBrowserSupabaseClient();
    void supabase.auth.getSession().then(async ({ data, error: authError }) => {
      if (!active) return;
      if (authError) { setError(authError.message); setLoading(false); return; }
      const currentUser = data.session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const { data: profileData, error: profileError } = await supabase.from('profiles')
          .select('first_name,last_name,phone,avatar_url,points').eq('id', currentUser.id).maybeSingle();
        if (!active) return;
        if (profileError) setError(profileError.message);
        setProfile(profileData as Profile | null);
      }
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const text = (arabic: string, french: string) => ar ? arabic : french;
  const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ');

  async function uploadAvatar(file?: File) {
    if (!file || !user) return;
    setUploadMessage(''); setUploadFailed(false); setUploading(true);
    try {
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw new Error(text('اختر صورة PNG أو JPG أو WebP.', 'Choisissez une image PNG, JPG ou WebP.'));
      if (file.size > 5 * 1024 * 1024) throw new Error(text('يجب ألا يتجاوز حجم الصورة 5 ميغابايت.', 'L’image ne doit pas dépasser 5 Mo.'));
      const supabase = createBrowserSupabaseClient();
      const ext = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const { data: saved, error: saveError } = await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id).select('first_name,last_name,phone,avatar_url,points').single();
      if (saveError) throw saveError;
      setProfile(saved as Profile);
      window.dispatchEvent(new Event('ayoubia:profile-updated'));
      setUploadMessage(text('تم تحديث الصورة الشخصية.', 'Photo de profil mise à jour.'));
    } catch (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      setUploadFailed(true);
      setUploadMessage(uploadError instanceof Error ? uploadError.message : text('تعذر رفع الصورة.', 'Impossible de télécharger l’image.'));
    } finally { setUploading(false); }
  }

  return <>
    <StorefrontHeader />
    <main className="account-page" dir={ar ? 'rtl' : 'ltr'}>
      <span className="eyebrow">AYOUBIA · {text('حسابي', 'MON COMPTE')}</span>
      <h1>{text('ملفي الشخصي', 'Mon profil')}</h1>
      {loading ? <p>{text('جارٍ تحميل بياناتك…', 'Chargement de votre profil…')}</p> : user ? <section className="account-profile-card">
        <div className="account-profile-avatar">{profile?.avatar_url ? <img src={profile.avatar_url} alt={text('الصورة الشخصية','Photo de profil')} /> : name.trim()[0] || user.email?.[0]?.toUpperCase() || 'A'}</div>
        <label className="avatar-upload-button">{uploading ? text('جارٍ رفع الصورة…', 'Téléchargement…') : text('تغيير الصورة الشخصية', 'Changer la photo de profil')}<input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading} onChange={(event) => { void uploadAvatar(event.target.files?.[0]); event.currentTarget.value = ''; }} /></label>
        {uploadMessage && <p className={uploadFailed ? 'account-error' : 'account-upload-success'} role="status">{uploadMessage}</p>}
        <div><small>{text('الاسم الكامل', 'Nom complet')}</small><strong>{name || user.user_metadata?.name || '—'}</strong></div>
        <div><small>{text('البريد الإلكتروني', 'Adresse e-mail')}</small><strong dir="ltr">{user.email || '—'}</strong></div>
        <div><small>{text('رقم الهاتف', 'Téléphone')}</small><strong dir="ltr">{profile?.phone || '—'}</strong></div>
        <div className="account-points"><small>{text('نقاط الولاء', 'Points fidélité')}</small><strong>{new Intl.NumberFormat(ar ? 'ar-DZ' : 'fr-DZ').format(profile?.points || 0)}</strong></div>
        {error && <p className="account-error" role="status">{text('تعذر تحميل بعض بيانات الحساب:', 'Certaines données n’ont pas pu être chargées :')} {error}</p>}
        <a className="button button-green" href="/track">{text('تتبع طلباتي', 'Suivre mes commandes')} <span>{ar ? '←' : '→'}</span></a>
      </section> : <section className="account-profile-card account-signed-out">
        <p>{text('سجّل الدخول لعرض ملفك الشخصي.', 'Connectez-vous pour consulter votre profil.')}</p>
        <button className="button button-green" onClick={openAuth}>{text('تسجيل الدخول', 'Se connecter')}</button>
      </section>}
    </main>
    <StorefrontFooter />
  </>;
}
