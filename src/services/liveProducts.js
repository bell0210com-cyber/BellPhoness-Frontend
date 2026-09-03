import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, firebaseClientReady } from './firebaseClient';
import { optimizeCloudinaryUrl } from '../utils/imageOptimizer';

let memoryCache = null;
let lastFetchTime = 0;
let inFlightPromise = null;
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes cache

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
 * Fallback: Fetch products from Backend REST API (/api/products)
 */
async function fetchProductsFromRestApi() {
  const apiBase = import.meta.env.VITE_API_BASE_URL || '';
  const url = `${apiBase}/api/products`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`REST API returned ${response.status}`);
  }
  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error('Invalid products array from REST API');
  }
  return data.map((item) => formatRawProduct(item, item.id)).filter(Boolean);
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

    // 1. Try fetching from Cloud Firestore Web SDK first
    if (firebaseClientReady && db) {
      try {
        const q = query(collection(db, 'products'), where('is_active', '==', true));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          items = snapshot.docs.map(mapFirestoreProduct);
        }
      } catch (firestoreError) {
        console.warn('Direct Firestore SDK fetch failed, falling back to REST API:', firestoreError?.message || firestoreError);
      }
    }

    // 2. If Firestore direct fetch returned empty or failed, fetch via backend REST API
    if (!items || items.length === 0) {
      try {
        items = await fetchProductsFromRestApi();
      } catch (restError) {
        console.error('REST API products fetch failed:', restError?.message || restError);
      }
    }

    if (items && items.length > 0) {
      memoryCache = items;
      lastFetchTime = Date.now();

      // Persist to sessionStorage for instant cross-page navigation
      try {
        sessionStorage.setItem('bell_cached_products', JSON.stringify(items));
        sessionStorage.setItem('bell_cached_time', String(lastFetchTime));
      } catch {
        // sessionStorage quota or disabled
      }

      return items;
    }

    // If both failed, return memoryCache or empty array
    return memoryCache || [];
  })().finally(() => {
    inFlightPromise = null;
  });

  return inFlightPromise;
}