import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
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
  const initialData = getInitialProducts();
  const [liveProducts, setLiveProducts] = useState(initialData);
  const [loading, setLoading] = useState(initialData.length === 0);

  const loadProducts = useCallback(async (forceRefresh = false) => {
    try {
      const items = await fetchLiveProducts(forceRefresh);
      if (Array.isArray(items) && items.length > 0) {
        setLiveProducts(items);
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
    let mounted = true;
    loadProducts();
    return () => {
      mounted = false;
    };
  }, [loadProducts]);

  const value = useMemo(
    () => ({
      products: liveProducts,
      loading: loading && liveProducts.length === 0,
      isRefreshing: loading && liveProducts.length > 0,
      getProduct: (id) => liveProducts.find((p) => p.id === id),
      refreshProducts: () => loadProducts(true),
    }),
    [liveProducts, loading, loadProducts]
  );

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

export const useProducts = () => useContext(ProductsContext);