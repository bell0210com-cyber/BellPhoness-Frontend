import { collection, addDoc, getDocs, query, where, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseClient';

const COLLECTION_NAME = 'reviews';

/**
 * Add a new review
 */
export async function addReview({ productId, customerName, customerUID, orderId, rating, reviewTitle, reviewText, verifiedPurchase }) {
  if (!db) throw new Error('Database not available.');
  
  // Check if this user already reviewed this exact product for this order (optional, to prevent spam)
  const q = query(
    collection(db, COLLECTION_NAME),
    where('productId', '==', productId),
    where('customerUID', '==', customerUID),
    where('orderId', '==', orderId)
  );
  
  const existing = await getDocs(q);
  if (!existing.empty) {
    throw new Error('You have already reviewed this item for this order.');
  }

  const reviewData = {
    productId,
    customerName,
    customerUID,
    orderId,
    rating: Number(rating),
    reviewTitle: reviewTitle || '',
    reviewText: reviewText || '',
    verifiedPurchase,
    date: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), reviewData);
  return docRef.id;
}

/**
 * Get reviews for a specific product
 */
export async function getProductReviews(productId) {
  if (!db) return [];
  const q = query(
    collection(db, COLLECTION_NAME),
    where('productId', '==', productId)
  );
  
  const snapshot = await getDocs(q);
  
  const reviews = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date?.toDate?.() || new Date(),
  }));
  
  // Sort by newest first client-side (no composite index needed)
  return reviews.sort((a, b) => b.date - a.date);
}

/**
 * Get all reviews (for Admin panel)
 */
export async function getAllReviews() {
  if (!db) return [];
  const q = query(collection(db, COLLECTION_NAME));
  
  const snapshot = await getDocs(q);
  const reviews = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date?.toDate?.() || new Date(),
  }));
  
  // Sort by newest first
  return reviews.sort((a, b) => b.date - a.date);
}

/**
 * Delete a review (Admin)
 */
export async function deleteReview(reviewId) {
  if (!db) throw new Error('Database not available.');
  await deleteDoc(doc(db, COLLECTION_NAME, reviewId));
}
