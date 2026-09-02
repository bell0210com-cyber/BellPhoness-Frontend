export default function TabbyLogo({
  width = 80,
  height = 28,
  variant = 'badge', // 'badge' | 'text' | 'icon'
  className = '',
  style = {},
}) {
  if (variant === 'icon') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 28 28"
        width={height || 28}
        height={height || 28}
        className={className}
        style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
        role="img"
        aria-label="Tabby"
      >
        <rect width="28" height="28" rx="8" fill="#3DF0B0" />
        <text
          x="14"
          y="20"
          fontFamily="Arial Black, -apple-system, BlinkMacSystemFont, sans-serif"
          fontWeight="900"
          fontSize="16"
          fill="#1A1919"
          textAnchor="middle"
        >
          t
        </text>
      </svg>
    );
  }

  if (variant === 'text') {
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
        <text
          x="40"
          y="21"
          fontFamily="Arial Black, -apple-system, BlinkMacSystemFont, sans-serif"
          fontWeight="900"
          fontSize="18"
          fill="#1A1919"
          textAnchor="middle"
          letterSpacing="-0.5px"
        >
          tabby
        </text>
      </svg>
    );
  }

  // Default: Official Green Badge Logo (from Marketing Toolkit guidelines)
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
      <rect width="80" height="28" rx="8" fill="#3DF0B0" />
      <text
        x="40"
        y="20"
        fontFamily="Arial Black, -apple-system, BlinkMacSystemFont, sans-serif"
        fontWeight="900"
        fontSize="15"
        fill="#1A1919"
        textAnchor="middle"
        letterSpacing="-0.3px"
      >
        tabby
      </text>
    </svg>
  );
}
