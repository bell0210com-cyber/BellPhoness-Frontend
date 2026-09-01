import { auth } from './firebaseClient';

const baseUrl = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://api.bellphoness.com');

async function request(path, options = {}) {
  const token = await auth?.currentUser?.getIdToken();

  if (!token) throw new Error('Sign in with an authorized administrator account first.');

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok)
    throw new Error((await response.json().catch(() => ({}))).message || 'Admin request failed.');

  return response.status === 204 ? null : response.json();
}

export const adminApi = {
  stats: () => request('/api/admin/stats'),
  products: (params) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return request(`/api/admin/products${qs}`);
  },
  product: (id) => request(`/api/admin/products/${id}`),
  createProduct: (product) =>
    request('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(product)
    }),
  updateProduct: (id, product) =>
    request(`/api/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product)
    }),
  setStatus: (id, is_active) =>
    request(`/api/admin/products/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active })
    }),
  deleteProduct: (id) => request(`/api/admin/products/${id}`, { method: 'DELETE' }),

  orders: (params) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return request(`/api/admin/orders${qs}`);
  },
  order: (id) => request(`/api/admin/orders/${id}`),
  updateOrderStatus: (id, status) =>
    request(`/api/admin/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),

  customers: () => request('/api/admin/customers'),
  customer: (id) => request(`/api/admin/customers/${id}`),

  settings: () => request('/api/admin/settings'),
  updateSettings: (settings) =>
    request('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    }),

  heroSlides: () => request('/api/admin/hero-slides'),
  heroSlide: (id) => request(`/api/admin/hero-slides/${id}`),
  createHeroSlide: (slide) =>
    request('/api/admin/hero-slides', {
      method: 'POST',
      body: JSON.stringify(slide)
    }),
  updateHeroSlide: (id, slide) =>
    request(`/api/admin/hero-slides/${id}`, {
      method: 'PUT',
      body: JSON.stringify(slide)
    }),
  deleteHeroSlide: (id) => request(`/api/admin/hero-slides/${id}`, { method: 'DELETE' })
};