'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import StorefrontHeader from '@/components/StorefrontHeader';
import StorefrontFooter from '@/components/StorefrontFooter';
import AddToCartButton from '@/components/AddToCartButton';

type Product = { id: number; name_ar: string; description_ar?: string; price_dzd: number; image_url?: string; categories?: { name_ar: string } | null };
type Category = { id: number; name_ar: string; image_url?: string };
type Promotion = { id: number; title: string; description?: string; image_url?: string };
const photos = {
  sofa: '/assets/reference/hero-sofa.png',
  room: '/assets/reference/category-living.png',
  curtains: '/assets/reference/category-curtains.png',
  bedroom: '/assets/reference/category-bedroom.png',
  decor: '/assets/reference/category-decor.png',
};
const fallbackCategories: Category[] = [
  { id: 1, name_ar: 'أثاث الجلوس', image_url: photos.sofa },
  { id: 2, name_ar: 'الستائر والأقمشة', image_url: photos.curtains },
  { id: 3, name_ar: 'غرف النوم', image_url: photos.bedroom },
  { id: 4, name_ar: 'السجاد والديكور', image_url: photos.decor },
];
const fallbackProducts: Product[] = [
  { id: 1, name_ar: 'طقم جلوس عصري', price_dzd: 268000, image_url: '/assets/reference/product-268000.png', categories: { name_ar: 'أثاث الجلوس' } },
  { id: 2, name_ar: 'مخدات ديكور', price_dzd: 6900, image_url: '/assets/reference/product-6900.png', categories: { name_ar: 'أثاث الجلوس' } },
  { id: 3, name_ar: 'ستائر فاخرة', price_dzd: 12500, image_url: '/assets/reference/product-12500.png', categories: { name_ar: 'الستائر والأقمشة' } },
  { id: 4, name_ar: 'سرير نوم مودرن', price_dzd: 48900, image_url: '/assets/reference/product-48900.png', categories: { name_ar: 'غرف النوم' } },
  { id: 5, name_ar: 'طقم جلوس عصري', price_dzd: 165000, image_url: '/assets/reference/product-165000.png', categories: { name_ar: 'أثاث الجلوس' } },
];
const money = (amount: number) => `${new Intl.NumberFormat('ar-DZ').format(amount)} دج`;
function getCategorySlug(category: Category, index: number) {
  const name = category.name_ar;
  if (name.includes('جلوس') || name.includes('أثاث')) return 'salon';
  if (name.includes('نوم')) return 'chambres';
  if (name.includes('ستائر') || name.includes('أقمشة')) return 'rideaux';
  if (name.includes('ديكور') || name.includes('سجاد')) return 'deco';
  return ['salon', 'rideaux', 'chambres', 'deco'][index] || 'salon';
}

