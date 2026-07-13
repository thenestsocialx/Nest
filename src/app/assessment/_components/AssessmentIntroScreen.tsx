'use client'

import NestLogo from '@/components/ui/NestLogo'

const AssessOrb = ({ size = 112 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 116 116" fill="none" aria-hidden="true">
    <circle cx="58" cy="58" r="54" fill="#F8F0E5" stroke="#E0D5C5" strokeWidth="1.2" />
    <circle cx="58" cy="58" r="40" fill="none" stroke="#E8C8A0" strokeWidth="0.9" opacity="0.7" />
    <circle cx="58" cy="58" r="27" fill="none" stroke="#E8C8A0" strokeWidth="0.9" opacity="0.45" />
    <path d="M38 63 H78" stroke="#5C7A66" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    <path d="M44 63 Q44 51 58 51 Q72 51 72 63" stroke="#2F4C3A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    <circle cx="58" cy="63" r="2.6" fill="#2F4C3A" />
  </svg>
)

const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
    <circle cx="6.5" cy="6.5" r="5.3" stroke="currentColor" strokeWidth="1.1" />
    <path d="M6.5 3.6 V6.6 L8.6 8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
)

const CurateIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M6.5 1.5 L 11 4 V 9 L 6.5 11.5 L 2 9 V 4 Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    <circle cx="6.5" cy="6.5" r="1.6" stroke="currentColor" strokeWidth="1.1" />
  </svg>
)

const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
    <rect x="2" y="5.5" width="8" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.1" />
    <path d="M4 5.5 V3.5 Q4 1.5 6 1.5 Q8 1.5 8 3.5 V5.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
)

const MetaDot = () => (
  <span style={{
    width: 3,
    height: 3,
    borderRadius: '50%',
    background: '#E0D5C5',
    flexShrink: 0,
    display: 'inline-block',
  }} />
)

interface Props {
  onStart: () => void
  onSkip: () => void
}

export default function AssessmentIntroScreen({ onStart, onSkip }: Props) {
  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      background: 'var(--cream)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: 'var(--font, "DM Sans", system-ui, -apple-system, sans-serif)',
    }}>

      {/* Logo — top left */}
      <div style={{
        position: 'absolute',
        top: 'clamp(28px, 4vh, 48px)',
        left: 'clamp(28px, 4vw, 56px)',
        zIndex: 2,
      }}>
        <NestLogo size={18} color="#2F4C3A" />
      </div>

      {/* Background rings anchored at bottom-center */}
      <svg
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <circle cx="400" cy="600" r="280" fill="none" stroke="#E8C8A0" strokeWidth="1" opacity="0.18" />
        <circle cx="400" cy="600" r="380" fill="none" stroke="#E8C8A0" strokeWidth="1" opacity="0.12" />
        <circle cx="400" cy="600" r="480" fill="none" stroke="#E8C8A0" strokeWidth="1" opacity="0.08" />
      </svg>

      {/* Centered content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(80px, 10vh, 120px) clamp(24px, 6vw, 48px) clamp(40px, 6vh, 64px)',
        textAlign: 'center',
        maxWidth: 560,
        margin: '0 auto',
        width: '100%',
      }}>

        {/* Orb */}
        <div style={{ marginBottom: 32 }}>
          <AssessOrb size={112} />
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(26px, 3.5vw, 34px)',
          fontWeight: 400,
          color: 'var(--deep-pine)',
          letterSpacing: '-0.01em',
          lineHeight: 1.2,
          margin: '0 0 20px',
        }}>
          Let&rsquo;s take a moment<br />to see how you&rsquo;re doing.
        </h1>

        {/* Body */}
        <p style={{
          fontSize: 14,
          lineHeight: 1.75,
          color: 'var(--moss)',
          maxWidth: '42ch',
          margin: '0 0 24px',
        }}>
          Before we begin, a short check-in — how you&rsquo;ve been feeling, what&rsquo;s been on your mind lately.
          It&rsquo;s how we get to know you a little, so NEST isn&rsquo;t a one-size-fits-all app: your companion,
          your Allies, and everything on your dashboard get shaped around what you actually need, from day one.
        </p>

        {/* Meta row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 32,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--moss)', opacity: 0.85 }}>
            <CurateIcon /> Personalizes your whole experience
          </span>
          <MetaDot />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--moss)', opacity: 0.85 }}>
            <ClockIcon /> A few quiet minutes
          </span>
          <MetaDot />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--moss)', opacity: 0.85 }}>
            <LockIcon /> Private, always
          </span>
        </div>

        {/* Primary CTA */}
        <button
          onClick={onStart}
          style={{
            padding: '14px 48px',
            fontSize: 14,
            fontWeight: 500,
            fontFamily: 'inherit',
            background: 'var(--terracotta)',
            color: '#fff',
            border: 'none',
            borderRadius: 999,
            cursor: 'pointer',
            letterSpacing: '0.01em',
            minHeight: 48,
            transition: 'opacity 150ms ease, transform 150ms ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.88' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
        >
          Start the check-in
        </button>

        {/* Skip link */}
        <button
          onClick={onSkip}
          style={{
            marginTop: 18,
            background: 'transparent',
            border: 'none',
            fontFamily: 'inherit',
            fontSize: 12,
            color: 'var(--moss)',
            opacity: 0.7,
            cursor: 'pointer',
            padding: '6px 10px',
            borderRadius: 999,
            textDecoration: 'underline',
            textDecorationColor: 'rgba(92, 122, 102, 0.3)',
            textUnderlineOffset: 3,
            transition: 'opacity 150ms ease, color 150ms ease',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.opacity = '1'
            el.style.color = 'var(--deep-pine)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.opacity = '0.7'
            el.style.color = 'var(--moss)'
          }}
        >
          Skip for now — take me to my dashboard
        </button>

      </div>
    </div>
  )
}
