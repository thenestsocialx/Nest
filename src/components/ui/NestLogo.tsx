// The nest logo. The wordmark is the brand artwork (public/brand/nest-logo.png) cut out to
// public/brand/nest-wordmark.png and used as a mask, so it can take any colour.
// NestMark is the symbol on its own, redrawn as a vector from the same artwork.

const WORDMARK = '/brand/nest-wordmark.png'
const WORDMARK_ASPECT = 4.3 // width / height of the cut-out

interface NestLogoProps {
  /** Roughly the old text size; the logo is drawn about 1.2x this tall */
  size?: number
  color?: string
}

export default function NestLogo({ size = 20, color = '#F8F0E5' }: NestLogoProps) {
  const height = Math.round(size * 1.2)
  const mask = `url(${WORDMARK}) center / contain no-repeat`
  return (
    <span
      role="img"
      aria-label="nest"
      style={{
        display: 'inline-block',
        flexShrink: 0,
        height,
        width: Math.round(height * WORDMARK_ASPECT),
        backgroundColor: color,
        WebkitMask: mask,
        mask,
      }}
    />
  )
}

interface NestMarkProps {
  /** Width in px; height follows the mark's proportions */
  width?: number
  color?: string
  className?: string
}

export function NestMark({ width = 24, color = 'currentColor', className }: NestMarkProps) {
  return (
    <svg className={className} width={width} height={Math.round((width * 224) / 360)} viewBox="0 0 360 224" fill="none" aria-hidden="true">
      <path d="M14 14 V42 A166 166 0 0 0 346 42 V14" stroke={color} strokeWidth="25" strokeLinecap="round" />
      <circle cx="180" cy="72" r="34" fill={color} />
    </svg>
  )
}
