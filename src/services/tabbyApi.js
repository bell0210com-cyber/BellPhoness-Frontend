import { getAuth } from 'firebase/auth';
import { getApiBaseUrl } from './apiConfig';

const getEndpoint = (path) => {
  const base = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    getApiBaseUrl()
  ).replace(/\/+$/, '');
  return `${base}${path}`;
};

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
    let res;
    try {
      res = await fetch(getEndpoint('/api/tabby/create-checkout'), {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
    } catch (networkError) {
      console.error('[Tabby API] Connection failure:', networkError);
      const isLocal =
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      const msg = isLocal
        ? 'Unable to connect to the backend server (http://localhost:5000). Please ensure the backend is running.'
        : 'Unable to connect to the payment server. Please check your internet connection or try another payment method.';
      const err = new Error(msg);
      err.isNetworkError = true;
      throw err;
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.message || data.error || 'Failed to initiate Tabby checkout.');
      err.rejection_reason = data.rejection_reason || data.code || null;
      err.code = data.code || data.rejection_reason || null;
      err.details = data.details || null;
      throw err;
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

    let res;
    try {
      res = await fetch(getEndpoint('/api/tabby/verify-return'), {
        method: 'POST',
        headers,
        body: JSON.stringify({ orderId, paymentStatus, paymentId }),
      });
    } catch (networkError) {
      console.error('[Tabby API] verifyReturn connection failure:', networkError);
      throw new Error('Unable to connect to the payment verification server.');
    }

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

    let res;
    try {
      res = await fetch(getEndpoint(`/api/tabby/payment/${orderId}`), {
        method: 'GET',
        headers,
      });
    } catch (networkError) {
      console.error('[Tabby API] getPaymentStatus connection failure:', networkError);
      throw new Error('Unable to fetch payment status from the server.');
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch payment status from Tabby.');
    }
    return data;
  },
};
