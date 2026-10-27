'use client';

import { FormEvent, useState } from 'react';
import StorefrontFooter from '@/components/StorefrontFooter';
import StorefrontHeader from '@/components/StorefrontHeader';
import { useLocale } from '@/components/LocaleProvider';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

export default function CareersPage() {
  const { locale } = useLocale();
  const ar = locale === 'ar';
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const text = (arabic: string, french: string) => ar ? arabic : french;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get('cv');
    setBusy(true); setMessage(''); setSubmitted(false);
    try {
      if (!(file instanceof File) || file.size === 0) throw new Error(text('يرجى إرفاق السيرة الذاتية بصيغة PDF.', 'Veuillez joindre votre CV au format PDF.'));
      if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) throw new Error(text('نقبل ملفات PDF فقط.', 'Seuls les fichiers PDF sont acceptés.'));
      if (file.size > 10 * 1024 * 1024) throw new Error(text('يجب ألا يتجاوز حجم الملف 10 ميغابايت.', 'Le fichier ne doit pas dépasser 10 Mo.'));

      const supabase = createBrowserSupabaseClient();
      const cvPath = `applications/${crypto.randomUUID()}.pdf`;
      const { error: uploadError } = await supabase.storage.from('cvs').upload(cvPath, file, { contentType: 'application/pdf', upsert: false });
      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from('job_applications').insert({
        full_name: String(data.get('fullName')).trim(),
        email: String(data.get('email')).trim(),
        phone: String(data.get('phone')).trim(),
        position: String(data.get('position')).trim(),
        cv_path: cvPath,
      });
      if (insertError) throw insertError;
      setSubmitted(true);
      setMessage(text('وصل طلبك بنجاح. شكراً لاهتمامك بالانضمام إلى AYOUBIA.', 'Votre candidature a bien été envoyée. Merci de votre intérêt pour AYOUBIA.'));
      form.reset();
    } catch (error) {
      console.error('Error submitting job application:', error);
      setMessage(error instanceof Error ? error.message : text('تعذر إرسال الطلب. حاول مرة أخرى.', 'Impossible d’envoyer votre candidature. Réessayez.'));
    } finally { setBusy(false); }
  }

  return <>
    <StorefrontHeader />
    <main className="careers-page" dir={ar ? 'rtl' : 'ltr'}>
      <header className="careers-hero">
        <span className="eyebrow">AYOUBIA HOME · {text('فرص مهنية', 'CARRIÈRES')}</span>
        <h1>{text('اصنع معنا مساحة أجمل', 'Créons ensemble de beaux intérieurs')}</h1>
        <p>{text('نؤمن أن كل تجربة وخبرة تضيف قيمة إلى فريقنا. أرسل طلبك وسيراجعه فريق AYOUBIA عند توفر فرصة مناسبة.', 'Chaque expérience et chaque savoir-faire enrichissent notre équipe. Envoyez votre candidature ; notre équipe l’étudiera lorsqu’un poste adapté sera disponible.')}</p>
      </header>

      <section className="careers-content">
        <div className="careers-intro">
          <span className="about-eyebrow">{text('العمل في AYOUBIA', 'REJOINDRE AYOUBIA')}</span>
          <h2>{text('فريق يهتم بالتفاصيل', 'Une équipe attentive aux détails')}</h2>
          <p>{text('نعمل في عالم الأثاث والمفروشات والديكور، ونسعى إلى تقديم تجربة راقية لعملائنا. نرحب بأصحاب المهارات في المبيعات، والتصميم، والخياطة، وخدمة العملاء، واللوجستيك.', 'Nous évoluons dans l’univers du mobilier, du linge de maison et de la décoration. Nous accueillons les profils de la vente, du design, de la couture, du service client et de la logistique.')}</p>
          <a href="mailto:Ayoubia.Careers@gmail.com">Ayoubia.Careers@gmail.com</a>
        </div>

        <form className="careers-form" onSubmit={submit}>
          <h2>{text('قدّم طلبك', 'Déposer une candidature')}</h2>
          <label>{text('الاسم الكامل', 'Nom complet')}<input name="fullName" required minLength={2} maxLength={150} autoComplete="name" /></label>
          <label>{text('البريد الإلكتروني', 'Adresse e-mail')}<input name="email" type="email" required maxLength={254} autoComplete="email" /></label>
          <label>{text('رقم الهاتف', 'Téléphone')}<input name="phone" type="tel" required minLength={8} maxLength={24} autoComplete="tel" /></label>
          <label>{text('الوظيفة المطلوبة', 'Poste souhaité')}<input name="position" required minLength={2} maxLength={160} placeholder={text('مثال: مستشار مبيعات', 'Ex. : conseiller·ère de vente')} /></label>
          <label className="cv-field">{text('السيرة الذاتية (PDF)', 'CV (PDF)')}<input name="cv" type="file" accept="application/pdf,.pdf" required /><small>{text('ملف PDF فقط، بحد أقصى 10 ميغابايت.', 'PDF uniquement, 10 Mo maximum.')}</small></label>
          <button className="button button-green" type="submit" disabled={busy}>{busy ? text('جارٍ إرسال الطلب…', 'Envoi en cours…') : text('إرسال الطلب', 'Envoyer ma candidature')} <span>{ar ? '←' : '→'}</span></button>
          {message && <p className={`careers-message ${submitted ? 'success' : 'error'}`} role="status">{message}</p>}
        </form>
      </section>
    </main>
    <StorefrontFooter />
  </>;
}
