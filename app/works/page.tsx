'use client';

import { useEffect, useMemo, useState } from 'react';
import StorefrontFooter from '@/components/StorefrontFooter';
import StorefrontHeader from '@/components/StorefrontHeader';
import { useLocale } from '@/components/LocaleProvider';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

type WorkCategory = 'apartments_villas' | 'bedding_covers';
type Work = { id: number | string; category: WorkCategory; image_url: string; description: string; created_at?: string };

const samples: Work[] = [
  { id: 'sample-apartment-1', category: 'apartments_villas', image_url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=85&w=1200&auto=format&fit=crop', description: 'تجهيز متكامل لمساحة عائلية تجمع الراحة والأناقة.' },
  { id: 'sample-apartment-2', category: 'apartments_villas', image_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=85&w=1200&auto=format&fit=crop', description: 'تفاصيل دافئة وأثاث مختار بعناية لفيلا عصرية.' },
  { id: 'sample-bedding-1', category: 'bedding_covers', image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=85&w=1200&auto=format&fit=crop', description: 'مفروشات وأغطية سرير بخامات ناعمة وألوان هادئة.' },
  { id: 'sample-bedding-2', category: 'bedding_covers', image_url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=85&w=1200&auto=format&fit=crop', description: 'تنسيق أنيق لغرفة نوم مريحة بتفاصيل راقية.' },
];

const categoryOptions: { id: WorkCategory; ar: string; fr: string }[] = [
  { id: 'apartments_villas', ar: 'تجهيزات الشقق والفلل', fr: 'Appartements & Villas' },
  { id: 'bedding_covers', ar: 'تجهيزات الأفرشة والأغطية', fr: 'Literie & Couvertures' },
];

export default function WorksPage() {
  const { locale } = useLocale();
  const ar = locale === 'ar';
  const [activeCategory, setActiveCategory] = useState<WorkCategory>('apartments_villas');
  const [works, setWorks] = useState<Work[]>(samples);

  useEffect(() => {
    let active = true;
    void createBrowserSupabaseClient().from('works').select('id,category,image_url,description,created_at').order('created_at', { ascending: false })
      .then(({ data }) => { if (active && data?.length) setWorks(data as Work[]); });
    return () => { active = false; };
  }, []);

  const visibleWorks = useMemo(() => works.filter((work) => work.category === activeCategory), [works, activeCategory]);

  return <>
    <StorefrontHeader />
    <main className="works-page" dir={ar ? 'rtl' : 'ltr'}>
      <header className="works-heading">
        <span className="about-eyebrow">AYOUBIA HOME · {ar ? 'من أعمالنا' : 'NOS RÉALISATIONS'}</span>
        <h1>{ar ? 'مساحات صُممت لتشبه أصحابها' : 'Des espaces qui vous ressemblent'}</h1>
        <p>{ar ? 'اكتشفوا نماذج من تجهيزاتنا وأعمالنا في الأثاث والمفروشات.' : 'Découvrez quelques-uns de nos projets d’ameublement et de literie.'}</p>
      </header>
      <div className="works-tabs" role="tablist" aria-label={ar ? 'تصنيف الأعمال' : 'Catégories de réalisations'}>
        {categoryOptions.map((option) => <button key={option.id} type="button" role="tab" aria-selected={activeCategory === option.id} className={activeCategory === option.id ? 'active' : ''} onClick={() => setActiveCategory(option.id)}>{ar ? option.ar : option.fr}</button>)}
      </div>
      <section className="works-grid" aria-live="polite">
        {visibleWorks.map((work) => {
          const sampleIndex = String(work.id).includes('2') ? 1 : 0;
          const frenchDescriptions = activeCategory === 'apartments_villas'
            ? ['Aménagement complet d’un espace familial entre confort et élégance.', 'Des détails chaleureux et un mobilier choisi pour une villa contemporaine.']
            : ['Linge de lit doux et matières de qualité dans des tons apaisants.', 'Une chambre élégante, pensée dans les moindres détails.'];
          return <article className="work-card" key={work.id}>
            <img src={work.image_url} alt={ar ? categoryOptions.find((item) => item.id === work.category)?.ar : categoryOptions.find((item) => item.id === work.category)?.fr} loading="lazy" />
            <p>{ar ? work.description : (String(work.id).startsWith('sample-') ? frenchDescriptions[sampleIndex] : work.description)}</p>
          </article>;
        })}
      </section>
      {!visibleWorks.length && <p className="works-empty">{ar ? 'ستُضاف أعمال هذا القسم قريباً.' : 'De nouvelles réalisations seront bientôt disponibles.'}</p>}
    </main>
    <StorefrontFooter />
  </>;
}
