import { useState, useEffect } from 'react';

const formatMoney = (value) =>
  new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    maximumFractionDigits: 0,
  }).format(value);

export default function TamaraWidget({ amount = 0, inline = true }) {
  const [showModal, setShowModal] = useState(false);
  const numericAmount = Number(amount) || 0;
  const instalmentAmount = (numericAmount / 4);

  const publicKey = import.meta.env.VITE_TAMARA_PUBLIC_KEY;
  const isConfigured = Boolean(publicKey && publicKey !== 'placeholder_public_key');

  useEffect(() => {
    if (!isConfigured) return;

    // Set Tamara widget configuration if available
    window.TamaraWidgetConfig = {
      lang: 'en',
      country: 'AE',
      publicKey: publicKey,
      env: import.meta.env.VITE_TAMARA_ENV || 'sandbox',
    };

    // Load Tamara widget CDN script once
    const SCRIPT_ID = 'tamara-widget-script';
    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = 'https://cdn.tamara.co/widget-v2/tamara-widget.js';
      script.async = true;
      document.body.appendChild(script);
    } else if (window.TamaraWidget) {
      window.TamaraWidget.render?.();
    }
  }, [publicKey, isConfigured, numericAmount]);

  if (numericAmount <= 0) return null;

  return (
    <>
      <div className={`tamara-promo-badge ${inline ? 'tamara-inline' : ''}`} role="region" aria-label="Tamara Installment Options">
        <div className="tamara-badge-content">
          <span className="tamara-icon-logo">
            <span className="tamara-logo-text">tamara</span>
          </span>
          <span className="tamara-text">
            or 4 interest-free payments of <strong>{formatMoney(instalmentAmount)}</strong>
          </span>
          <button
            type="button"
            className="tamara-info-btn"
            onClick={() => setShowModal(true)}
            title="Learn more about Tamara split payments"
            aria-label="Tamara payment information"
          >
            ⓘ
          </button>
        </div>
      </div>

      {/* Tamara Information Modal */}
      {showModal && (
        <div className="tamara-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="tamara-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <button
              type="button"
              className="tamara-modal-close"
              onClick={() => setShowModal(false)}
              aria-label="Close dialog"
            >
              ✕
            </button>

            <div className="tamara-modal-header">
              <div className="tamara-modal-logo">tamara</div>
              <h3>Split your payment into 4</h3>
              <p>Shop now and pay over time with zero interest and zero fees.</p>
            </div>

            <div className="tamara-timeline">
              <div className="tamara-timeline-step active">
                <div className="step-circle">1</div>
                <div className="step-info">
                  <strong>Today</strong>
                  <span>{formatMoney(instalmentAmount)} (25%)</span>
                </div>
              </div>

              <div className="tamara-timeline-step">
                <div className="step-circle">2</div>
                <div className="step-info">
                  <strong>1 Month Later</strong>
                  <span>{formatMoney(instalmentAmount)} (25%)</span>
                </div>
              </div>

              <div className="tamara-timeline-step">
                <div className="step-circle">3</div>
                <div className="step-info">
                  <strong>2 Months Later</strong>
                  <span>{formatMoney(instalmentAmount)} (25%)</span>
                </div>
              </div>

              <div className="tamara-timeline-step">
                <div className="step-circle">4</div>
                <div className="step-info">
                  <strong>3 Months Later</strong>
                  <span>{formatMoney(instalmentAmount)} (25%)</span>
                </div>
              </div>
            </div>

            <div className="tamara-features">
              <div className="tamara-feature-item">
                <span className="feature-icon">✓</span>
                <div>
                  <strong>Zero Interest & Zero Hidden Fees</strong>
                  <p>Pay exactly the purchase price displayed — nothing more.</p>
                </div>
              </div>
              <div className="tamara-feature-item">
                <span className="feature-icon">⚡</span>
                <div>
                  <strong>Instant Approval in Seconds</strong>
                  <p>All you need is your UAE phone number and debit/credit card.</p>
                </div>
              </div>
              <div className="tamara-feature-item">
                <span className="feature-icon">🔒</span>
                <div>
                  <strong>Sharia-Compliant & Secure</strong>
                  <p>Certified payment processing with state-of-the-art encryption.</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="button button-gold tamara-modal-btn"
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
