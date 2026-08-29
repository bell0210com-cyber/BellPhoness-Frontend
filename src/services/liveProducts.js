import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, firebaseClientReady } from './firebaseClient';
import { optimizeCloudinaryUrl } from '../utils/imageOptimizer';

let memoryCache = null;
let lastFetchTime = 0;
let inFlightPromise = null;
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes cache

const mapFirestoreProduct = (docSnap) => {
  const data = docSnap.data();
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

  return {
    id: docSnap.id,
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
    createdAt: data.createdAt?.toDate
      ? data.createdAt.toDate().toISOString()
      : new Date().toISOString(),
  };
};

export async function fetchLiveProducts(forceRefresh = false) {
  if (!firebaseClientReady || !db) return [];

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
    try {
      const q = query(collection(db, 'products'), where('is_active', '==', true));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(mapFirestoreProduct);
      
      memoryCache = items;
      lastFetchTime = Date.now();

      // Also persist to sessionStorage for instant cross-page navigation
      try {
        sessionStorage.setItem('bell_cached_products', JSON.stringify(items));
        sessionStorage.setItem('bell_cached_time', String(lastFetchTime));
      } catch {
        // sessionStorage quota or disabled
      }

      return items;
    } catch (error) {
      console.error('Failed to load live products:', error);
      return memoryCache || [];
    } finally {
      inFlightPromise = null;
    }
  })();

  return inFlightPromise;
}