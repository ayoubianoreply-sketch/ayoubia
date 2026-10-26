import { notFound } from 'next/navigation';
import BranchCategories from '@/components/BranchCategories';
import { mockBranches, mockBranchCategories, type StoreBranch } from '@/lib/mock-branches';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const branchCategorySlugs = {
  literie: ['literie-les-couettes', 'literie-caches-couettes', 'literie-couvre-lits-maries', 'literie-les-packs', 'literie-les-bootis', 'literie-couette-blanche', 'literie-accessoires'],
  salon: ['salon-produits-prets', 'salon-tissus-rideaux', 'salon-traditionnel', 'salon-moderne', 'salon-tapis-deco'],
} as const;

export default async function BranchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug !== 'literie' && slug !== 'salon') notFound();
  const branchSlug = slug as StoreBranch['slug'];
  let branch = mockBranches.find((item) => item.slug === branchSlug)!;
  let categories = mockBranchCategories[branchSlug];

  try {
    const supabase = await createServerSupabaseClient();
    const { data: remoteBranch } = await supabase.from('branches').select('id,name_ar,name_fr,slug').eq('slug', branchSlug).maybeSingle();
    if (remoteBranch) {
      branch = remoteBranch as StoreBranch;
      const { data, error } = await supabase.from('categories')
        .select('id,branch_id,name_ar,name_fr,subtitle_ar,subtitle_fr,slug,image_url')
        .eq('branch_id', remoteBranch.id)
        .in('slug', [...branchCategorySlugs[branchSlug]])
        .order('sort_order');
      if (!error && data?.length) {
        const remoteBySlug = new Map(data.map((category) => [category.slug, category]));
        categories = mockBranchCategories[branchSlug].map((mock) => {
          const remote = remoteBySlug.get(mock.slug);
          const savedImage = remote?.image_url;
          const isOldLocalPlaceholder = typeof savedImage === 'string' && savedImage.startsWith('/assets/reference/');
          return remote ? { ...mock, ...remote, image_url: savedImage && !isOldLocalPlaceholder ? savedImage : mock.image_url } : mock;
        });
      }
    }
  } catch { /* Use the branch's matching mock categories when Supabase is unavailable. */ }

  return <BranchCategories branch={branch} categories={categories} />;
}
