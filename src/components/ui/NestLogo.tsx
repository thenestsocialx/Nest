interface NestLogoProps {
  size?: number
  color?: string
}

export default function NestLogo({ size = 20, color = '#F8F0E5' }: NestLogoProps) {
  const iconW = Math.round(size * (26 / 22))
  const iconH = Math.round(size * (24 / 22))
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <svg width={iconW} height={iconH} viewBox="0 0 30 28" fill="none" aria-hidden="true">
        <path d="M 3,16 Q 15,26 27,16" stroke={color} strokeWidth="3.2" strokeLinecap="round" />
        <circle cx="15" cy="8" r="3.2" fill={color} />
      </svg>
      <span
        style={{
          fontFamily: "var(--font-dm-serif), 'DM Serif Display', serif",
          fontSize: `${size}px`,
          fontWeight: 400,
          letterSpacing: '-0.01em',
          lineHeight: 1,
          color,
        }}
      >
        nest
      </span>
    </span>
  )
}
