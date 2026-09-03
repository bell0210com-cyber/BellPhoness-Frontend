import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, firebaseClientReady } from './firebaseClient';
import { optimizeCloudinaryUrl } from '../utils/imageOptimizer';

let memoryCache = null;
let lastFetchTime = 0;
let inFlightPromise = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes memory cache
const STORAGE_KEY = 'bell_cached_products_v2';

const formatRawProduct = (data, id) => {
  if (!data) return null;
  const productId = id || data.id;
  const rawVariants = Array.isArray(data.variants) ? data.variants : [];
  
  // Extract and optimize all images (w_600 for high DPI / mobile & desktop crispness)
  const allVariantImages = rawVariants
    .flatMap((v) => (Array.isArray(v.images) ? v.images : []))
    .filter(Boolean)
    .map((img) => optimizeCloudinaryUrl(img, { width: 600 }));

  const rawProductImages = (Array.isArray(data.images) ? data.images : [])
    .filter(Boolean)
    .map((img) => optimizeCloudinaryUrl(img, { width: 600 }));

  const productImages = rawProductImages.length > 0 ? rawProductImages : allVariantImages;

  const variants = rawVariants.map((v) => {
    const vImages = (Array.isArray(v.images) ? v.images : [])
      .filter(Boolean)
      .map((img) => optimizeCloudinaryUrl(img, { width: 600 }));

    return {
      ...v,
      images: vImages.length > 0 ? vImages : productImages,
    };
  });

  const firstVariant = variants[0] || {};

  const specs = {};
  if (firstVariant.storage) specs.Storage = firstVariant.storage;
  if (firstVariant.ram) specs.RAM = firstVariant.ram;
  if (firstVariant.color) specs.Color = firstVariant.color;

  let createdAt = new Date().toISOString();
  if (data.createdAt?.toDate) {
    createdAt = data.createdAt.toDate().toISOString();
  } else if (data.createdAt) {
    createdAt = new Date(data.createdAt).toISOString();
  }

  return {
    id: productId,
    name: data.name,
    brand: data.brand,
    category: data.category,
    description: data.description || '',
    warranty: data.warranty || '',
    images: productImages.length ? productImages : (firstVariant.images || []),
    specs,
    price: firstVariant.price ?? 0,
    salePrice: firstVariant.salePrice ?? null,
    stock: variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0),
    variants,
    featured: Boolean(data.featured),
    bestseller: Boolean(data.bestseller),
    createdAt,
  };
};

const mapFirestoreProduct = (docSnap) => formatRawProduct(docSnap.data(), docSnap.id);

/**
 * Fetch products from Backend REST API (/api/products) with fast timeout
 */
async function fetchProductsFromRestApi(timeoutMs = 4000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const apiBase = import.meta.env.VITE_API_BASE_URL || '';
    const url = `${apiBase}/api/products`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`REST API returned ${response.status}`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Invalid products array from REST API');
    }
    return data.map((item) => formatRawProduct(item, item.id)).filter(Boolean);
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Fetch from Cloud Firestore with strict timeout to prevent 15-second hangs
 */
async function fetchProductsFromFirestore(timeoutMs = 1500) {
  if (!firebaseClientReady || !db) {
    throw new Error('Firebase client not ready');
  }

  return new Promise(async (resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Firestore fetch timeout')), timeoutMs);

    try {
      const q = query(collection(db, 'products'), where('is_active', '==', true));
      const snapshot = await getDocs(q);
      clearTimeout(timeout);

      if (snapshot.empty) {
        return resolve([]);
      }
      const items = snapshot.docs.map(mapFirestoreProduct);
      resolve(items);
    } catch (err) {
      clearTimeout(timeout);
      reject(err);
    }
  });
}

export async function fetchLiveProducts(forceRefresh = false) {
  const now = Date.now();

  // Return memory cache if fresh
  if (!forceRefresh && memoryCache && (now - lastFetchTime < CACHE_TTL)) {
    return memoryCache;
  }

  // Deduplicate concurrent fetch calls
  if (inFlightPromise) {
    return inFlightPromise;
  }

  inFlightPromise = (async () => {
    let items = [];

    // Attempt fast Firestore fetch and REST API concurrently for lowest possible latency
    try {
      items = await Promise.any([
        fetchProductsFromFirestore(1500),
        fetchProductsFromRestApi(3500),
      ]);
    } catch {
      // If Promise.any rejected (both failed), try a final direct REST attempt
      try {
        items = await fetchProductsFromRestApi(5000);
      } catch (fallbackErr) {
        console.warn('All live product fetch strategies failed:', fallbackErr);
      }
    }

    if (Array.isArray(items) && items.length > 0) {
      memoryCache = items;
      lastFetchTime = Date.now();

      // Persist to localStorage and sessionStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        sessionStorage.setItem('bell_cached_products', JSON.stringify(items));
        sessionStorage.setItem('bell_cached_time', String(lastFetchTime));
      } catch {
        // quota exceeded
      }

      return items;
    }

    // Fallback: Check localStorage if network failed
    if (!memoryCache) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            memoryCache = parsed;
            return parsed;
          }
        }
      } catch {
        // storage disabled
      }
    }

    return memoryCache || [];
  })().finally(() => {
    inFlightPromise = null;
  });

  return inFlightPromise;
}