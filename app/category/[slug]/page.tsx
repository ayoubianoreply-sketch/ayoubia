import { notFound } from 'next/navigation';
import CategoryCatalog from '@/components/CategoryCatalog';
import { mockCategories } from '@/lib/mock-categories';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const fallback = mockCategories[slug];
  type CatalogProduct = { id: number | string; name_ar: string; name_fr?: string; price_dzd: number; image_url?: string; description_ar?: string; description_fr?: string };
  let category: { slug: string; name_ar: string; name_fr?: string; subtitle_ar?: string; subtitle_fr?: string; intro?: string; image_url: string; products: CatalogProduct[] } | undefined = fallback ? { ...fallback } : undefined;
  let products: CatalogProduct[] = fallback?.products || [];
  try {
    const supabase = await createServerSupabaseClient();
    const { data: remoteCategory } = await supabase.from('categories').select('id,name_ar,name_fr,subtitle_ar,subtitle_fr,slug,image_url').eq('slug', slug).maybeSingle();
    if (remoteCategory) {
      const savedImage = remoteCategory.image_url;
      const isOldLocalPlaceholder = typeof savedImage === 'string' && savedImage.startsWith('/assets/reference/');
      category = { slug, name_ar: remoteCategory.name_ar, name_fr: remoteCategory.name_fr || '', subtitle_ar: remoteCategory.subtitle_ar || '', subtitle_fr: remoteCategory.subtitle_fr || '', image_url: savedImage && !isOldLocalPlaceholder ? savedImage : fallback?.image_url || '/assets/reference/category-living.png', products: [] };
      const { data } = await supabase.from('products').select('id,name_ar,name_fr,description_ar,description_fr,price_dzd,image_url').eq('category_id', remoteCategory.id).eq('is_active', true).order('created_at', { ascending: false });
      if (data?.length) products = data.map((item) => ({ id: item.id, name_ar: item.name_ar, name_fr: item.name_fr || '', price_dzd: item.price_dzd, image_url: item.image_url || category!.image_url, description_ar: item.description_ar || '', description_fr: item.description_fr || '' }));
    }
  } catch { /* Keep mock category data available when Supabase is not configured. */ }
  if (!category) notFound();
  return <CategoryCatalog category={category} products={products} />;
}
