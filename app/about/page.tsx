'use client';

import StorefrontFooter from '@/components/StorefrontFooter';
import StorefrontHeader from '@/components/StorefrontHeader';
import { useLocale } from '@/components/LocaleProvider';
import { aboutTranslations } from '@/lib/i18n/about';

const arabicStory = [
  'في AYOUBIA HOME، نؤمن أن المنزل ليس مجرد مساحة للعيش، بل عالم يعكس الذوق، ويجسّد الراحة، وتُصنع بين تفاصيله أجمل اللحظات.',
  'انطلقت رحلتنا من خبرة ميدانية في عالم الصالونات والأثاث المنزلي، وتجهيز الشقق والفلل، لنطوّر رؤيتنا نحو عالم متكامل يجمع بين الأناقة والجودة والتميز في كل تفاصيل المنزل.',
  'اليوم، نعمل على تقديم تجربة متكاملة تشمل الصالونات والأثاث، والستائر، والمفروشات المنزلية، وأغطية الأسرّة، والديكور، مع الحرص على اختيار منتجات تجمع بين جمال التصميم، وجودة الخامات، وخصوصية الأذواق.',
  'في AYOUBIA HOME، لا نكتفي بتقديم المنتجات، بل نسعى إلى إلهام عملائنا، ومرافقتهم في تحويل مساحاتهم إلى منازل تنبض بالجمال والراحة والرقي.',
  'نحن فريق يؤمن بأن التميز رحلة مستمرة، وأن الثقة تُبنى بالجودة، والمصداقية، والاهتمام بأدق التفاصيل. لذلك نواصل التطور، ونسعى إلى تقديم الأفضل، بخطوات مدروسة وطموح لا يتوقف.',
  'طموحنا أن نصبح من العلامات الرائدة في عالم تجهيز وتأثيث المنازل في الجزائر، وأن يكون اسم AYOUBIA HOME',
];

const frenchStory = [
  'Chez AYOUBIA HOME, nous croyons que la maison est bien plus qu’un espace de vie : c’est un univers qui reflète le goût, incarne le confort et accueille les plus beaux moments.',
  'Notre aventure est née d’une expérience de terrain dans l’univers des salons et du mobilier, ainsi que dans l’aménagement d’appartements et de villas. Cette expérience a nourri une vision complète, où élégance, qualité et attention aux détails se rencontrent.',
  'Aujourd’hui, nous proposons une expérience qui englobe les salons et le mobilier, les rideaux, le linge de maison, le linge de lit et la décoration, avec une sélection attentive de produits aux beaux designs, aux matières de qualité et aux styles variés.',
  'Chez AYOUBIA HOME, nous ne nous limitons pas à proposer des produits : nous souhaitons inspirer nos clients et les accompagner pour transformer leurs espaces en intérieurs empreints de beauté, de confort et de raffinement.',
  'Notre équipe croit que l’excellence est un chemin continu et que la confiance se construit par la qualité, la transparence et le soin apporté aux moindres détails. Nous continuons ainsi à évoluer et à rechercher le meilleur, avec ambition et méthode.',
  'Notre ambition est de devenir une marque de référence dans l’aménagement et l’ameublement des maisons en Algérie, et de faire du nom AYOUBIA HOME',
];

const mapSrc = 'https://maps.google.com/maps?q=35.7099375%2C4.5394531&z=16&output=embed';

export default function AboutPage() {
  const { locale } = useLocale();
  const isArabic = locale === 'ar';
  const paragraphs = isArabic ? arabicStory : frenchStory;
  const ceoName = aboutTranslations[locale].ceoName;

  return <>
    <StorefrontHeader />
    <main className="about-page" dir={isArabic ? 'rtl' : 'ltr'}>
      <header className="about-hero">
        <span className="about-eyebrow">AYOUBIA HOME&nbsp; · &nbsp;{isArabic ? 'من نحن' : 'À PROPOS'}</span>
        <h1>{isArabic ? 'حكايتنا تبدأ من المنزل' : 'Notre histoire commence à la maison'}</h1>
        <p>{paragraphs[0]}</p>
      </header>

      <article className="about-story">
        {paragraphs.slice(1).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      </article>

      <section className="about-ceo" aria-label={isArabic ? 'المدير التنفيذي' : 'Direction générale'}>
        <div className="about-ceo-photo"><img src="/me.png" alt={isArabic ? 'المدير التنفيذي لشركة AYOUBIA HOME' : 'Directeur général de AYOUBIA HOME'} /></div>
        <div className="about-ceo-copy">
          <span className="about-eyebrow">{isArabic ? 'قيادة ورؤية' : 'DIRECTION & VISION'}</span>
          <h2>{isArabic ? 'المدير التنفيذي (CEO)' : 'Directeur exécutif (CEO)'}</h2>
          <p className="about-ceo-name">{ceoName}</p>
          <p>AYOUBIA HOME</p>
        </div>
      </section>

      <section className="about-location">
        <div className="about-location-heading">
          <span className="about-eyebrow">{isArabic ? 'زورونا' : 'RENDEZ-NOUS VISITE'}</span>
          <h2>{isArabic ? 'موقع متجرنا' : 'Notre emplacement'}</h2>
          <p><a href="https://maps.app.goo.gl/8iQSmkaX7TqRYcbH6" target="_blank" rel="noreferrer">Ayoubia Home</a></p>
        </div>
        <div className="about-map">
          <iframe src={mapSrc} title={isArabic ? 'أيوب للافرشة العصرية Golden House على خرائط Google' : 'Golden House sur Google Maps'} width="100%" height="450" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      </section>
    </main>
    <StorefrontFooter />
  </>;
}
