import type { ResultData, RecommendedAlly } from '@/lib/assessment/types'
import type { FeatureFlags } from '@/lib/featureFlags'
import styles from './ResultScreen.module.css'

interface ResultScreenProps {
  result: ResultData | null
  onSave: () => void
  recommendedAllies?: RecommendedAlly[]
  flags: FeatureFlags
}

function AllyRecommendationCard({ ally }: { ally: RecommendedAlly }) {
  const initials = ally.display_name.split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase()
  const priceLabel = ally.intro_price && ally.intro_price < ally.session_price
    ? `First session · ₹${ally.intro_price.toLocaleString('en-IN')}`
    : ally.session_price > 0
      ? `₹${ally.session_price.toLocaleString('en-IN')} / session`
      : null
  const tag = ally.specialties[0]

  return (
    <a
      href={`/allies?highlight=${ally.id}`}
      style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
      aria-label={`Book a session with ${ally.display_name}`}
    >
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '14px 16px',
        background: 'rgba(255,255,255,0.55)',
        border: '1px solid rgba(224,213,197,0.7)',
        borderRadius: '14px',
        cursor: 'pointer',
        transition: 'border-color 150ms',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
          overflow: 'hidden', background: '#D6E8DC',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.8125rem', fontWeight: 600, color: '#2F4C3A',
        }}>
          {ally.photo_url
            ? <img src={ally.photo_url} alt={ally.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--deep-pine, #2F4C3A)', marginBottom: '2px' }}>
            {ally.display_name}
          </div>
          {ally.primary_role && (
            <div style={{ fontSize: '0.75rem', color: 'var(--moss, #5C7A66)', marginBottom: '4px' }}>
              {ally.primary_role}
            </div>
          )}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            {tag && (
              <span style={{
                fontSize: '0.6875rem', padding: '2px 8px', borderRadius: '999px',
                background: 'rgba(92,122,102,0.12)', color: '#3A5C47',
              }}>{tag}</span>
            )}
            {priceLabel && (
              <span style={{ fontSize: '0.6875rem', color: '#7A6040', fontWeight: 500 }}>
                {priceLabel}
              </span>
            )}
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px', opacity: 0.4 }}>
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </a>
  )
}

function SkeletonBlock({ width = '100%', height = '1.2em', style = {} }: { width?: string; height?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={styles.skeleton}
      style={{ width, height, borderRadius: '6px', ...style }}
    />
  )
}

function PathwayIcon({ type }: { type: 'ally' | 'sai' | 'resources' | 'events' }) {
  if (type === 'ally') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M7 19 Q4 13 8 8 Q10 5 12 7" stroke="#5C7A66" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M7 19 Q10 17 12 14 Q13 11 12 7" stroke="#5C7A66" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M17 19 Q20 13 16 8 Q14 5 12 7" stroke="#2F4C3A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M17 19 Q14 17 12 14 Q11 11 12 7" stroke="#2F4C3A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </svg>
    )
  }
  if (type === 'sai') {
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" fill="#EFF5EE" stroke="#E0D5C5" strokeWidth="1" />
        <circle cx="12" cy="12" r="6" fill="none" stroke="#E8C8A0" strokeWidth="0.8" opacity="0.7" />
        <path d="M12 8 Q16 10 15 14 Q14 17 11 16 Q9 15 10 12" stroke="#2F4C3A" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        <circle cx="12" cy="12" r="1.5" fill="#2F4C3A" />
      </svg>
    )
  }
  if (type === 'resources') {
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <path d="M4 5 Q12 3 12 20 Q12 3 20 5 L20 20 Q12 18 12 20 Q12 18 4 20 Z" stroke="#5C7A66" strokeWidth="1.3" strokeLinecap="round" fill="none" />
        <path d="M12 20 L12 8" stroke="#5C7A66" strokeWidth="1.1" strokeLinecap="round" opacity="0.5" />
        <path d="M8 14 Q10 13 12 14" stroke="#E8C8A0" strokeWidth="1" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <circle cx="8" cy="9" r="2.5" fill="#2F4C3A" opacity="0.8" />
      <path d="M4 19 Q4 14 8 14 Q12 14 12 19" stroke="#2F4C3A" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.8" />
      <circle cx="16" cy="9" r="2.5" fill="#5C7A66" opacity="0.7" />
      <path d="M12 19 Q12 14 16 14 Q20 14 20 19" stroke="#5C7A66" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.7" />
    </svg>
  )
}

