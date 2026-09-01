import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getProduct, productVariants } from '../data/products';

const StoreContext = createContext();
const read = (key) => { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } };

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => read('bell-cart').map((item) => {
    const productId = item.productId || (item.cartId ? item.cartId.split(':')[0] : item.id);
    const variant = item.selectedVariant || productVariants(item)[0] || {};
    const variantId = item.variantId || variant.id || (item.cartId ? item.cartId.split(':')[1] : 'default');
    const cartId = item.cartId || `${productId}:${variantId}`;
    return {
      ...item,
      productId,
      variantId,
      cartId,
      selectedVariant: variant,
      quantity: item.quantity || 1
    };
  }));
  const [wishlist, setWishlist] = useState(() => read('bell-wishlist'));
  useEffect(() => localStorage.setItem('bell-cart', JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem('bell-wishlist', JSON.stringify(wishlist)), [wishlist]);
  const addToCart = (product, variant, quantity = 1) => setCart((current) => {
    const productId = product.productId || product.id;
    const variantId = variant?.id || 'default';
    const cartId = `${productId}:${variantId}`;
    const existing = current.find((item) => item.cartId === cartId);
    const cartItem = {
      ...product,
      ...variant,
      productId,
      variantId,
      cartId,
      selectedVariant: variant,
      quantity: Math.min(quantity, variant?.stock || 99)
    };
    return existing ? current.map((item) => item.cartId === cartId ? { ...item, quantity: Math.min(item.quantity + quantity, variant?.stock || 99) } : item) : [...current, cartItem];
  });
  const updateQuantity = (cartId, quantity) => setCart((current) => current.map((item) => item.cartId === cartId ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock || 99)) } : item));

  const value = useMemo(() => ({ cart, wishlist, addToCart, updateQuantity, removeFromCart: (cartId) => setCart((items) => items.filter((item) => item.cartId !== cartId)), clearCart: () => setCart([]), toggleWishlist: (product) => setWishlist((current) => current.some((item) => item.id === product.id) ? current.filter((item) => item.id !== product.id) : [...current, product]), isWishlisted: (id) => wishlist.some((item) => item.id === id) }), [cart, wishlist]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
export const useStore = () => useContext(StoreContext);
