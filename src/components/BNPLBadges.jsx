import TabbyLogo from './TabbyLogo';

export default function BNPLBadges({ price = 0 }) {
  const numericPrice = Number(price) || 0;
  if (numericPrice <= 0) return null;

  const installment = (numericPrice / 4).toFixed(2);

  const containerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '8px',
    marginTop: '12px',
  };

  const cardStyle = {
    backgroundColor: '#111111',
    border: '0.5px solid #2a2a2a',
    borderRadius: '10px',
    padding: '10px 14px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '4px',
    boxSizing: 'border-box',
  };

  const tamaraLogoStyle = {
    color: '#FFD700',
    fontWeight: 700,
    fontSize: '11px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  };

  const subtitleStyle = {
    color: '#888888',
    fontSize: '12px',
    lineHeight: '1.2',
    margin: 0,
  };

  const amountStyle = {
    color: '#ffffff',
    fontWeight: 600,
    fontSize: '15px',
    lineHeight: '1.2',
    margin: '2px 0 0',
  };

  return (
    <div className="bnpl-badges-wrapper" style={{ marginTop: '12px' }}>
      <div className="bnpl-badges-container" style={containerStyle} aria-label="BNPL installment options">
        {/* Tamara Card */}
        <div className="bnpl-badge-card" style={cardStyle}>
          <span style={tamaraLogoStyle}>TAMARA</span>
          <span style={subtitleStyle}>4 interest-free payments</span>
          <span style={amountStyle}>AED {installment} / mo</span>
        </div>

        {/* Tabby Card with Official SVG Logo */}
        <div className="bnpl-badge-card" style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
            <TabbyLogo width={68} height={24} />
          </div>
          <span style={subtitleStyle}>4 interest-free payments</span>
          <span style={amountStyle}>AED {installment} / mo</span>
        </div>
      </div>

      {/* UAE Tabby Regulatory Disclaimer */}
      <p style={{ fontSize: '11px', color: '#888888', margin: '8px 0 0', lineHeight: 1.4 }}>
        Pay Later (Short Term Credit) is provided by Tabby LLC. Terms and conditions apply. For more information or to contact us, visit tabby.ai
      </p>
    </div>
  );
}
