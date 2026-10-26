'use client';

import { addToCart, type CartProduct } from '@/lib/store-events';

export default function AddToCartButton({ product }: { product: CartProduct }) {
  return <button className="add-cart-button" type="button" onClick={() => addToCart(product)} aria-label={`إضافة ${product.name_ar} إلى السلة`} title="أضيفي إلى السلة">＋</button>;
}
