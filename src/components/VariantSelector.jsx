export default function VariantSelector({ label, options, selected, onSelect, type = 'button' }) {
  if (!options.length) return null;
  return <section className={`variant-selector ${type === 'color' ? 'color-selector' : ''}`}><p><b>{label}:</b> {selected || 'Select an option'}</p><div className="variant-options">{options.map(({ value, hex, available }) => type === 'color' ? <button type="button" className={`swatch ${selected === value ? 'selected' : ''}`} key={value} disabled={!available} onClick={() => onSelect(value)} aria-label={value} title={value}><i style={{ backgroundColor: hex || '#999' }} /></button> : <button type="button" key={value} disabled={!available} className={selected === value ? 'selected' : ''} onClick={() => onSelect(value)}>{value}</button>)}</div></section>;
}
