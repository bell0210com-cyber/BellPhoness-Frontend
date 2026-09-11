import { getAuth } from 'firebase/auth';
import { getApiBaseUrl } from './apiConfig';

const getEndpoint = (path) => {
  const base = getApiBaseUrl().replace(/\/+$/, '');
  return `${base}${path}`;
};

async function authHeader() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Please sign in to complete checkout.');
  const token = await user.getIdToken(true);
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export const tabbyApi = {
  /**
   * Initiates a Tabby checkout session and returns checkout_url
   * POST /api/tabby/create-checkout
   */
  createCheckoutSession: async (payload) => {
    const headers = await authHeader();
    const endpoint = getEndpoint('/api/tabby/create-checkout');
    let res;

    try {
      res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
    } catch (networkError) {
      console.warn('[Tabby API] Primary connection attempt failed, trying fallback/retry...', networkError);

      // 1. Try 127.0.0.1 if localhost failed (or vice-versa) for Windows IPv6/IPv4 binding differences
      let fallbackEndpoint = null;
      if (endpoint.includes('localhost:5000')) {
        fallbackEndpoint = endpoint.replace('localhost:5000', '127.0.0.1:5000');
      } else if (endpoint.includes('127.0.0.1:5000')) {
        fallbackEndpoint = endpoint.replace('127.0.0.1:5000', 'localhost:5000');
      }

      if (fallbackEndpoint) {
        try {
          res = await fetch(fallbackEndpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
          });
        } catch {
          // fallback failed, continue to retry
        }
      }

      // 2. If still unreached (e.g. backend was restarting), retry after 600ms
      if (!res) {
        await new Promise((r) => setTimeout(r, 600));
        try {
          res = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
          });
        } catch (retryError) {
          console.warn('[Tabby API] Connection failure after retries:', retryError?.message || retryError);
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
      }
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.message || data.error || 'Failed to initiate Tabby checkout.');
      err.status = res.status;
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
  verifyReturn: async (orderId, paymentStatus, paymentId, options = {}) => {
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
        signal: options.signal,
        body: JSON.stringify({ orderId, paymentStatus, paymentId }),
      });
    } catch (networkError) {
      if (options.signal?.aborted) return { success: false, aborted: true };

      const endpoint = getEndpoint('/api/tabby/verify-return');
      let fallbackEndpoint = null;
      if (endpoint.includes('localhost:5000')) {
        fallbackEndpoint = endpoint.replace('localhost:5000', '127.0.0.1:5000');
      } else if (endpoint.includes('127.0.0.1:5000')) {
        fallbackEndpoint = endpoint.replace('127.0.0.1:5000', 'localhost:5000');
      }

      if (fallbackEndpoint) {
        try {
          res = await fetch(fallbackEndpoint, {
            method: 'POST',
            headers,
            signal: options.signal,
            body: JSON.stringify({ orderId, paymentStatus, paymentId }),
          });
        } catch {}
      }

      if (!res) {
        console.warn('[Tabby API] verifyReturn connection failure:', networkError?.message || networkError);
        throw new Error('Unable to connect to the payment verification server.');
      }
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const is429 = res.status === 429;
      const msg = data.message || (is429 ? 'Too many requests, please try again later.' : 'Failed to verify Tabby return payment.');
      const err = new Error(msg);
      err.status = res.status;
      err.isRateLimited = is429;
      throw err;
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
      console.warn('[Tabby API] getPaymentStatus connection failure:', networkError?.message || networkError);
      throw new Error('Unable to fetch payment status from the server.');
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch payment status from Tabby.');
    }
    return data;
  },
};
