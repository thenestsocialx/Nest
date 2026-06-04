interface CrisisScreenProps {
  onContinue: () => void
}

export default function CrisisScreen({ onContinue }: CrisisScreenProps) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(32px, 6vw, 80px) clamp(20px, 5vw, 48px)',
        minHeight: '100vh',
        background: 'var(--cream)',
        flexDirection: 'column',
      }}
    >
      {/* Logo */}
      <div
        style={{
          position: 'fixed',
          top: 'clamp(16px, 3vw, 28px)',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '0.8125rem',
          fontWeight: 500,
          letterSpacing: '0.1em',
          color: 'var(--deep-pine)',
          textTransform: 'lowercase',
        }}
      >
        nest
      </div>

      <div style={{ width: '100%', maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* Warm hold badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            background: 'rgba(92, 122, 102, 0.09)',
            border: '1px solid var(--moss)',
            borderRadius: '999px',
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: 'var(--deep-pine)',
            alignSelf: 'flex-start',
          }}
        >
          <span style={{ color: 'var(--moss)', fontSize: '11px' }}>♡</span>
          <span>You reached out. That matters.</span>
        </div>

        {/* Main message */}
        <div>
          <h1
            style={{
              fontSize: 'clamp(1.25rem, 3vw, 1.6875rem)',
              lineHeight: 1.35,
              fontWeight: 400,
              color: 'var(--deep-pine)',
              letterSpacing: '-0.01em',
              marginBottom: '16px',
            }}
          >
            Please don&rsquo;t face this alone right now.
          </h1>
          <p
            style={{
              fontSize: '0.9375rem',
              lineHeight: 1.75,
              color: 'var(--moss)',
              opacity: 0.9,
            }}
          >
            What you&rsquo;re feeling is real, and there are people ready to listen — right now, any time of day or night.
          </p>
        </div>

        {/* Helpline cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          <a
            href="tel:9152987821"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              padding: '20px 24px',
              background: 'var(--cream)',
              border: '1.5px solid var(--moss)',
              borderRadius: '16px',
              textDecoration: 'none',
              transition: 'background 180ms ease-in-out',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(92,122,102,0.07)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--cream)' }}
            aria-label="Call iCall: 9152987821"
          >
            <span style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--moss)', opacity: 0.7 }}>
              iCall — Trained counsellors
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 500, color: 'var(--deep-pine)', letterSpacing: '0.02em' }}>
              9152987821
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--moss)', opacity: 0.75 }}>
              Mon–Sat, 8am–10pm
            </span>
          </a>

          <a
            href="tel:18602662345"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              padding: '20px 24px',
              background: 'var(--cream)',
              border: '1px solid rgba(224, 213, 197, 0.9)',
              borderRadius: '16px',
              textDecoration: 'none',
              transition: 'background 180ms ease-in-out',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(92,122,102,0.07)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--cream)' }}
            aria-label="Call Vandrevala Foundation: 1860-2662-345"
          >
            <span style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--moss)', opacity: 0.7 }}>
              Vandrevala Foundation — 24/7
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 500, color: 'var(--deep-pine)', letterSpacing: '0.02em' }}>
              1860-2662-345
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--moss)', opacity: 0.75 }}>
              Available 24 hours, every day
            </span>
          </a>

        </div>

        {/* Divider */}
        <div aria-hidden="true" style={{ height: '1px', background: 'rgba(224,213,197,0.7)' }} />

        {/* Continue */}
        <div>
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--moss)',
              opacity: 0.75,
              lineHeight: 1.6,
              marginBottom: '16px',
            }}
          >
            If you&rsquo;re safe right now and want to keep going, you can continue below. We&rsquo;ll still be here.
          </p>
          <button
            onClick={onContinue}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'inherit',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--deep-pine)',
              background: 'transparent',
              border: '1.5px solid var(--deep-pine)',
              borderRadius: '999px',
              padding: '12px 24px',
              cursor: 'pointer',
              minHeight: '44px',
              transition: 'background 180ms ease-in-out',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(92,122,102,0.09)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            I'm safe — continue the assessment
          </button>
        </div>

      </div>
    </div>
  )
}
