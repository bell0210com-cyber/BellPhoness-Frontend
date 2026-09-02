export default function TamaraPromoCard({ price = 0 }) {
  const numericPrice = Number(price) || 0;
  if (numericPrice <= 0) return null;

  const installment = (numericPrice / 4).toFixed(2);

  return (
    <div
      className="tamara-promo-card"
      style={{
        backgroundColor: '#111111',
        border: '0.5px solid #2a2a2a',
        borderRadius: '10px',
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '4px',
        boxSizing: 'border-box',
      }}
      aria-label="Tamara 4 interest-free payments"
    >
      <span
        style={{
          color: '#FFD700',
          fontWeight: 700,
          fontSize: '11px',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
        }}
      >
        TAMARA
      </span>
      <span style={{ color: '#888888', fontSize: '12px', lineHeight: '1.2', margin: 0 }}>
        4 interest-free payments
      </span>
      <span
        style={{
          color: '#ffffff',
          fontWeight: 600,
          fontSize: '15px',
          lineHeight: '1.2',
          margin: '2px 0 0',
        }}
      >
        AED {installment} / mo
      </span>
    </div>
  );
}
