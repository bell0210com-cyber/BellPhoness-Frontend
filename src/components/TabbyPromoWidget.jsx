import { useEffect } from 'react';

const TABBY_PUBLIC_KEY = import.meta.env.VITE_TABBY_PUBLIC_KEY || 'pk_test_b8e21976-59a6-4b82-9ae4-0b7305988e0b';
const TABBY_MERCHANT_CODE = import.meta.env.VITE_TABBY_MERCHANT_CODE || 'ALJA';

export default function TabbyPromoWidget({ 
  price, 
  currency = 'AED', 
  source = 'product', 
  containerId = 'TabbyPromo' 
}) {
  useEffect(() => {
    const numericPrice = Number(price) || 0;
    if (numericPrice <= 0) return;

    // Tabby official on-site messaging initialization function
    const initTabby = () => {
      try {
        if (typeof window.TabbyPromo === 'function') {
          new window.TabbyPromo({
            selector: `#${containerId}`,
            currency: currency,
            price: numericPrice.toString(),
            lang: 'en',
            source: source,
            publicKey: TABBY_PUBLIC_KEY,
            merchantCode: TABBY_MERCHANT_CODE,
          });
        }
      } catch (err) {
        console.warn('[TabbyPromo] initialization notice:', err);
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
  }, [price, currency, source, containerId]);

  if (!price) return null;

  return (
    <div className="tabby-promo-container" style={{ margin: 0 }}>
      {/* Official Tabby on-site messaging container */}
      <div id={containerId}></div>
    </div>
  );
}
