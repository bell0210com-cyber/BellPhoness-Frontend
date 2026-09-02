export default function TabbyLogo({ width = 80, height = 28, className = '', style = {} }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 80 28"
      width={width}
      height={height}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      role="img"
      aria-label="Tabby"
    >
      <rect width="80" height="28" rx="8" fill="#6CFF93" />
      <text
        x="40"
        y="20"
        fontFamily="Arial Black, sans-serif"
        fontWeight="900"
        fontSize="15"
        fill="#1A1919"
        textAnchor="middle"
      >
        tabby
      </text>
    </svg>
  );
}
