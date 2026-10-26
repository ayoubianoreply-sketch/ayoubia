'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import StorefrontHeader from '@/components/StorefrontHeader';
import StorefrontFooter from '@/components/StorefrontFooter';
import AddToCartButton from '@/components/AddToCartButton';
import { useLocale } from '@/components/LocaleProvider';
import { mockBranches, type StoreBranch } from '@/lib/mock-branches';

type Product = {
  id: number;
  name_ar: string;
  name_fr?: string;
  description_ar?: string;
  price_dzd: number;
  image_url?: string;
  categories?: { name_ar: string; name_fr?: string } | null;
};
type Promotion = { id: number; title: string; title_fr?: string; description?: string; description_fr?: string; image_url?: string };

const photos = {
  sofa: '/assets/reference/hero-sofa.png',
  room: '/assets/reference/category-living.png',
  bedroom: '/assets/reference/category-bedroom.png',
  literie: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=1200&auto=format&fit=crop',
  product1: '/assets/reference/product-268000.png',
  product2: '/assets/reference/product-6900.png',
  product3: '/assets/reference/product-12500.png',
  product4: '/assets/reference/product-48900.png',
  product5: '/assets/reference/product-165000.png',
};
const fallbackProducts: Product[] = [
  { id: 1, name_ar: 'طقم جلوس عصري', name_fr: 'Salon contemporain', price_dzd: 268000, image_url: photos.product1, categories: { name_ar: 'أيوبيا صالون', name_fr: 'Ayoubia Salon' } },
  { id: 2, name_ar: 'مخدات ديكور', name_fr: 'Coussins décoratifs', price_dzd: 6900, image_url: photos.product2, categories: { name_ar: 'أيوبيا صالون', name_fr: 'Ayoubia Salon' } },
  { id: 3, name_ar: 'ستائر فاخرة', name_fr: 'Rideaux élégants', price_dzd: 12500, image_url: photos.product3, categories: { name_ar: 'أيوبيا صالون', name_fr: 'Ayoubia Salon' } },
  { id: 4, name_ar: 'سرير نوم مودرن', name_fr: 'Lit contemporain', price_dzd: 48900, image_url: photos.product4, categories: { name_ar: 'أيوبيا مستلزمات الفراش', name_fr: 'Ayoubia Literie' } },
  { id: 5, name_ar: 'طقم مفارش أنيق', name_fr: 'Parure de lit élégante', price_dzd: 165000, image_url: photos.product5, categories: { name_ar: 'أيوبيا مستلزمات الفراش', name_fr: 'Ayoubia Literie' } },
];

