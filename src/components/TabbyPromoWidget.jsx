import { useEffect, useRef, useState } from 'react';
import TabbyLogo from './TabbyLogo';

const TABBY_PUBLIC_KEY = import.meta.env.VITE_TABBY_PUBLIC_KEY || 'pk_test_b8e21976-59a6-4b82-9ae4-0b7305988e0b';
const TABBY_MERCHANT_CODE = import.meta.env.VITE_TABBY_MERCHANT_CODE || 'ALJA';

export default function TabbyPromoWidget({ 
  price, 
  currency = 'AED', 
  source = 'product', 
  containerId = 'TabbyPromo' 
}) {
  const containerRef = useRef(null);
  const [tabbyScriptRendered, setTabbyScriptRendered] = useState(false);
  const numericPrice = Number(price) || 0;
  const installmentAmount = numericPrice > 0 ? (numericPrice / 4).toFixed(2) : '0.00';

  useEffect(() => {
    if (numericPrice <= 0) return;

    // Sanitizer function to fix currency symbol glitch (Ð / ৳ / unicode -> AED) and text formatting
    // Strictly enforces: "As low as AED {amount}/month or 4 interest-free payments."
    const sanitizeTabbyDOM = () => {
      const container = document.getElementById(containerId) || containerRef.current;
      if (!container) return;

      // Detect if Tabby script actually populated meaningful DOM content
      const hasContent = container.querySelector('[class*="Currency"], [class*="currency"], [class*="snippet"], [class*="Snippet"]') ||
        ((container.textContent || '').trim().length > 10 && (container.textContent || '').includes('interest'));
      if (hasContent) {
        setTabbyScriptRendered(true);
      }

      // 1. Process all text nodes inside container
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
      let textNode;
      const nodes = [];
      while ((textNode = walker.nextNode())) {
        nodes.push(textNode);
      }

      for (const node of nodes) {
        let val = node.nodeValue;
        if (!val) continue;

        let changed = false;

        // Currency Symbol Glitch: Replace ANY distorted/encoded currency symbol, unicode glyph, or placeholder
        // Covers:
        // 1. All Unicode currency symbols: \p{Sc} (e.g. ৳, $, €, £, ¥, ₹, ¤, etc.)
        // 2. Latin D variations used as Dirham placeholders: Ð (U+00D0), Đ (U+0110), đ (U+0111)
        // 3. Arabic Dirham symbol: د.إ
        // 4. Any non-ASCII symbol/character adjacent to digits (e.g. unknown glyph before price)
        const ROBUST_CURRENCY_REGEX = /[Ð\u00D0\u0110\u0111\u09F3\u00A4\p{Sc}]|د\.إ/gu;
        if (ROBUST_CURRENCY_REGEX.test(val)) {
          val = val.replace(ROBUST_CURRENCY_REGEX, 'AED ');
          changed = true;
        }

        const NON_ASCII_BEFORE_NUM = /([^\x00-\x7F\s]|[^a-zA-Z0-9\s.,/()'\-])(?=\s*\d+[.,]\d{2})/g;
        if (NON_ASCII_BEFORE_NUM.test(val)) {
          val = val.replace(NON_ASCII_BEFORE_NUM, 'AED ');
          changed = true;
        }

        // Text Formatting: Add a hyphen to "interest-free" so the copy strictly reads: "or 4 interest-free payments."
        if (/interest\s*-\s*free\s+payments\.?|interest\s+free\s+payments\.?/gi.test(val)) {
          val = val.replace(/interest\s*-\s*free\s+payments\.?|interest\s+free\s+payments\.?/gi, 'interest-free payments.');
          changed = true;
        } else if (/interest\s+free/gi.test(val)) {
          val = val.replace(/interest\s+free/gi, 'interest-free');
          changed = true;
        }

        // Clean up any double spaces around AED
        if (/AED\s+/g.test(val)) {
          val = val.replace(/AED\s+/g, 'AED ');
          changed = true;
        }

        if (changed) {
          node.nodeValue = val;
        }
      }

      // 2. Specific fix for Tabby's Currency elements (<span class="Currency__Currency_aed...">)
      // Unconditionally force 'AED ' for ANY character/glyph Tabby injects into its currency container
      const currencyEls = container.querySelectorAll('[class*="Currency"], [class*="currency"]');
      currencyEls.forEach((el) => {
        el.style.fontFeatureSettings = 'normal';
        el.style.fontFamily = 'inherit';
        const txt = (el.textContent || '').trim();
        if (txt !== 'AED') {
          el.textContent = 'AED ';
        }
      });
    };

    // Run immediate sanitization
    sanitizeTabbyDOM();

    // Set up MutationObserver to re-sanitize continuously as Tabby's script renders or re-renders
    let observer = null;
    const targetElement = document.getElementById(containerId) || containerRef.current;
    if (targetElement) {
      observer = new MutationObserver(() => {
        sanitizeTabbyDOM();
      });
      observer.observe(targetElement, { childList: true, subtree: true, characterData: true });
    }

    // Initialize official Tabby Promo snippet
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
          // Sanitize immediately after init call
          setTimeout(sanitizeTabbyDOM, 50);
          setTimeout(sanitizeTabbyDOM, 200);
          setTimeout(sanitizeTabbyDOM, 600);
        }
      } catch (err) {
        console.warn('[TabbyPromo] initialization notice:', err);
      }
    };

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

    return () => {
      if (observer) observer.disconnect();
    };
  }, [price, currency, source, containerId, numericPrice]);

  if (!price || numericPrice <= 0) return null;

  return (
    <div className="tabby-promo-container" style={{ margin: 0 }} ref={containerRef}>
      {/* Official Tabby on-site messaging container */}
      <div
        id={containerId}
        className="tabby-promo-mount"
        style={{ display: tabbyScriptRendered ? 'block' : 'none' }}
      />

      {/* Verified baseline markup: ensures seamless display while or if script does not populate */}
      {!tabbyScriptRendered && (
        <div
          className="tabby-promo-baseline"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            flexWrap: 'wrap',
            background: '#111111',
            border: '0.5px solid #2a2a2a',
            borderRadius: '10px',
            padding: '10px 14px',
            fontSize: '12.5px',
            color: '#e4e4e7',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
            <span>As low as <strong>AED {installmentAmount}/month</strong> or 4 interest-free payments.</span>
          </span>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <TabbyLogo width={64} height={22} />
          </div>
        </div>
      )}
    </div>
  );
}
