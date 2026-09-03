import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, firebaseClientReady } from './firebaseClient';
import { optimizeCloudinaryUrl } from '../utils/imageOptimizer';
import { getApiBaseUrl } from './apiConfig';

let memoryCache = null;
let lastFetchTime = 0;
let inFlightPromise = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes memory cache
const STORAGE_KEY = 'bell_cached_products_v4';

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
  if (data.createdAt?.toDate && typeof data.createdAt.toDate === 'function') {
    try {
      createdAt = data.createdAt.toDate().toISOString();
    } catch {}
  } else if (data.createdAt?._seconds) {
    try {
      createdAt = new Date(data.createdAt._seconds * 1000).toISOString();
    } catch {}
  } else if (typeof data.createdAt === 'string' || typeof data.createdAt === 'number') {
    try {
      const dt = new Date(data.createdAt);
      if (!isNaN(dt.getTime())) {
        createdAt = dt.toISOString();
      }
    } catch {}
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
 * Fetch products from Backend REST API (/api/products)
 */
async function fetchProductsFromRestApi(timeoutMs = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const apiBase = getApiBaseUrl();
    const url = `${apiBase}/api/products`;
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`REST API returned ${response.status}`);
    }
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('REST API returned empty products array');
    }
    const items = data.map((item) => formatRawProduct(item, item.id)).filter(Boolean);
    if (items.length === 0) {
      throw new Error('No valid products parsed from REST API');
    }
    return items;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Fetch from Cloud Firestore SDK
 */
async function fetchProductsFromFirestore(timeoutMs = 2000) {
  if (!firebaseClientReady || !db) {
    throw new Error('Firebase client not ready');
  }

  return new Promise(async (resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Firestore fetch timeout')), timeoutMs);

    try {
      const q = query(collection(db, 'products'), where('is_active', '==', true));
      const snapshot = await getDocs(q);
      clearTimeout(timeout);

      if (snapshot.empty || snapshot.docs.length === 0) {
        return reject(new Error('Firestore snapshot empty'));
      }
      const items = snapshot.docs.map(mapFirestoreProduct).filter(Boolean);
      if (items.length === 0) {
        return reject(new Error('No valid products mapped from Firestore'));
      }
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

    // Attempt REST API (fastest & most reliable on mobile) and Firestore concurrently
    try {
      items = await Promise.any([
        fetchProductsFromRestApi(4000),
        fetchProductsFromFirestore(2000),
      ]);
    } catch {
      // If Promise.any rejected (both timed out or network issues), try a direct REST attempt
      try {
        items = await fetchProductsFromRestApi(6000);
      } catch (fallbackErr) {
        console.warn('All live product fetch strategies failed:', fallbackErr?.message || fallbackErr);
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