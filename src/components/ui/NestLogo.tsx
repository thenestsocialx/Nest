interface NestLogoProps {
  size?: number
  color?: string
}

export default function NestLogo({ size = 20, color = '#F8F0E5' }: NestLogoProps) {
  // viewBox 0 0 100 26 — bowl mark on left, serif wordmark on right
  const w = Math.round(size * (100 / 26))
  const h = size
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 100 26"
      fill="none"
      aria-label="Nest"
    >
      {/* Upward-opening bowl arc (the nest) */}
      <path
        d="M 2,15 A 11,9 0 0,1 24,15"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Egg dot centered inside the bowl */}
      <circle cx="13" cy="9" r="2.2" fill={color} />
      {/* Wordmark — Lora serif matches brand font */}
      <text
        x="29"
        y="20"
        fontFamily="var(--font-serif), Lora, Georgia, serif"
        fontSize="18"
        fontWeight="400"
        fill={color}
      >
        nest
      </text>
    </svg>
  )
}
