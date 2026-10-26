export type CartProduct = { id: string | number; name_ar: string; price_dzd: number; image_url: string };

export function openCart() { window.dispatchEvent(new Event('ayoubia:open-cart')); }
export function openAuth() { window.dispatchEvent(new Event('ayoubia:open-auth')); }
export function addToCart(product: CartProduct) {
  window.dispatchEvent(new CustomEvent<CartProduct>('ayoubia:add-to-cart', { detail: product }));
}

