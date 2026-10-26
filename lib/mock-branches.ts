export type StoreBranch = { id: number; name_ar: string; name_fr: string; slug: 'literie' | 'salon' };
export type StoreBranchCategory = {
  id: number;
  branch_id: number;
  name_ar: string;
  name_fr: string;
  subtitle_ar: string;
  subtitle_fr: string;
  slug: string;
  image_url: string;
};

export const mockBranches: StoreBranch[] = [
  { id: 1, name_ar: 'أيوبيا مستلزمات الفراش', name_fr: 'Ayoubia Literie', slug: 'literie' },
  { id: 2, name_ar: 'أيوبيا صالون', name_fr: 'Ayoubia Salon', slug: 'salon' },
];

export const mockBranchCategories: Record<StoreBranch['slug'], StoreBranchCategory[]> = {
  literie: [
    { id: 101, branch_id: 1, name_ar: 'الألحفة', name_fr: 'Les Couettes', subtitle_ar: '', subtitle_fr: '', slug: 'literie-les-couettes', image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1200&auto=format&fit=crop' },
    { id: 102, branch_id: 1, name_ar: 'أغطية الألحفة', name_fr: 'Les caches couettes', subtitle_ar: '', subtitle_fr: '', slug: 'literie-caches-couettes', image_url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=1200&auto=format&fit=crop' },
    { id: 103, branch_id: 1, name_ar: 'أغطية أسرّة مزدوجة', name_fr: 'Couvre lits mariés', subtitle_ar: '', subtitle_fr: '', slug: 'literie-couvre-lits-maries', image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1200&auto=format&fit=crop' },
    { id: 104, branch_id: 1, name_ar: 'الحزم', name_fr: 'Les Packs', subtitle_ar: '', subtitle_fr: '', slug: 'literie-les-packs', image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1200&auto=format&fit=crop' },
    { id: 105, branch_id: 1, name_ar: 'البوتي', name_fr: 'Les Bootis', subtitle_ar: '', subtitle_fr: '', slug: 'literie-les-bootis', image_url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1200&auto=format&fit=crop' },
    { id: 106, branch_id: 1, name_ar: 'لحاف أبيض', name_fr: 'Couette Blanche', subtitle_ar: '', subtitle_fr: '', slug: 'literie-couette-blanche', image_url: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?q=80&w=1200&auto=format&fit=crop' },
    { id: 107, branch_id: 1, name_ar: 'الإكسسوارات', name_fr: 'Les Accessoires', subtitle_ar: '', subtitle_fr: '', slug: 'literie-accessoires', image_url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=1200&auto=format&fit=crop' },
  ],
  salon: [
    { id: 201, branch_id: 2, name_ar: 'منتوجات جاهزة', name_fr: 'Produits prêts', subtitle_ar: 'ربح الوقت', subtitle_fr: 'Gagnez du temps', slug: 'salon-produits-prets', image_url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1200&auto=format&fit=crop' },
    { id: 202, branch_id: 2, name_ar: 'أقمشة وستائر حسب الطلب', name_fr: 'Tissus et rideaux sur commande', subtitle_ar: 'التوصيل من 3 أيام إلى 20 يوماً حسب المنتج', subtitle_fr: 'Livraison de 3 à 20 jours selon le produit', slug: 'salon-tissus-rideaux', image_url: 'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?q=80&w=1200&auto=format&fit=crop' },
    { id: 203, branch_id: 2, name_ar: 'الصالونات التقليدية', name_fr: 'Salons traditionnels', subtitle_ar: '', subtitle_fr: '', slug: 'salon-traditionnel', image_url: 'https://images.unsplash.com/photo-1600210491369-e753d80a41f3?q=80&w=1200&auto=format&fit=crop' },
    { id: 204, branch_id: 2, name_ar: 'صالونات عصرية', name_fr: 'Salons modernes', subtitle_ar: '', subtitle_fr: '', slug: 'salon-moderne', image_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop' },
    { id: 205, branch_id: 2, name_ar: 'السجاد والديكور', name_fr: 'Tapis et décoration', subtitle_ar: '', subtitle_fr: '', slug: 'salon-tapis-deco', image_url: 'https://images.unsplash.com/photo-1600166898405-da9535204843?q=80&w=1200&auto=format&fit=crop' },
  ],
};
