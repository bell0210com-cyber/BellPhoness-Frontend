/**
 * Centralized API Base URL Resolver
 * Guarantees that local development (localhost / 127.0.0.1 / local network IPs)
 * resolves to the active local backend (http://localhost:5000 or VITE_API_URL / VITE_API_BASE_URL)
 * while production environments resolve to https://api.bellphoness.com.
 */
export function getApiBaseUrl() {
  const envUrl = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    ''
  ).trim();

  if (typeof window !== 'undefined') {
    const host = window.location.hostname || '';
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      host.startsWith('172.') ||
      host.endsWith('.local')
    ) {
      return envUrl || 'http://localhost:5000';
    }
  }

  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/+$/, '');
  }

  return 'https://api.bellphoness.com';
}

export const API_BASE_URL = getApiBaseUrl();

