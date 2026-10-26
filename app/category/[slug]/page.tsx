import Link from 'next/link';
import { notFound } from 'next/navigation';
import AddToCartButton from '@/components/AddToCartButton';
import StorefrontFooter from '@/components/StorefrontFooter';
import StorefrontHeader from '@/components/StorefrontHeader';
import { mockCategories } from '@/lib/mock-categories';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const money = (amount: number) => `${new Intl.NumberFormat('ar-DZ').format(amount)} دج`;

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const fallback = mockCategories[slug];
  let category = fallback;
  let products = fallback?.products || [];
  try {
    const supabase = await createServerSupabaseClient();
    const { data: remoteCategory } = await supabase.from('categories').select('id,name_ar,slug,image_url').eq('slug', slug).maybeSingle();
    if (remoteCategory) {
      category = { slug, name_ar: remoteCategory.name_ar, intro: fallback?.intro || 'تصفّحي منتجات هذا القسم المختارة بعناية.', image_url: remoteCategory.image_url || fallback?.image_url || '/assets/reference/category-living.png', products: [] };
      const { data } = await supabase.from('products').select('id,name_ar,description_ar,price_dzd,image_url').eq('category_id', remoteCategory.id).eq('is_active', true).order('created_at', { ascending: false });
      if (data?.length) products = data.map((item) => ({ id: item.id, name_ar: item.name_ar, price_dzd: item.price_dzd, image_url: item.image_url || category!.image_url, description_ar: item.description_ar || '' }));
    }
  } catch { /* Keep mock category data available when Supabase is not configured. */ }
  if (!category) notFound();
  return <><StorefrontHeader /><main className="category-page">
    <div className="category-crumb"><Link href="/">الرئيسية</Link><span>／</span><span>{category.name_ar}</span></div>
    <section className="category-hero"><img src={category.image_url} alt="" /><div><span className="eyebrow">اختيارات AYOUBIA</span><h1>{category.name_ar}</h1><p>{category.intro}</p></div></section>
    <section className="category-products"><div className="section-heading"><div><span className="eyebrow">مختارة بعناية</span><h2>تسوّقي المجموعة</h2></div><span className="category-count">{category.products.length} منتجات</span></div>
      <div className="product-grid category-product-grid">{products.map((product) => <article className="product-card" key={product.id}><div className="product-image"><img src={product.image_url} alt={product.name_ar} /><span className="product-badge">اختيار مميز</span></div><div className="product-info"><small>{category.name_ar}</small><h3>{product.name_ar}</h3><p className="mock-product-description">{product.description_ar}</p><div className="product-bottom"><strong>{money(product.price_dzd)}</strong><Link className="shop-button" href={`/checkout/${encodeURIComponent(product.id)}`}>تسوّق الآن <span>←</span></Link><AddToCartButton product={product} /></div></div></article>)}</div>
    </section>
  </main><StorefrontFooter /></>;
}
