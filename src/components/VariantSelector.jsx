export default function VariantSelector({ label, options, selected, onSelect, type = 'button' }) {
  if (!options.length) return null;
  return (
    <section className={`variant-selector ${type === 'color' ? 'color-selector' : ''}`}>
      <p><b>{label}:</b> {selected || 'Select an option'}</p>
      <div className={`variant-options ${options.some(o => o.subLabel) ? 'has-sublabels' : ''}`}>
        {options.map(({ value, hex, available, subLabel }) =>
          type === 'color' ? (
            <button type="button" className={`swatch ${selected === value ? 'selected' : ''}`} key={value} disabled={!available} onClick={() => onSelect(value)} aria-label={value} title={value}>
              <i style={{ backgroundColor: hex || '#999' }} />
            </button>
          ) : (
            <button type="button" key={value} disabled={!available} className={`text-option ${selected === value ? 'selected' : ''}`} onClick={() => onSelect(value)}>
              <span className="main-label">{value}</span>
              {subLabel && <span className="sub-label">{subLabel}</span>}
            </button>
          )
        )}
      </div>
    </section>
  );
}
