import {
  collection,
  query,
  where,
  getCountFromServer
} from 'firebase/firestore';
import { db } from './firebaseClient';
import { adminApi } from './adminApi';

/**
 * Utility: Fetch true total count of products directly from Firestore
 * Uses Firestore server-side aggregation (0 full document downloads)
 */
export async function getTotalProductsCount(dbInstance = db) {
  if (!dbInstance) return 0;
  const productsColl = collection(dbInstance, 'products');
  const snap = await getCountFromServer(productsColl);
  return snap.data().count || 0;
}

/**
 * Utility: Fetch true count of active products directly from Firestore
 */
export async function getActiveProductsCount(dbInstance = db) {
  if (!dbInstance) return 0;
  const productsColl = collection(dbInstance, 'products');

  try {
    // Check is_active == true (standard in Bell schema)
    const activeQuery = query(productsColl, where('is_active', '==', true));
    const activeSnap = await getCountFromServer(activeQuery);
    const count = activeSnap.data().count || 0;
    if (count > 0) return count;

    // Check status == 'Active' (alternative schema support)
    const statusQuery = query(productsColl, where('status', '==', 'Active'));
    const statusSnap = await getCountFromServer(statusQuery);
    return statusSnap.data().count || 0;
  } catch (err) {
    console.warn('Error in getActiveProductsCount:', err);
    return 0;
  }
}

/**
 * Utility: Fetch true total count of orders directly from Firestore
 */
export async function getTotalOrdersCount(dbInstance = db) {
  if (!dbInstance) return 0;
  const ordersColl = collection(dbInstance, 'orders');
  const snap = await getCountFromServer(ordersColl);
  return snap.data().count || 0;
}

/**
 * Utility: Fetch true count of pending orders directly from Firestore
 */
export async function getPendingOrdersCount(dbInstance = db) {
  if (!dbInstance) return 0;
  const ordersColl = collection(dbInstance, 'orders');
  const pendingQuery = query(ordersColl, where('status', '==', 'Pending'));
  const snap = await getCountFromServer(pendingQuery);
  return snap.data().count || 0;
}

/**
 * Utility: Fetch all decoupled summary card aggregations
 */
export async function fetchDashboardSummaryAggregations(dbInstance = db) {
  let totalProducts = 0;
  let activeProducts = 0;
  let totalOrders = 0;
  let pendingOrders = 0;
  let lowStock = 0;
  let outOfStock = 0;
  let revenue = 0;

  let directSuccess = false;

  if (dbInstance) {
    try {
      const [
        totalProds,
        activeProds,
        totalOrds,
        pendingOrds
      ] = await Promise.all([
        getTotalProductsCount(dbInstance),
        getActiveProductsCount(dbInstance),
        getTotalOrdersCount(dbInstance),
        getPendingOrdersCount(dbInstance)
      ]);

      totalProducts = totalProds;
      activeProducts = activeProds;
      totalOrders = totalOrds;
      pendingOrders = pendingOrds;
      directSuccess = true;
    } catch (err) {
      console.warn('Direct Firestore getCountFromServer query failed:', err);
    }
  }

  // Fetch server stats for revenue & stock calculations (or fallback for counts)
  try {
    const statsData = await adminApi.stats();
    if (statsData) {
      lowStock = statsData.lowStock ?? 0;
      outOfStock = statsData.outOfStock ?? 0;
      revenue = statsData.revenue ?? 0;

      if (!directSuccess) {
        totalProducts = statsData.totalProducts ?? 0;
        activeProducts = statsData.activeProducts ?? 0;
        totalOrders = statsData.totalOrders ?? 0;
        pendingOrders = statsData.pendingOrders ?? 0;
      }
    }
  } catch (err) {
    console.warn('adminApi.stats fallback failed:', err);
  }

  const inactiveProducts = Math.max(0, totalProducts - activeProducts);

  return {
    totalProducts,
    activeProducts,
    inactiveProducts,
    lowStock,
    outOfStock,
    totalOrders,
    pendingOrders,
    revenue
  };
}
