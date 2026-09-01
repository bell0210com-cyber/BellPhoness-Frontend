import { getAuth } from 'firebase/auth';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://api.bellphoness.com');

async function authHeader() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Please sign in to complete checkout.');
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export const tamaraApi = {
  /**
   * Initiates a Tamara checkout session and returns checkout_url
   * POST /api/tamara/create-checkout
   */
  createCheckoutSession: async (payload) => {
    const headers = await authHeader();
    const res = await fetch(`${API_BASE}/api/tamara/create-checkout`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Failed to initiate Tamara checkout.');
    }
    return data;
  },

  /**
   * Verifies return status when customer returns from Tamara payment portal
   * POST /api/tamara/verify-return
   */
  verifyReturn: async (orderId, paymentStatus, tamaraOrderId) => {
    const auth = getAuth();
    const user = auth.currentUser;
    const headers = { 'Content-Type': 'application/json' };
    if (user) {
      const token = await user.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/api/tamara/verify-return`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ orderId, paymentStatus, tamaraOrderId }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Failed to verify return payment.');
    }
    return data;
  },

  /**
   * Fetches live order status directly from Tamara
   * GET /api/tamara/order/:id
   */
  getOrderStatus: async (orderId) => {
    const auth = getAuth();
    const user = auth.currentUser;
    const headers = { 'Content-Type': 'application/json' };
    if (user) {
      const token = await user.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/api/tamara/order/${orderId}`, {
      method: 'GET',
      headers,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch order status from Tamara.');
    }
    return data;
  },
};
