'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

type Profile = { first_name: string | null; last_name: string | null; phone: string | null };

export default function ProfileOnboardingGate() {
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [profileDraft, setProfileDraft] = useState({ first_name: '', last_name: '', phone: '' });
  const sessionRef = useRef<Session | null>(null);
  const clientRef = useRef<ReturnType<typeof createBrowserSupabaseClient> | null>(null);
  const checkId = useRef(0);
  const savingProfile = useRef(false);

  const inspectProfile = useCallback(async (session: Session | null) => {
    sessionRef.current = session;
    // updateUser emits an auth event before the profiles upsert finishes; don't
    // let that intermediate event close the form or replace its save result.
    if (savingProfile.current) return;
    const id = ++checkId.current;
    if (!session) {
      setProfileCompleted(false);
      setIsProfileLoading(false);
      return;
    }
    setIsProfileLoading(true);
    try {
      const client = clientRef.current ?? createBrowserSupabaseClient();
      clientRef.current = client;
      const { data, error } = await client.from('profiles')
        .select('first_name,last_name,phone')
        .eq('id', session.user.id)
        .maybeSingle();
      if (id !== checkId.current) return;
      if (error) throw error;
      const profile = data as Profile | null;
      const metadata = session.user.user_metadata ?? {};
      const fullName = String(metadata.full_name ?? metadata.name ?? '').trim().split(/\s+/);
      setProfileDraft({
        first_name: profile?.first_name?.trim() || String(metadata.first_name ?? metadata.given_name ?? fullName[0] ?? ''),
        last_name: profile?.last_name?.trim() || String(metadata.last_name ?? metadata.family_name ?? fullName.slice(1).join(' ')),
        phone: profile?.phone?.trim() || String(metadata.phone ?? session.user.phone ?? ''),
      });
      const profileComplete = Boolean(profile?.first_name?.trim() && profile?.last_name?.trim() && profile?.phone?.trim());
      setProfileCompleted(profileComplete);
      setMessage('');
    } catch (error) {
      if (id !== checkId.current) return;
      console.error('Error loading profile:', error);
      // Keep the site usable if Supabase is not configured in local demo mode.
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
        setProfileCompleted(false);
        setMessage(error instanceof Error ? `تعذر التحقق من الملف الشخصي: ${error.message}` : 'تعذر التحقق من الملف الشخصي.');
      }
    } finally {
      if (id === checkId.current) setIsProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isProfileLoading || (sessionRef.current && !profileCompleted)) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = previousOverflow; };
    }
  }, [isProfileLoading, profileCompleted]);

  useEffect(() => {
    let client: ReturnType<typeof createBrowserSupabaseClient>;
    try {
      client = createBrowserSupabaseClient();
      clientRef.current = client;
    } catch {
      setIsProfileLoading(false);
      return;
    }

    let active = true;
    void client.auth.getSession().then(({ data, error }) => {
      if (active && !error) void inspectProfile(data.session);
      else if (active) setIsProfileLoading(false);
    });
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      // Defer Supabase queries until after its auth callback has returned.
      window.setTimeout(() => { if (active) void inspectProfile(session); }, 0);
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [inspectProfile]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const firstName = String(form.get('first_name') ?? '').trim();
    const lastName = String(form.get('last_name') ?? '').trim();
    const phone = String(form.get('phone') ?? '').trim();
    const password = String(form.get('password') ?? '');
    const confirmation = String(form.get('confirm_password') ?? '');
    if (!firstName || !lastName || !phone) { setMessage('يرجى إكمال جميع البيانات المطلوبة.'); return; }
    if (password.length < 8) { setMessage('يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.'); return; }
    if (password !== confirmation) { setMessage('كلمتا المرور غير متطابقتين.'); return; }
    const session = sessionRef.current;
    if (!session) { setMessage('انتهت جلسة الدخول. يرجى تسجيل الدخول مجدداً.'); return; }

    setBusy(true);
    savingProfile.current = true;
    setMessage('');
    try {
      const client = clientRef.current ?? createBrowserSupabaseClient();
      const { error: passwordError } = await client.auth.updateUser({
        password,
        data: { first_name: firstName, last_name: lastName, phone },
      });
      if (passwordError) {
        console.error('Error updating account password:', passwordError);
        alert(`حدث خطأ أثناء تحديث كلمة المرور: ${passwordError.message}`);
        setMessage(`تعذر تحديث كلمة المرور: ${passwordError.message}`);
        return;
      }
      const { data, error: profileError } = await client.from('profiles').upsert({
        id: session.user.id,
        first_name: firstName,
        last_name: lastName,
        phone,
      }, { onConflict: 'id' }).select();
      if (profileError) {
        console.error('Error saving profile:', profileError);
        alert(`حدث خطأ أثناء حفظ البيانات: ${profileError.message}`);
        setMessage(`تعذر حفظ البيانات: ${profileError.message}`);
        return;
      }
      if (!data?.length) {
        const error = new Error('لم تُرجع قاعدة البيانات الملف الشخصي بعد الحفظ.');
        console.error('Error saving profile:', error);
        alert(`حدث خطأ أثناء حفظ البيانات: ${error.message}`);
        setMessage(error.message);
        return;
      }
      const saved = data[0] as Profile;
      if (!saved.first_name?.trim() || !saved.last_name?.trim() || !saved.phone?.trim()) {
        const error = new Error('تم تنفيذ الحفظ لكن البيانات المؤكدة من قاعدة البيانات غير مكتملة.');
        console.error('Error saving profile:', error);
        alert(`حدث خطأ أثناء حفظ البيانات: ${error.message}`);
        setMessage(error.message);
        return;
      }
      setProfileCompleted(true);
      setProfileDraft({ first_name: firstName, last_name: lastName, phone });
      setIsProfileLoading(false);
      setMessage('');
    } catch (error) {
      console.error('Error completing profile:', error);
      const details = error instanceof Error ? error.message : 'تعذر حفظ البيانات. حاول مرة أخرى.';
      alert(`حدث خطأ أثناء إكمال الملف الشخصي: ${details}`);
      setMessage(`تعذر حفظ البيانات: ${details}`);
    } finally {
      savingProfile.current = false;
      setBusy(false);
    }
  };

  // Never render the onboarding form until the active session's profile check completes.
  if (isProfileLoading || !sessionRef.current || profileCompleted) return null;

  return <div className="profile-onboarding-backdrop" dir="rtl" role="presentation" onKeyDown={(event) => {
    if (event.key !== 'Tab') return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled)'));
    if (!controls.length) return;
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }}>
    <section className="profile-onboarding-modal" role="dialog" aria-modal="true" aria-labelledby="profile-onboarding-title">
      <img className="profile-onboarding-logo" src="/logo.png" alt="AYOUBIA" />
      <>
        <span className="profile-onboarding-kicker">خطوة أخيرة</span>
        <h1 id="profile-onboarding-title">أكملي ملفك الشخصي</h1>
        <p>أضيفي بياناتك لإنهاء إعداد الحساب ومتابعة التسوق.</p>
        <form className="profile-onboarding-form" onSubmit={submit}>
          <div className="profile-onboarding-row">
            <label>الاسم<input name="first_name" value={profileDraft.first_name} onChange={(event) => setProfileDraft((current) => ({ ...current, first_name: event.target.value }))} autoComplete="given-name" autoFocus required /></label>
            <label>اللقب<input name="last_name" value={profileDraft.last_name} onChange={(event) => setProfileDraft((current) => ({ ...current, last_name: event.target.value }))} autoComplete="family-name" required /></label>
          </div>
          <label>رقم الهاتف<input name="phone" type="tel" value={profileDraft.phone} onChange={(event) => setProfileDraft((current) => ({ ...current, phone: event.target.value }))} autoComplete="tel" dir="ltr" required /></label>
          <label>كلمة المرور<input name="password" type="password" minLength={8} autoComplete="new-password" dir="ltr" required /></label>
          <label>تأكيد كلمة المرور<input name="confirm_password" type="password" minLength={8} autoComplete="new-password" dir="ltr" required /></label>
          {message && <p className="profile-onboarding-message" role="alert">{message}</p>}
          <button className="button button-green" disabled={busy}>{busy ? 'جارٍ الحفظ…' : 'حفظ ومتابعة'}</button>
        </form>
      </>
    </section>
  </div>;
}
