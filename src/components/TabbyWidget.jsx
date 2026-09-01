import { useState, useEffect } from 'react';

const formatMoney = (value) =>
  new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    maximumFractionDigits: 0,
  }).format(value);

export default function TabbyWidget({ amount = 0, inline = true }) {
  const [showModal, setShowModal] = useState(false);
  const numericAmount = Number(amount) || 0;
  const instalmentAmount = numericAmount / 4;

  const publicKey = import.meta.env.VITE_TABBY_PUBLIC_KEY;
  const merchantCode = import.meta.env.VITE_TABBY_MERCHANT_CODE || 'bellphones_ae';
  const isConfigured = Boolean(publicKey && publicKey !== 'placeholder_public_key');

  useEffect(() => {
    if (!isConfigured) return;

    // Load Tabby promo CDN script
    const SCRIPT_ID = 'tabby-promo-script';
    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = 'https://checkout.tabby.ai/tabby-promo.js';
      script.async = true;
      script.onload = () => {
        if (window.TabbyPromo) {
          try {
            new window.TabbyPromo({
              selector: '#tabby-promo-node',
              currency: 'AED',
              price: numericAmount,
              installmentsCount: 4,
              lang: 'en',
              source: 'product',
              publicKey: publicKey,
              merchantCode: merchantCode,
            });
          } catch (e) {
            console.debug('Tabby Promo init:', e);
          }
        }
      };
      document.body.appendChild(script);
    }
  }, [publicKey, merchantCode, isConfigured, numericAmount]);

  if (numericAmount <= 0) return null;

  return (
    <>
      <div className={`tabby-promo-badge ${inline ? 'tabby-inline' : ''}`} role="region" aria-label="Tabby Installment Options">
        <div className="tabby-badge-content">
          <span className="tabby-icon-logo">
            <span className="tabby-logo-text">tabby</span>
          </span>
          <span className="tabby-text">
            or 4 interest-free payments of <strong>{formatMoney(instalmentAmount)}</strong>
          </span>
          <button
            type="button"
            className="tabby-info-btn"
            onClick={() => setShowModal(true)}
            title="Learn more about Tabby split payments"
            aria-label="Tabby payment information"
          >
            ⓘ
          </button>
        </div>
      </div>

      {/* Tabby Information Modal */}
      {showModal && (
        <div className="tabby-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="tabby-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <button
              type="button"
              className="tabby-modal-close"
              onClick={() => setShowModal(false)}
              aria-label="Close dialog"
            >
              ✕
            </button>

            <div className="tabby-modal-header">
              <div className="tabby-modal-logo">tabby</div>
              <h3>Split your payment into 4 with Tabby</h3>
              <p>Shop now and pay over 4 months with zero interest and no hidden fees.</p>
            </div>

            <div className="tabby-timeline">
              <div className="tabby-timeline-step active">
                <div className="tabby-step-circle">1</div>
                <div className="tabby-step-info">
                  <strong>Today</strong>
                  <span>{formatMoney(instalmentAmount)} (25%)</span>
                </div>
              </div>

              <div className="tabby-timeline-step">
                <div className="tabby-step-circle">2</div>
                <div className="tabby-step-info">
                  <strong>1 Month Later</strong>
                  <span>{formatMoney(instalmentAmount)} (25%)</span>
                </div>
              </div>

              <div className="tabby-timeline-step">
                <div className="tabby-step-circle">3</div>
                <div className="tabby-step-info">
                  <strong>2 Months Later</strong>
                  <span>{formatMoney(instalmentAmount)} (25%)</span>
                </div>
              </div>

              <div className="tabby-timeline-step">
                <div className="tabby-step-circle">4</div>
                <div className="tabby-step-info">
                  <strong>3 Months Later</strong>
                  <span>{formatMoney(instalmentAmount)} (25%)</span>
                </div>
              </div>
            </div>

            <div className="tabby-features">
              <div className="tabby-feature-item">
                <span className="tabby-feature-icon">✓</span>
                <div>
                  <strong>No Interest, No Added Fees</strong>
                  <p>Pay zero interest when you pay on time. Total transparency.</p>
                </div>
              </div>
              <div className="tabby-feature-item">
                <span className="tabby-feature-icon">⚡</span>
                <div>
                  <strong>Instant Approval in Seconds</strong>
                  <p>Fast approval using your UAE mobile number and debit or credit card.</p>
                </div>
              </div>
              <div className="tabby-feature-item">
                <span className="tabby-feature-icon">🔒</span>
                <div>
                  <strong>Sharia-Compliant & Secure</strong>
                  <p>Certified, secure, and accepted across the UAE.</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="button button-gold tabby-modal-btn"
              onClick={() => setShowModal(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
