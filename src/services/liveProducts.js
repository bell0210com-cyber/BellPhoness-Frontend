import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, firebaseClientReady } from './firebaseClient';

const mapFirestoreProduct = (docSnap) => {
  const data = docSnap.data();
  const variants = Array.isArray(data.variants) ? data.variants : [];
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
    images: data.images?.length ? data.images : firstVariant.images || [],
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

export async function fetchLiveProducts() {
  if (!firebaseClientReady || !db) return [];

  try {
    const q = query(collection(db, 'products'), where('is_active', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapFirestoreProduct);
  } catch (error) {
    console.error('Failed to load live products:', error);
    return [];
  }
}