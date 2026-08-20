import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getProduct, productVariants } from '../data/products';

const StoreContext = createContext();
const read = (key) => { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } };

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => read('bell-cart').map((item) => {
    if (item.cartId) return item;
    const product = getProduct(item.id) || item;
    const variant = productVariants(product)[0];
    return { ...product, ...variant, cartId: `${product.id}:${variant.id}`, selectedVariant: variant, quantity: item.quantity || 1 };
  }));
  const [wishlist, setWishlist] = useState(() => read('bell-wishlist'));
  useEffect(() => localStorage.setItem('bell-cart', JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem('bell-wishlist', JSON.stringify(wishlist)), [wishlist]);
  const addToCart = (product, variant, quantity = 1) => setCart((current) => {
    const cartId = `${product.id}:${variant.id}`;
    const existing = current.find((item) => item.cartId === cartId);
    const cartItem = { ...product, ...variant, cartId, selectedVariant: variant, quantity: Math.min(quantity, variant.stock) };
    return existing ? current.map((item) => item.cartId === cartId ? { ...item, quantity: Math.min(item.quantity + quantity, variant.stock) } : item) : [...current, cartItem];
  });
  const updateQuantity = (cartId, quantity) => setCart((current) => current.map((item) => item.cartId === cartId ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) } : item));
  const value = useMemo(() => ({ cart, wishlist, addToCart, updateQuantity, removeFromCart: (cartId) => setCart((items) => items.filter((item) => item.cartId !== cartId)), clearCart: () => setCart([]), toggleWishlist: (product) => setWishlist((current) => current.some((item) => item.id === product.id) ? current.filter((item) => item.id !== product.id) : [...current, product]), isWishlisted: (id) => wishlist.some((item) => item.id === id) }), [cart, wishlist]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
export const useStore = () => useContext(StoreContext);
