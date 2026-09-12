import { useEffect } from 'react';

const TABBY_PUBLIC_KEY = import.meta.env.VITE_TABBY_PUBLIC_KEY || 'pk_test_b8e21976-59a6-4b82-9ae4-0b7305988e0b';
const TABBY_MERCHANT_CODE = import.meta.env.VITE_TABBY_MERCHANT_CODE || 'ALJA';

export default function TabbyCard({ price, currency = 'AED' }) {
  useEffect(() => {
    const numericPrice = Number(price) || 0;
    if (numericPrice <= 0) return;

    // Initialize official TabbyCard checkout snippet
    const initTabbyCard = () => {
      try {
        if (typeof window.TabbyCard === 'function') {
          new window.TabbyCard({
            selector: '#tabbyCard',
            currency: currency,
            price: numericPrice.toFixed(2),
            lang: 'en',
            publicKey: TABBY_PUBLIC_KEY,
            merchantCode: TABBY_MERCHANT_CODE,
            shouldInheritBg: false,
          });
        }
      } catch (err) {
        console.warn('[TabbyCard] initialization notice:', err);
      }
    };

    const scriptSrc = 'https://checkout.tabby.ai/tabby-card.js';
    const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);

    if (!existingScript) {
      const script = document.createElement('script');
      script.src = scriptSrc;
      script.async = true;
      script.onload = initTabbyCard;
      document.body.appendChild(script);
    } else {
      initTabbyCard();
    }
  }, [price, currency]);

  if (!price) return null;

  return (
    <div className="tabby-card-container" style={{ marginTop: '8px' }}>
      {/* Official Tabby Checkout Card Container */}
      <div id="tabbyCard"></div>
    </div>
  );
}
