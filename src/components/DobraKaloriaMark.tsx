export function DobraKaloriaMark({ className = 'h-11 w-11' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`${className} shrink-0`}
      role="img"
      aria-label="Dobra Kaloria"
    >
      <rect x="5" y="5" width="190" height="190" rx="38" ry="38" fill="#ffffff" stroke="#111111" strokeWidth="8" />
      <text
        x="100"
        y="92"
        textAnchor="middle"
        fontFamily="Arial Black, Arial, Helvetica, sans-serif"
        fontSize="46"
        fontWeight="800"
        letterSpacing="-1.5"
        fill="#111111"
      >
        dobra
      </text>
      <text
        x="100"
        y="148"
        textAnchor="middle"
        fontFamily="Arial Black, Arial, Helvetica, sans-serif"
        fontSize="46"
        fontWeight="800"
        letterSpacing="-1.5"
        fill="#111111"
      >
        kaloria
      </text>
    </svg>
  );
}
