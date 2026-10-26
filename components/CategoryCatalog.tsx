'use client';

import Link from 'next/link';
import AddToCartButton from '@/components/AddToCartButton';
import StorefrontHeader from '@/components/StorefrontHeader';
import StorefrontFooter from '@/components/StorefrontFooter';
import { useLocale } from '@/components/LocaleProvider';

type CatalogProduct = { id: number | string; name_ar: string; name_fr?: string; price_dzd: number; image_url?: string; description_ar?: string; description_fr?: string };
type CatalogCategory = { name_ar: string; name_fr?: string; subtitle_ar?: string; subtitle_fr?: string; image_url: string };

export default function CategoryCatalog({ category, products }: { category: CatalogCategory; products: CatalogProduct[] }) {
  const { locale } = useLocale();
  const ar = locale === 'ar';
  const name = ar ? category.name_ar : category.name_fr || category.name_ar;
  const price = (amount: number) => `${new Intl.NumberFormat(ar ? 'ar-DZ' : 'fr-DZ').format(amount)} ${ar ? 'دج' : 'DA'}`;
  return <><StorefrontHeader /><main className="category-page">
    <div className="category-crumb"><Link href="/">{ar ? 'الرئيسية' : 'Accueil'}</Link><span>／</span><span>{name}</span></div>
    <section className="category-hero"><img src={category.image_url} alt="" /><div><span className="eyebrow">AYOUBIA</span><h1>{name}</h1><p>{ar ? category.subtitle_ar || 'تصفّحي منتجات هذا القسم المختارة بعناية.' : category.subtitle_fr || 'Découvrez notre sélection soigneusement choisie.'}</p></div></section>
    <section className="category-products"><div className="section-heading"><div><span className="eyebrow">{ar ? 'مختارة بعناية' : 'Notre sélection'}</span><h2>{ar ? 'تسوّقي المجموعة' : 'Explorer la collection'}</h2></div><span className="category-count">{products.length} {ar ? 'منتج' : 'produits'}</span></div>
      <div className="product-grid category-product-grid">{products.map((product) => <article className="product-card" key={product.id}><Link className="product-image" href={`/checkout/${encodeURIComponent(product.id)}`}><img src={product.image_url || category.image_url} alt={ar ? product.name_ar : product.name_fr || product.name_ar} /><span className="product-badge">{ar ? 'اختيار مميز' : 'Sélection'}</span></Link><div className="product-info"><small>{name}</small><h3>{ar ? product.name_ar : product.name_fr || product.name_ar}</h3><p className="mock-product-description">{ar ? product.description_ar : product.description_fr || product.description_ar}</p><div className="product-bottom"><strong>{price(product.price_dzd)}</strong><Link className="shop-button" href={`/checkout/${encodeURIComponent(product.id)}`}>{ar ? 'تسوّق الآن' : 'Acheter'} <span>←</span></Link><AddToCartButton product={{ id: product.id, name_ar: product.name_ar, price_dzd: product.price_dzd, image_url: product.image_url || category.image_url }} /></div></div></article>)}</div>
    </section>
  </main><StorefrontFooter /></>;
}