export default function ResultScreen({ result, onSave, recommendedAllies = [], flags }: ResultScreenProps) {
  const isLoading = result === null

  return (
    <div className={styles.resultWrap}>

      {/* Nav */}
      <nav className={styles.rNav}>
        <span className={styles.rNavLogo}>nest</span>
        <span className={styles.rNavPrivate} aria-label="Your results are private">
          <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden="true">
            <rect x="1" y="6" width="10" height="7.5" rx="2" stroke="#5C7A66" strokeWidth="1.2" fill="none" />
            <path d="M3.5 6V4a2.5 2.5 0 0 1 5 0v2" stroke="#5C7A66" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          </svg>
          Your results are private
        </span>
      </nav>

      {/* Two-column body */}
      <div className={styles.rBody}>

        {/* LEFT — Emotional summary */}
        <div className={styles.rLeft}>
          <span className={styles.rSnapshotTag}>Your emotional snapshot</span>

          {isLoading ? (
            <>
              <SkeletonBlock height="2rem" style={{ marginBottom: '12px', maxWidth: '22ch' }} />
              <SkeletonBlock height="1rem" style={{ marginBottom: '6px' }} />
              <SkeletonBlock height="1rem" style={{ marginBottom: '6px' }} />
              <SkeletonBlock height="1rem" width="75%" style={{ marginBottom: '24px' }} />
              <SkeletonBlock height="1rem" width="80%" />
            </>
          ) : (
            <>
              <h1 className={styles.rHeadline}>{result.headline}</h1>
              <p className={styles.rSummary}>{result.summary}</p>
              <p className={styles.rPullquote}>{result.pullquote}</p>
            </>
          )}

          <div aria-hidden="true" className={styles.rDivider} />

          <button
            className={styles.rSaveLink}
            onClick={onSave}
            aria-label="Save your results by creating an account"
          >
            Save your results → Create account
          </button>

          {/* ILL-03 · The Open Hand */}
          <div className={styles.rIll} aria-hidden="true">
            <svg width="108" height="92" viewBox="0 0 120 100" fill="none">
              <ellipse cx="60" cy="40" rx="24" ry="24" fill="#E8C8A0" opacity="0.22" />
              <ellipse cx="60" cy="40" rx="14" ry="14" fill="#E8C8A0" opacity="0.5" />
              <circle cx="60" cy="40" r="5" fill="#9B6651" opacity="0.88" />
              <circle cx="60" cy="40" r="2.2" fill="#E8C8A0" />
              <line x1="60" y1="23" x2="60" y2="18" stroke="#E8C8A0" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
              <line x1="72" y1="28" x2="76" y2="23" stroke="#E8C8A0" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
              <line x1="48" y1="28" x2="44" y2="23" stroke="#E8C8A0" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
              <line x1="77" y1="40" x2="82" y2="40" stroke="#E8C8A0" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
              <line x1="43" y1="40" x2="38" y2="40" stroke="#E8C8A0" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
              <path d="M28 74 Q32 50 50 48 Q56 47 60 50 Q64 47 70 48 Q88 50 92 74" stroke="#2F4C3A" strokeWidth="1.7" strokeLinecap="round" fill="none" />
              <path d="M37 60 L35 50" stroke="#2F4C3A" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M49 53 L48 43" stroke="#2F4C3A" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M71 53 L72 43" stroke="#2F4C3A" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M83 60 L85 50" stroke="#2F4C3A" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M28 74 Q28 87 35 89 L85 89 Q92 87 92 74" stroke="#2F4C3A" strokeWidth="1.7" strokeLinecap="round" fill="none" />
              <path d="M42 72 Q60 76 78 72" stroke="#2F4C3A" strokeWidth="0.7" strokeLinecap="round" opacity="0.3" />
            </svg>
          </div>
        </div>

        {/* RIGHT — Pathway recommendations */}
        <div className={styles.rRight}>
          <p className={styles.rRightLabel}>Recommended for you</p>

          {isLoading ? (
            <>
              <SkeletonBlock height="120px" style={{ borderRadius: '16px', marginBottom: '10px' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <SkeletonBlock height="100px" style={{ borderRadius: '12px' }} />
                <SkeletonBlock height="100px" style={{ borderRadius: '12px' }} />
                <SkeletonBlock height="100px" style={{ borderRadius: '12px', gridColumn: '1 / -1' }} />
              </div>
            </>
          ) : (
            <>
              {/* Primary pathway — Talk to an Ally */}
              <div
                className={styles.pathPrimary}
                style={{
                  border: result.primaryPathway === 'ally'
                    ? '2px solid var(--deep-pine)'
                    : '1px solid rgba(224, 213, 197, 0.8)',
                }}
              >
                <div className={styles.pathPrimaryTop}>
                  <div className={styles.pathIcon} aria-hidden="true">
                    <PathwayIcon type="ally" />
                  </div>
                  <div className={styles.pathPrimaryMeta}>
                    <div className={styles.pathPrimaryRow}>
                      <span className={styles.pathPrimaryTitle}>Talk to an Ally</span>
                      {result.primaryPathway === 'ally' && (
                        <span className={styles.tagFilled}>Best match</span>
                      )}
                    </div>
                  </div>
                </div>

                {recommendedAllies.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                    {recommendedAllies.map(ally => (
                      <AllyRecommendationCard key={ally.id} ally={ally} />
                    ))}
                  </div>
                ) : (
                  <p className={styles.pathPrimaryBody}>
                    A warm, trained human who&rsquo;s been through hard things too. Not therapy — more like having someone in your corner who actually listens. You set the pace entirely.
                  </p>
                )}

                <a href="/allies" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnFull}`} style={{ display: 'block', textDecoration: 'none', textAlign: 'center' }}>
                  {recommendedAllies.length > 0 ? 'See all allies →' : 'Find your Ally →'}
                </a>
              </div>

              {/* Secondary cards */}
              <div className={styles.pathSecGrid}>

                {/* Talk to Nila */}
                <div
                  className={!flags.resources && !flags.events ? `${styles.pathSec} ${styles.pathSecWide}` : styles.pathSec}
                  style={{
                    border: result.primaryPathway === 'sai'
                      ? '1.5px solid var(--moss)'
                      : '1px solid rgba(224, 213, 197, 0.8)',
                  }}
                >
                  <div className={styles.pathSecIcon} aria-hidden="true">
                    <PathwayIcon type="sai" />
                  </div>
                  <div className={styles.pathSecTitle}>Talk to Nila</div>
                  <div className={styles.pathSecDesc}>Whenever you&rsquo;re ready. No waiting, no booking.</div>
                  <a href="/nila" className={`${styles.btn} ${styles.btnSecondary}`} style={{ marginTop: '6px', display: 'block', textDecoration: 'none', textAlign: 'center' }} aria-label="Chat with Nila">
                    Chat with Nila
                  </a>
                </div>

                {/* Browse Resources */}
                {flags.resources && (
                <div
                  className={styles.pathSec}
                  style={{
                    border: result.primaryPathway === 'resources'
                      ? '1.5px solid var(--moss)'
                      : '1px solid rgba(224, 213, 197, 0.8)',
                  }}
                >
                  <div className={styles.pathSecIcon} aria-hidden="true">
                    <PathwayIcon type="resources" />
                  </div>
                  <div className={styles.pathSecTitle}>Browse Resources</div>
                  <div className={styles.pathSecDesc}>Articles, audio — at your own pace.</div>
                  <a href="/resources" className={`${styles.btn} ${styles.btnGhost}`} style={{ marginTop: '6px', display: 'block', textDecoration: 'none', textAlign: 'center' }} aria-label="Browse Resources">
                    Explore
                  </a>
                </div>
                )}

                {/* Offline Events — full width */}
                {flags.events && (
                <div
                  className={`${styles.pathSec} ${styles.pathSecWide}`}
                  style={{
                    border: result.primaryPathway === 'events'
                      ? '1.5px solid var(--moss)'
                      : '1px solid rgba(224, 213, 197, 0.8)',
                  }}
                >
                  <div className={styles.pathSecWideRow}>
                    <div className={styles.pathSecIcon} aria-hidden="true">
                      <PathwayIcon type="events" />
                    </div>
                    <div>
                      <div className={styles.pathSecTitle}>Offline Events</div>
                      <div className={styles.pathSecDesc}>Quiet, in-person gatherings — for people who get it.</div>
                    </div>
                  </div>
                  <a href="/events" className={`${styles.btn} ${styles.btnGhost} ${styles.btnFull}`} style={{ marginTop: '12px', display: 'block', textDecoration: 'none', textAlign: 'center' }} aria-label="View upcoming offline events">
                    View upcoming events
                  </a>
                </div>
                )}

              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
