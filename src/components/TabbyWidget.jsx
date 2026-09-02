import { useState } from 'react';
import TabbyLogo from './TabbyLogo';

const formatMoney = (value) =>
  new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    maximumFractionDigits: 0,
  }).format(value);

export default function TabbyWidget({ amount = 0, inline = true, showDisclaimer = true }) {
  const [showModal, setShowModal] = useState(false);
  const numericAmount = Number(amount) || 0;
  const instalmentAmount = numericAmount / 4;

  if (numericAmount <= 0) return null;

  return (
    <div className="tabby-widget-container">
      <div className={`tabby-promo-badge ${inline ? 'tabby-inline' : ''}`} role="region" aria-label="Tabby Payment Options">
        <div className="tabby-badge-content" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span className="tabby-text" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            or 4 interest-free payments of <strong>{formatMoney(instalmentAmount)}</strong> with
          </span>
          <TabbyLogo width={68} height={24} />
          <button
            type="button"
            className="tabby-info-btn"
            onClick={() => setShowModal(true)}
            title="Learn more about Tabby Pay in 4"
            aria-label="Tabby payment information"
          >
            ⓘ
          </button>
        </div>
      </div>

      {showDisclaimer && (
        <p style={{ fontSize: '11px', color: '#888888', margin: '6px 0 0', lineHeight: 1.35 }}>
          Pay Later (Short Term Credit) is provided by Tabby LLC. Terms and conditions apply. For more information or to contact us, visit tabby.ai
        </p>
      )}

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
              <div className="tabby-modal-logo" style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <TabbyLogo width={96} height={34} />
              </div>
              <h3>Pay in 4 with Tabby</h3>
              <p>Shop now and pay over 4 months with 4 interest-free payments and no hidden fees.</p>
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

            <p style={{ fontSize: '11px', color: '#888888', margin: '16px 0', lineHeight: 1.4, textAlign: 'center' }}>
              Pay Later (Short Term Credit) is provided by Tabby LLC. Terms and conditions apply. For more information or to contact us, visit tabby.ai
            </p>

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
    </div>
  );
}
