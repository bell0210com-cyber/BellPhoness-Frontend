/**
 * Centralized API Base URL Resolver
 * Guarantees that production web and mobile browsers always resolve to https://api.bellphoness.com
 * while local development resolves to http://localhost:5000.
 */
export function getApiBaseUrl() {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    }
  }

  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/+$/, '');
  }

  return 'https://api.bellphoness.com';
}

export const API_BASE_URL = getApiBaseUrl();
