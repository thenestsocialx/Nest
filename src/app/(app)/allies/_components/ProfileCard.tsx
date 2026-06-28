'use client'

import { getAvatarGradient, getInitials } from '@/lib/findAllies'
import type { AllyPublicProfile, MatchQuality } from '@/types/findAllies'

interface Props {
  ally: AllyPublicProfile
  quality: MatchQuality
  showNext: boolean
  onNext: () => void
  onBook: (ally: AllyPublicProfile) => void
}

export default function ProfileCard({ ally, quality, showNext, onNext, onBook }: Props) {
  const initials = getInitials(ally.display_name)
  const gradient = getAvatarGradient(ally.id)
  const isGreat  = quality === 'great'

  const roleLine = ally.primary_role
    ? `${ally.primary_role}${ally.years_experience > 0 ? ` · ${ally.years_experience} yrs` : ''}`
    : null

  // First 4 specialties as tags — first 2 filled, rest outlined
  const tags = ally.specialties.slice(0, 4)

  const quoteText = ally.quote ?? ally.tagline

  const pronounWord = (() => {
    if (!ally.pronouns) return 'their'
    const first = ally.pronouns.split('/')[0].trim().toLowerCase()
    if (first === 'she') return 'her'
    if (first === 'he') return 'his'
    return 'their'
  })()

  const duration  = ally.session_durations[0] ?? '55 min'
  const format    = ally.session_formats[0] ?? 'Online'
  const priceStr  = ally.session_price > 0 ? `₹ ${ally.session_price.toLocaleString('en-IN')}` : null

  return (
    <div className="ac-card">

      {/* ── Left panel ── */}
      <div className="ac-left">
        <div className="ac-photo">
          {ally.photo_url ? (
            <img src={ally.photo_url} alt={ally.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div className="ac-photo-placeholder">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <span>{initials}</span>
            </div>
          )}

          {/* Match badge */}
          <div className={`ac-match-badge ac-match-badge--${isGreat ? 'great' : 'good'}`}>
            <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M6 1l1.3 3.5L11 5.5l-2.5 2.5.5 3.5L6 10 2 11.5l.5-3.5L0 5.5l3.7-1z" fill="currentColor"/>
            </svg>
            {isGreat ? 'Great match' : 'Good match'}
          </div>
        </div>

        <div className="ac-nameband">
          <div className="ac-name-row">
            <span className="ac-name">{ally.display_name}</span>
            {ally.years_experience > 0 && (
              <span className="ac-exp">{ally.years_experience} yrs</span>
            )}
          </div>
          {ally.pronouns && (
            <div className="ac-pronouns">{ally.pronouns}</div>
          )}
          <div className="ac-badges">
            {ally.primary_role && (
              <span className="ac-badge">
                <svg width="11" height="11" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <circle cx="9" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M4 15c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                {ally.primary_role}
              </span>
            )}
            {ally.location && (
              <span className="ac-badge">
                <svg width="11" height="11" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M9 2a5 5 0 015 5c0 4-5 9-5 9S4 11 4 7a5 5 0 015-5z" stroke="currentColor" strokeWidth="1.4"/>
                  <circle cx="9" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
                </svg>
                {ally.location}
              </span>
            )}
          </div>

          {/* Credential row */}
          {(ally.highest_qualification || ally.session_count > 0) && (
            <div className="ac-badges" style={{ marginTop: 6 }}>
              {ally.highest_qualification && (
                <span className="ac-badge" style={{ background: 'rgba(248,240,229,0.13)', borderColor: 'rgba(248,240,229,0.32)' }}>
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M8 2L15 6v2l-7 4-7-4V6l7-4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                    <path d="M3 8.5v4l5 2 5-2v-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {ally.highest_qualification}
                </span>
              )}
              {ally.session_count > 0 && (
                <span className="ac-badge" style={{ color: 'var(--honey)', background: 'rgba(232,200,160,0.13)', borderColor: 'rgba(232,200,160,0.35)' }}>
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {ally.session_count} {ally.session_count === 1 ? 'session' : 'sessions'}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="ac-right">

        {/* Decorative leaves */}
        <div className="ac-ill" aria-hidden="true">
          <svg width="36" height="24" viewBox="0 0 48 28" fill="none">
            <path d="M4 24Q2 16 6 10Q9 5 14 8" stroke="#5C7A66" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
            <path d="M4 24Q8 22 11 18Q12 14 14 8" stroke="#5C7A66" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
            <path d="M44 24Q46 16 42 10Q39 5 34 8" stroke="#2F4C3A" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
            <path d="M44 24Q40 22 37 18Q36 14 34 8" stroke="#2F4C3A" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
            <circle cx="24" cy="8" r="2.5" fill="#E8C8A0" opacity="0.6"/>
          </svg>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="ac-tags">
            {tags.map((t, i) => (
              <span key={t} className={`ac-tag ${i < 2 ? 'ac-tag--filled' : 'ac-tag--outline'}`}>
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Quote */}
        {quoteText && (
          <div className="ac-quote">
            <p className="ac-quote__text">&ldquo;{quoteText}&rdquo;</p>
            <p className="ac-quote__sub">In {pronounWord} own words</p>
          </div>
        )}

        {/* Intro price callout */}
        {ally.intro_price && ally.intro_price < ally.session_price && (
          <div className="ac-intro-offer">
            <svg width="13" height="13" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M9 2l1.8 4.8L16 8l-3.5 3.5.9 5L9 14l-4.4 2.5.9-5L2 8l5.2-1.2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
            </svg>
            <span>First session · <strong>₹{ally.intro_price.toLocaleString('en-IN')}</strong></span>
            <span className="ac-intro-offer__sub">— a softer start</span>
          </div>
        )}

        {/* What to expect */}
        <div className="ac-expect">
          <div className="ac-expect__label">What to expect</div>
          <div className="ac-expect__steps">
            <div className="ac-expect__step">
              <span className="ac-expect__dot"/>
              Choose a time slot that works for you
            </div>
            <div className="ac-expect__step">
              <span className="ac-expect__dot"/>
              They confirm within a few hours
            </div>
            <div className="ac-expect__step">
              <span className="ac-expect__dot"/>
              Payment happens before the session — not now
            </div>
          </div>
        </div>

        {/* Session info grid */}
        <div className="ac-session">
          <div className="ac-srow">
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M9 6v3.5l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            {duration} / session
          </div>
          <div className="ac-srow">
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M7 9l2 1.5L13 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {format}
          </div>
          {ally.languages_spoken && (
            <div className="ac-srow">
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M3 9h12M9 2.5c-2 2-3 4-3 6.5s1 4.5 3 6.5M9 2.5c2 2 3 4 3 6.5s-1 4.5-3 6.5" stroke="currentColor" strokeWidth="1.4"/>
              </svg>
              {ally.languages_spoken}
            </div>
          )}
          {priceStr && (
            <div className="ac-srow ac-srow--bold">
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M9 5.5v7M7 7.5c0-1.1.9-2 2-2s2 .9 2 2c0 1.4-2 2-2 2s-2 .7-2 2c0 1.1.9 2 2 2s2-.9 2-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              {priceStr} / session
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="ac-actions">
          <button
            type="button"
            className="ac-act__btn ac-act__btn--book"
            onClick={() => onBook(ally)}
            aria-label={`Book a session with ${ally.display_name}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.6"/>
              <path d="M3 9h18M8 2v4M16 2v4M12 13v4M10 15h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            Book a session
          </button>

          {showNext && (
            <button
              type="button"
              className="ac-act__btn ac-act__btn--next"
              onClick={onNext}
              aria-label="See next ally"
            >
              Next
              <svg width="15" height="15" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
