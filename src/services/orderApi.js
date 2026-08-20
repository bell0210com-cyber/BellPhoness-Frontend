import { getAuth } from 'firebase/auth';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

async function authHeader() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Please sign in to place an order.');
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export const orderApi = {
  create: async (payload) => {
    const headers = await authHeader();
    const res = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to place order.');
    }
    return res.json();
  },
  list: async () => {
    const headers = await authHeader();
    const res = await fetch(`${API_BASE}/api/orders`, { headers });
    if (!res.ok) throw new Error('Failed to load orders.');
    return res.json();
  },
  get: async (id) => {
    const headers = await authHeader();
    const res = await fetch(`${API_BASE}/api/orders/${id}`, { headers });
    if (!res.ok) throw new Error('Failed to load order.');
    return res.json();
  },
};