export default function HomePage() {
  const [categories, setCategories] = useState(fallbackCategories);
  const [products, setProducts] = useState(fallbackProducts);
  const [heroImage, setHeroImage] = useState(photos.sofa);
  const [storyImage, setStoryImage] = useState(photos.room);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  useEffect(() => {
    const client = createBrowserSupabaseClient();
    void Promise.all([
      client.from('categories').select('id,name_ar,image_url').order('sort_order'),
      client.from('products').select('id,name_ar,description_ar,price_dzd,image_url,categories(name_ar)').eq('is_active', true).order('featured_order').order('created_at', { ascending: false }).limit(1000),
      client.from('settings').select('key,value').in('key', ['hero_image_url', 'story_image_url']),
      client.from('promotions').select('id,title,description,image_url').eq('is_active', true).order('created_at', { ascending: false }),
      client.from('settings').select('value').eq('key', 'top_product_ids').maybeSingle(),
    ]).then(async ([categoryResult, productResult, settingResult, promotionResult, featuredResult]) => {
      if (categoryResult.data?.length) setCategories(categoryResult.data as Category[]);
      const catalog = (productResult.data || []) as unknown as Product[];
      const featuredIds = Array.isArray(featuredResult.data?.value) ? featuredResult.data.value.map(Number) : [];
      let featured = featuredIds.map((id) => catalog.find((product) => Number(product.id) === id)).filter((product): product is Product => Boolean(product));
      if (featuredIds.length && featured.length < featuredIds.length) {
        const { data } = await client.from('products').select('id,name_ar,description_ar,price_dzd,image_url,categories(name_ar)').eq('is_active', true).in('id', featuredIds);
        if (data?.length) featured = featuredIds.map((id) => (data as unknown as Product[]).find((product) => Number(product.id) === id)).filter((product): product is Product => Boolean(product));
      }
      if (featured.length) setProducts(featured.slice(0, 5));
      else if (catalog.length) setProducts(catalog.slice(0, 5));
      const hero = settingResult.data?.find((setting) => setting.key === 'hero_image_url')?.value;
      const story = settingResult.data?.find((setting) => setting.key === 'story_image_url')?.value;
      if (typeof hero === 'string' && hero) setHeroImage(hero);
      if (typeof story === 'string' && story) setStoryImage(story);
      if (promotionResult.data?.length) setPromotions(promotionResult.data as Promotion[]);
    }).catch(() => undefined);
  }, []);

  return <>
    <StorefrontHeader />
    <main>
      <section className="hero hero-full" id="home"><img className="hero-background" src={heroImage} alt="أريكة أنيقة في غرفة جلوس بألوان دافئة" /><div className="hero-copy"><span className="eyebrow"><i /> أثاث وديكور يليق بمنزلك</span><h1>أناقة منزلك<br /><em>تبدأ من هنا</em></h1><p>أجود أنواع الأفرشة والديوكورات العصرية بلمسة تجمع بين الفخامة والبساطة.</p><a className="button button-green" href="#products">اكتشف مجموعتنا <span>←</span></a></div></section>
      <section className="trust-strip" id="shipping"><div><span className="trust-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 20 6v5c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6l8-3Z"/><path d="m8.5 12 2.2 2.2 4.8-4.8"/></svg></span><span>دفع آمن عند الاستلام</span></div><i /><div><span className="trust-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z"/><circle cx="7.5" cy="18" r="1.8"/><circle cx="18" cy="18" r="1.8"/></svg></span><span>شحن سريع وآمن إلى <b>69 ولاية</b></span></div><i /><div><span className="trust-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/></svg></span><span>جودة مضمونة <b>100%</b></span></div></section>
      {promotions.length > 0 && <section className="promotion-ribbon">{promotions.map((promo) => <article key={promo.id}>{promo.image_url && <img src={promo.image_url} alt="" />}<div><span className="eyebrow">عرض خاص</span><h2>{promo.title}</h2>{promo.description && <p>{promo.description}</p>}</div><a href="#products" aria-label="اكتشفي المنتجات">تسوّقي الآن <span>←</span></a></article>)}</section>}
      <section className="section categories-section" id="categories"><div className="section-heading"><div><span className="eyebrow">اختاري ما يناسب بيتك</span><h2>تسوّقي حسب التصنيف</h2></div><Link className="text-link" href="/category/salon">جميع التصنيفات <span>←</span></Link></div><div className="category-list">{categories.map((category, index) => <Link href={`/category/${getCategorySlug(category, index)}`} className="category" key={category.id}><span className="category-photo"><img src={category.image_url || Object.values(photos)[index] || photos.decor} alt={category.name_ar} /></span><strong>{category.name_ar}</strong><small>اكتشفي المجموعة <span>←</span></small></Link>)}</div></section>
      <section className="section products-section" id="products"><div className="section-heading"><div><span className="eyebrow">مختارة بعناية لمنزلك</span><h2>الأكثر طلباً</h2></div><a className="text-link" href="#products">تصفّحي كل المنتجات <span>←</span></a></div><div className="product-grid">{products.slice(0, 5).map((product, index) => <article className="product-card" key={product.id}><Link href={`/checkout/${product.id}`} className="product-image"><img src={product.image_url || Object.values(photos)[index]} alt={product.name_ar} /><span className="product-badge">الأكثر طلباً</span></Link><div className="product-info"><small>{product.categories?.name_ar || 'اختيارات AYOUBIA'}</small><Link href={`/checkout/${product.id}`}><h3>{product.name_ar}</h3></Link><div className="product-bottom"><strong>{money(product.price_dzd)}</strong><Link className="shop-button" href={`/checkout/${product.id}`}>تسوّق الآن <span>←</span></Link><AddToCartButton product={{ id: product.id, name_ar: product.name_ar, price_dzd: product.price_dzd, image_url: product.image_url || Object.values(photos)[index] }} /></div></div></article>)}</div></section>
      <section className="story-banner" id="about"><div><span className="eyebrow">AYOUBIA · لمسة بيتك</span><h2>الجمال في التفاصيل،<br />والراحة في الاختيار.</h2><p>نختار لك قطعاً تجمع بين الجودة والأناقة، لتصنع في بيتك مساحة تشبهك.</p><a className="button button-outline" href="#products">اكتشفي مجموعتنا <span>←</span></a></div><div className="story-image"><img src={storyImage} alt="تفاصيل ديكور منزلي أنيق" /></div></section>
    </main><StorefrontFooter />
  </>;
}
