import { useEffect } from 'react';

const TABBY_PUBLIC_KEY = import.meta.env.VITE_TABBY_PUBLIC_KEY || 'pk_test_01a03e76-a3d2-02e4-385f-b38bd6ca4d3a';
const TABBY_MERCHANT_CODE = import.meta.env.VITE_TABBY_MERCHANT_CODE || 'ALJA';

export default function TabbyCard({ price, currency = 'AED' }) {
  useEffect(() => {
    const numericPrice = Number(price) || 0;
    if (numericPrice <= 0) return;

    // Initialize official TabbyCard checkout snippet
    const initTabbyCard = () => {
      if (window.TabbyCard) {
        new window.TabbyCard({
          selector: '#tabbyCard',
          currency: currency,
          price: numericPrice.toFixed(2),
          lang: 'en',
          publicKey: TABBY_PUBLIC_KEY,
          merchantCode: TABBY_MERCHANT_CODE,
        });
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
