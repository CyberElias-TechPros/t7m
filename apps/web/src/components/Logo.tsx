/**
 * THE SEVENTH MAN geometric logo mark — a stylized human figure built from
 * two interlocking "7" forms (octagonal head, two shoulders, two legs).
 * Recreated as scalable SVG from the brand assets. Monochrome; works in any
 * color at favicon-to-signage scale.
 */
export function LogoMark({
  className = '',
  color = 'currentColor',
  glow = false,
}: {
  className?: string;
  color?: string;
  glow?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 200 220"
      className={className}
      fill="none"
      role="img"
      aria-label="The Seventh Man logo"
      style={glow ? { filter: 'drop-shadow(0 0 16px rgba(124,58,237,0.6))' } : undefined}
    >
      <g fill={color} strokeLinejoin="round">
        {/* Head — rounded octagon (45°-rotated rounded square) */}
        <rect x="82" y="4" width="36" height="36" rx="11" transform="rotate(45 100 22)" />

        {/* Left shoulder — long horizontal bar pointing left */}
        <path d="M24 84 h88 a14 14 0 0 1 14 14 v10 a14 14 0 0 1 -14 14 H38 a14 14 0 0 1 -14 -14 z" />
        {/* Right shoulder — short segment pointing right */}
        <path d="M120 84 h22 a14 14 0 0 1 14 14 v10 a14 14 0 0 1 -14 14 h-8 z" />

        {/* Left leg — inner diagonal descending */}
        <path d="M74 136 h24 a12 12 0 0 1 12 12 v10 l-26 48 a12 12 0 0 1 -21 -12 l27 -46 z" />
        {/* Right leg — tall outer diagonal descending */}
        <path d="M128 122 h30 a14 14 0 0 1 14 14 v62 a14 14 0 0 1 -28 0 v-44 l-30 44 a14 14 0 1 1 -22 -18 z" />
      </g>
    </svg>
  );
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <LogoMark className="h-8 w-8 text-violet-electric" glow />
      <span className="font-display text-sm font-bold tracking-[0.18em] text-white sm:text-base">
        THE SEVENTH MAN
      </span>
    </span>
  );
}
