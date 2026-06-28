export default function DunningBanner() {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 1000,
      background: 'var(--terracotta, #9B6651)',
      color: 'var(--cream, #F8F0E5)',
      padding: '10px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      fontSize: '0.8125rem',
      fontWeight: 450,
      letterSpacing: '0.01em',
      boxShadow: '0 2px 12px rgba(155,102,81,0.3)',
    }}>
      <svg width="15" height="15" viewBox="0 0 18 18" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
        <path d="M9 2L16.5 15H1.5L9 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M9 8v3M9 13h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <span>Your payment failed — your plan access may be interrupted.</span>
      <a
        href="/plans"
        style={{
          color: 'var(--cream, #F8F0E5)',
          fontWeight: 600,
          textDecoration: 'underline',
          textUnderlineOffset: 3,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        Update payment →
      </a>
    </div>
  )
}
