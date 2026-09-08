import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchLiveProducts } from '../services/liveProducts';

const ProductsContext = createContext();

const LOCAL_STORAGE_KEY = 'bell_cached_products_v4';

const getInitialProducts = () => {
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Storage quota or private browsing mode
  }
  return [];
};

export function ProductsProvider({ children }) {
  const location = useLocation();
  const initialData = getInitialProducts();
  const [liveProducts, setLiveProducts] = useState(initialData);
  const [loading, setLoading] = useState(initialData.length === 0);
  const hasLoadedRef = useRef(false);

  const loadProducts = useCallback(async (forceRefresh = false) => {
    try {
      const items = await fetchLiveProducts(forceRefresh);
      if (Array.isArray(items) && items.length > 0) {
        setLiveProducts(items);
        hasLoadedRef.current = true;
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
        } catch {
          // ignore storage error
        }
      }
    } catch (err) {
      console.error('Failed to load products in ProductsContext:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Prevent redundant background fetch on checkout, order confirmation, and payment callback pages
    const path = (location.pathname || '').toLowerCase();
    const isCheckoutOrCallback =
      path.startsWith('/checkout') ||
      path.includes('/callback') ||
      path.includes('tabby') ||
      path.includes('tamara') ||
      path.startsWith('/orders');

    if (isCheckoutOrCallback) {
      return;
    }

    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadProducts();
    }
  }, [loadProducts, location.pathname]);

  const value = useMemo(
    () => ({
      products: liveProducts,
      loading: loading && liveProducts.length === 0,
      isRefreshing: loading && liveProducts.length > 0,
      getProduct: (id) => liveProducts.find((p) => p.id === id),
      refreshProducts: () => loadProducts(true),
      loadProducts,
    }),
    [liveProducts, loading, loadProducts]
  );

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

export const useProducts = () => {
  const ctx = useContext(ProductsContext);
  // Auto-trigger product loading if a consumer component specifically requires products
  useEffect(() => {
    if (ctx && ctx.products.length === 0 && !ctx.loading && ctx.loadProducts) {
      ctx.loadProducts();
    }
  }, [ctx]);
  return ctx;
};