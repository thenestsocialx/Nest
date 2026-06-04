interface NestLogoProps {
  size?: number
  color?: string
}

export default function NestLogo({ size = 20, color = '#F8F0E5' }: NestLogoProps) {
  // viewBox is 88×22 — leaf sits left of wordmark with a 4px gap
  const w = Math.round(size * 4.4)
  const h = Math.round(size * 1.1)
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 88 22"
      fill="none"
      aria-label="Nest"
    >
      {/* Small botanical leaf mark, cap-height aligned */}
      <path
        d="M5 18 Q1 12 3 6 Q9 3 11 9 Q13 15 7 19 Z"
        fill={color}
        opacity="0.82"
      />
      <path
        d="M7 19 L5 18"
        stroke={color}
        strokeWidth="0.7"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* Wordmark */}
      <text
        x="17"
        y="17"
        fontFamily="DM Sans, sans-serif"
        fontSize="15"
        fontWeight="400"
        letterSpacing="0.01em"
        fill={color}
      >
        nest
      </text>
    </svg>
  )
}
