import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { fetchLiveProducts } from '../services/liveProducts';

const ProductsContext = createContext();

const getInitialProducts = () => {
  try {
    const raw = sessionStorage.getItem('bell_cached_products');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // sessionStorage unavailable
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