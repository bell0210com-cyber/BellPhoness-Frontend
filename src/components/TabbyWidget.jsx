export default function TabbyWidget({ amount = 0, inline = true }) {
  const numericAmount = Number(amount) || 0;
  if (numericAmount <= 0) return null;

  return (
    <div
      className={`tabby-promo-badge ${inline ? 'tabby-inline' : ''}`}
      style={{
        opacity: 0.65,
        cursor: 'not-allowed',
        border: '1px dashed #d8d1c8',
        background: '#faf8f5',
        userSelect: 'none',
        borderRadius: 8,
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
      }}
      role="region"
      aria-label="Tabby Installment Options (Coming Soon)"
    >
      <div className="tabby-badge-content" style={{ cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="tabby-icon-logo">
          <span className="tabby-logo-text" style={{ opacity: 0.85 }}>tabby</span>
        </span>
        <span className="tabby-text" style={{ color: '#777', fontWeight: 600, fontSize: 12 }}>
          Coming Soon
        </span>
      </div>
    </div>
  );
}
