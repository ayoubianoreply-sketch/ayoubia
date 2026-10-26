import { mockBranchCategories, type StoreBranchCategory } from '@/lib/mock-branches';

export type MockCategoryProduct = {
  id: string;
  name_ar: string;
  name_fr?: string;
  price_dzd: number;
  image_url: string;
  description_ar: string;
  description_fr?: string;
};
export type MockCategory = StoreBranchCategory & {
  intro: string;
  products: MockCategoryProduct[];
};

const sampleProducts: MockCategoryProduct[] = [
  { id: 'sample-1', name_ar: 'اختيار أيوبيا المميز', name_fr: 'Sélection Ayoubia', price_dzd: 268000, image_url: '/assets/reference/product-268000.png', description_ar: 'جودة وأناقة بتفاصيل مختارة بعناية.', description_fr: 'Qualité et élégance, sélectionnées avec soin.' },
  { id: 'sample-2', name_ar: 'لمسة من الراحة', name_fr: 'Une touche de confort', price_dzd: 6900, image_url: '/assets/reference/product-6900.png', description_ar: 'تفاصيل عملية تضيف لمسة دافئة لمنزلك.', description_fr: 'Un détail pratique et chaleureux pour votre intérieur.' },
  { id: 'sample-3', name_ar: 'تصميم عصري', name_fr: 'Design contemporain', price_dzd: 12500, image_url: '/assets/reference/product-12500.png', description_ar: 'خامات منتقاة وألوان سهلة التنسيق.', description_fr: 'Des matières choisies et des couleurs faciles à associer.' },
  { id: 'sample-4', name_ar: 'مجموعة أنيقة', name_fr: 'Collection élégante', price_dzd: 48900, image_url: '/assets/reference/product-48900.png', description_ar: 'تصميم أنيق يجمع بين العملية والجمال.', description_fr: 'Un design élégant, à la fois pratique et raffiné.' },
  { id: 'sample-5', name_ar: 'اختيار كلاسيكي', name_fr: 'Choix classique', price_dzd: 165000, image_url: '/assets/reference/product-165000.png', description_ar: 'قطعة متناسقة لتكمل أناقة مساحتك.', description_fr: 'Une pièce harmonieuse pour compléter votre intérieur.' },
];

const categories = [...mockBranchCategories.literie, ...mockBranchCategories.salon];
export const mockCategories: Record<string, MockCategory> = Object.fromEntries(categories.map((category) => [category.slug, {
  ...category,
  intro: category.subtitle_ar || 'منتجات مختارة بعناية من أيوبيا.',
  products: sampleProducts.map((product, index) => ({ ...product, id: `${category.slug}-${index + 1}`, image_url: index === 0 ? category.image_url : product.image_url })),
}])) as Record<string, MockCategory>;
