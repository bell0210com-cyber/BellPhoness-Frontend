import { useEffect } from 'react';

const TABBY_PUBLIC_KEY = import.meta.env.VITE_TABBY_PUBLIC_KEY || 'pk_test_01a03e76-a3d2-02e4-385f-b38bd6ca4d3a';
const TABBY_MERCHANT_CODE = import.meta.env.VITE_TABBY_MERCHANT_CODE || 'ALJA';

export default function TabbyPromoWidget({ price, currency = 'AED' }) {
  useEffect(() => {
    const numericPrice = Number(price) || 0;
    if (numericPrice <= 0) return;

    // Tabby official on-site messaging initialization function
    const initTabby = () => {
      if (window.TabbyPromo) {
        new window.TabbyPromo({
          selector: '#TabbyPromo',
          currency: currency,
          price: numericPrice.toString(),
          lang: 'en',
          source: 'product',
          publicKey: TABBY_PUBLIC_KEY,
          merchantCode: TABBY_MERCHANT_CODE,
        });
      }
    };

    // Check if the official Tabby snippet script is already loaded
    const scriptSrc = 'https://checkout.tabby.ai/tabby-promo.js';
    const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);

    if (!existingScript) {
      const script = document.createElement('script');
      script.src = scriptSrc;
      script.async = true;
      script.onload = initTabby;
      document.body.appendChild(script);
    } else {
      initTabby();
    }
  }, [price, currency]);

  if (!price) return null;

  return (
    <div className="tabby-promo-container" style={{ margin: '14px 0 16px' }}>
      {/* Official Tabby on-site messaging container */}
      <div id="TabbyPromo"></div>
    </div>
  );
}
