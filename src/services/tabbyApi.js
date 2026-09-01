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

export const tabbyApi = {
  /**
   * Initiates a Tabby checkout session and returns checkout_url
   * POST /api/tabby/create-checkout
   */
  createCheckoutSession: async (payload) => {
    const headers = await authHeader();
    const res = await fetch(`${API_BASE}/api/tabby/create-checkout`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Failed to initiate Tabby checkout.');
    }
    return data;
  },

  /**
   * Verifies return status when customer returns from Tabby payment portal
   * POST /api/tabby/verify-return
   */
  verifyReturn: async (orderId, paymentStatus, paymentId) => {
    const auth = getAuth();
    const user = auth.currentUser;
    const headers = { 'Content-Type': 'application/json' };
    if (user) {
      const token = await user.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/api/tabby/verify-return`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ orderId, paymentStatus, paymentId }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Failed to verify Tabby return payment.');
    }
    return data;
  },

  /**
   * Fetches live payment status from Tabby
   * GET /api/tabby/payment/:id
   */
  getPaymentStatus: async (orderId) => {
    const auth = getAuth();
    const user = auth.currentUser;
    const headers = { 'Content-Type': 'application/json' };
    if (user) {
      const token = await user.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/api/tabby/payment/${orderId}`, {
      method: 'GET',
      headers,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch payment status from Tabby.');
    }
    return data;
  },
};