export default function HomePage() {
  const { locale } = useLocale();
  const ar = locale === 'ar';
  const [branches, setBranches] = useState<StoreBranch[]>(mockBranches);
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [heroImage, setHeroImage] = useState(photos.sofa);
  const [storyImage, setStoryImage] = useState(photos.room);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  useEffect(() => {
    let active = true;
    try {
      const client = createBrowserSupabaseClient();
      void Promise.all([
        client.from('branches').select('id,name_ar,name_fr,slug').in('slug', ['literie', 'salon']).order('id'),
        client.from('products').select('id,name_ar,name_fr,description_ar,price_dzd,image_url,categories(name_ar,name_fr)').eq('is_active', true).order('featured_order').order('created_at', { ascending: false }).limit(1000),
        client.from('settings').select('key,value').in('key', ['hero_image_url', 'story_image_url', 'top_product_ids']),
        client.from('promotions').select('id,title,title_fr,description,description_fr,image_url').eq('is_active', true).order('created_at', { ascending: false }),
      ]).then(async ([branchResult, productResult, settingResult, promotionResult]) => {
        if (!active) return;
        if (branchResult.data?.length === 2) setBranches(branchResult.data as StoreBranch[]);
        const catalog = (productResult.data || []) as unknown as Product[];
        const settings = settingResult.data || [];
        const featuredSetting = settings.find((setting) => setting.key === 'top_product_ids')?.value;
        const featuredIds = Array.isArray(featuredSetting) ? featuredSetting.map(Number) : [];
        let featured = featuredIds.map((id) => catalog.find((product) => Number(product.id) === id)).filter((product): product is Product => Boolean(product));
        if (featuredIds.length && featured.length < featuredIds.length) {
          const { data } = await client.from('products').select('id,name_ar,name_fr,description_ar,price_dzd,image_url,categories(name_ar,name_fr)').eq('is_active', true).in('id', featuredIds);
          if (data?.length) featured = featuredIds.map((id) => (data as unknown as Product[]).find((product) => Number(product.id) === id)).filter((product): product is Product => Boolean(product));
        }
        if (featured.length) setProducts(featured.slice(0, 5));
        else if (catalog.length) setProducts(catalog.slice(0, 5));
        const hero = settings.find((setting) => setting.key === 'hero_image_url')?.value;
        const story = settings.find((setting) => setting.key === 'story_image_url')?.value;
        if (typeof hero === 'string' && hero) setHeroImage(hero);
        if (typeof story === 'string' && story) setStoryImage(story);
        if (promotionResult.data?.length) setPromotions(promotionResult.data as Promotion[]);
      }).catch(() => undefined);
    } catch { /* Local demo content remains visible if Supabase is unavailable. */ }
    return () => { active = false; };
  }, []);

  const text = (arabic: string, french: string) => ar ? arabic : french;
  const arrow = ar ? '←' : '→';
  const money = (value: number) => `${new Intl.NumberFormat(ar ? 'ar-DZ' : 'fr-DZ').format(value)} ${ar ? 'دج' : 'DA'}`;
  return <>
    <StorefrontHeader />
    <main>
      <section className="hero hero-full" id="home">
        <img className="hero-background" src={heroImage} alt={text('أريكة أنيقة في غرفة جلوس بألوان دافئة', 'Canapé élégant dans un salon aux tons chaleureux')} />
        <div className="hero-copy">
          <span className="eyebrow"><i /> {text('أثاث وديكور يليق بمنزلك', 'Mobilier et décoration pour votre maison')}</span>
          <h1>{text('أناقة منزلك', 'L’élégance de votre maison')}<br /><em>{text('تبدأ من هنا', 'commence ici')}</em></h1>
          <p>{text('أجود أنواع الأفرشة والديوكورات العصرية بلمسة تجمع بين الفخامة والبساطة.', 'Une sélection de literie et de décoration contemporaine, entre élégance et simplicité.')}</p>
          <a className="button button-green" href="#branches">{text('اكتشف مجموعتنا', 'Découvrir nos univers')} <span>{arrow}</span></a>
        </div>
      </section>

      <section className="trust-strip" id="shipping">
        <div><span className="trust-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 20 6v5c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6l8-3Z"/><path d="m8.5 12 2.2 2.2 4.8-4.8"/></svg></span><span>{text('دفع آمن عند الاستلام', 'Paiement sécurisé à la livraison')}</span></div>
        <i />
        <div><span className="trust-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z"/><circle cx="7.5" cy="18" r="1.8"/><circle cx="18" cy="18" r="1.8"/></svg></span><span>{text('شحن سريع وآمن إلى', 'Livraison rapide dans')} <b>69 {text('ولاية', 'wilayas')}</b></span></div>
        <i />
        <div><span className="trust-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/></svg></span><span>{text('جودة مضمونة', 'Qualité garantie')} <b>100%</b></span></div>
      </section>

      <section className="section branch-section" id="branches">
        <div className="section-heading"><div><span className="eyebrow">{text('اختاري عالم أيوبيا المناسب لك', 'Choisissez votre univers Ayoubia')}</span><h2>{text('اكتشفي فروعنا', 'Nos univers')}</h2></div></div>
        <div className="branch-home-grid">
          {branches.map((branch) => <Link className={`branch-home-card branch-${branch.slug}`} href={`/branch/${branch.slug}`} key={branch.id}>
            <img src={branch.slug === 'literie' ? photos.literie : photos.sofa} alt={branch.slug === 'literie' ? (ar ? 'غرفة نوم بأغطية سرير فاخرة' : 'Chambre avec linge de lit élégant') : (ar ? 'صالون أنيق' : 'Salon élégant')} />
            <span className="branch-home-shade" />
            <span className="branch-home-copy">
              <small>{branch.slug === 'literie' ? 'LITERIE' : 'SALON'}</small>
              <strong>{branch.slug === 'literie' ? 'Ayoubia Literie' : 'Ayoubia Salon'}</strong>
              <i className="branch-discover-button">{text('اكتشف الأقسام', 'Découvrir les catégories')} <b>{arrow}</b></i>
            </span>
          </Link>)}
        </div>
      </section>

      {promotions.length > 0 && <section className="promotion-ribbon">{promotions.map((promo) => <article key={promo.id}>{promo.image_url && <img src={promo.image_url} alt="" />}<div><span className="eyebrow">{text('عرض خاص', 'Offre spéciale')}</span><h2>{ar ? promo.title : promo.title_fr || promo.title}</h2>{(ar ? promo.description : promo.description_fr || promo.description) && <p>{ar ? promo.description : promo.description_fr || promo.description}</p>}</div><a href="#products">{text('تسوّق الآن', 'Acheter')} <span>{arrow}</span></a></article>)}</section>}

      <section className="section products-section" id="products">
        <div className="section-heading"><div><span className="eyebrow">{text('مختارة بعناية لمنزلك', 'Sélectionnées pour votre maison')}</span><h2>{text('الأكثر طلباً', 'Les plus demandés')}</h2></div><a className="text-link" href="#products">{text('تصفّحي كل المنتجات', 'Voir les produits')} <span>{arrow}</span></a></div>
        <div className="product-grid">{products.slice(0, 5).map((product, index) => <article className="product-card" key={product.id}>
          <Link href={`/checkout/${product.id}`} className="product-image"><img src={product.image_url || [photos.product1, photos.product2, photos.product3, photos.product4, photos.product5][index]} alt={ar ? product.name_ar : product.name_fr || product.name_ar} /><span className="product-badge">{text('الأكثر طلباً', 'Populaire')}</span></Link>
          <div className="product-info"><small>{ar ? product.categories?.name_ar || 'اختيارات AYOUBIA' : product.categories?.name_fr || 'Sélection AYOUBIA'}</small><Link href={`/checkout/${product.id}`}><h3>{ar ? product.name_ar : product.name_fr || product.name_ar}</h3></Link><div className="product-bottom"><strong>{money(product.price_dzd)}</strong><Link className="shop-button" href={`/checkout/${product.id}`}>{text('تسوّق الآن', 'Acheter')} <span>{arrow}</span></Link><AddToCartButton product={{ id: product.id, name_ar: product.name_ar, price_dzd: product.price_dzd, image_url: product.image_url || photos.product1 }} /></div></div>
        </article>)}</div>
      </section>

      <section className="story-banner" id="about"><div><span className="eyebrow">AYOUBIA · {text('لمسة بيتك', 'Votre intérieur')}</span><h2>{ar ? <>الجمال في التفاصيل،<br />والراحة في الاختيار.</> : <>La beauté des détails,<br />le confort du choix.</>}</h2><p>{text('نختار لك قطعاً تجمع بين الجودة والأناقة، لتصنع في بيتك مساحة تشبهك.', 'Nous sélectionnons des pièces élégantes et durables pour créer un intérieur qui vous ressemble.')}</p><a className="button button-outline" href="#branches">{text('اكتشفي مجموعتنا', 'Découvrir nos univers')} <span>{arrow}</span></a></div><div className="story-image"><img src={storyImage} alt={text('تفاصيل ديكور منزلي أنيق', 'Détails de décoration élégants')} /></div></section>
    </main>
    <StorefrontFooter />
  </>;
}
