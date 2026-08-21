import { createContext, useContext, useEffect, useState } from 'react';
import { products as staticProducts } from '../data/products';
import { fetchLiveProducts } from '../services/liveProducts';

const ProductsContext = createContext();

export function ProductsProvider({ children }) {
  const [liveProducts, setLiveProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchLiveProducts().then((items) => {
      console.log('Firestore products fetched:', items);
      if (mounted) {
        setLiveProducts(items);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const value = {
    products: liveProducts,
    loading,
    getProduct: (id) => liveProducts.find((p) => p.id === id),
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

export const useProducts = () => useContext(ProductsContext);