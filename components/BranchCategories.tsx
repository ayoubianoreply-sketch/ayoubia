'use client';

import Link from 'next/link';
import StorefrontHeader from '@/components/StorefrontHeader';
import StorefrontFooter from '@/components/StorefrontFooter';
import { useLocale } from '@/components/LocaleProvider';
import type { StoreBranch, StoreBranchCategory } from '@/lib/mock-branches';

export default function BranchCategories({ branch, categories }: { branch: StoreBranch; categories: StoreBranchCategory[] }) {
  const { locale } = useLocale();
  const ar = locale === 'ar';
  const arrow = ar ? '←' : '→';
  return <>
    <StorefrontHeader />
    <main className="branch-page" dir={ar ? 'rtl' : 'ltr'}>
      <div className="branch-page-crumb"><Link href="/">{ar ? 'الرئيسية' : 'Accueil'}</Link><span>/</span><span>{ar ? branch.name_ar : branch.name_fr}</span></div>
      <header className={`branch-page-heading branch-${branch.slug}`}>
        <span>{branch.slug === 'literie' ? 'LITERIE' : 'SALON'}</span>
        <h1>{ar ? branch.name_ar : branch.name_fr}</h1>
        <p>{ar ? 'تصفحوا أقسام هذا الفرع.' : 'Parcourez les catégories de cet univers.'}</p>
      </header>
      <section className="branch-category-grid" aria-label={ar ? 'أقسام الفرع' : 'Catégories de cette branche'}>
        {categories.map((category) => <Link className="branch-category-card" href={`/category/${category.slug}`} key={category.id}>
          <span className="branch-category-image"><img src={category.image_url} alt="" /></span>
          <span className="branch-category-copy">
            <strong>{ar ? category.name_ar : category.name_fr || category.name_ar}</strong>
            {(ar ? category.subtitle_ar : category.subtitle_fr) && <small>{ar ? category.subtitle_ar : category.subtitle_fr}</small>}
            <i>{ar ? 'تصفح القسم' : 'Voir la catégorie'} <b>{arrow}</b></i>
          </span>
        </Link>)}
      </section>
    </main>
    <StorefrontFooter />
  </>;
}
