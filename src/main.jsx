import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';

// Gracefully handle benign third-party AbortErrors and extension warnings
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('using deprecated parameters for the initialization function')
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };

  window.addEventListener('unhandledrejection', (event) => {
    const msg = event.reason?.message || String(event.reason || '');
    if (
      event.reason?.name === 'AbortError' ||
      msg.includes('aborted without reason') ||
      msg.includes('The user aborted a request')
    ) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
