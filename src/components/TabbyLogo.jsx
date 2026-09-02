export default function TabbyLogo({ width = 80, height = 24, className = '', style = {} }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 80 24"
      width={width}
      height={height}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      role="img"
      aria-label="Tabby"
    >
      <rect width="80" height="24" rx="4" fill="#3DF0B0" />
      <text
        x="40"
        y="17"
        fontFamily="Arial, sans-serif"
        fontWeight="700"
        fontSize="14"
        fill="#000000"
        textAnchor="middle"
      >
        tabby
      </text>
    </svg>
  );
}
