'use client'

import { useState, useEffect } from 'react'
import { getAvatarGradient, getInitials } from '@/lib/findAllies'
import type { AllyPublicProfile } from '@/types/findAllies'

interface Props {
  ally: AllyPublicProfile | null
  onClose: () => void
}

export default function ConnectModal({ ally, onClose }: Props) {
  const [loading, setLoading] = useState(false)

  // Reset on open
  useEffect(() => {
    if (ally) setLoading(false)
  }, [ally?.id])

  // Escape to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !loading) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, loading])

  if (!ally) return null

  const initials = getInitials(ally.display_name)
  const gradient = getAvatarGradient(ally.id)
  const firstName = ally.display_name.split(' ')[0]

  const roleLine = ally.primary_role
    ? `${ally.primary_role}${ally.years_experience > 0 ? ` · ${ally.years_experience} yrs` : ''}${ally.location ? ` · ${ally.location}` : ''}`
    : ally.location ?? ''

  const duration = ally.session_durations[0] ?? '55 min'
  const format   = ally.session_formats[0] ?? 'Online'
  const priceStr = ally.session_price > 0
    ? `₹ ${ally.session_price.toLocaleString('en-IN')}`
    : 'Contact for pricing'

  function handleChooseSlot() {
    if (!ally?.zoho_embed_url) return
    setLoading(true)
    window.open(ally.zoho_embed_url, '_blank', 'noopener,noreferrer')
    setTimeout(() => setLoading(false), 1500)
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget && !loading) onClose()
  }

  return (
    <div
      className="fa-modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Book a session with ${ally.display_name}`}
    >
      <div className="fa-modal bm-modal">

        {/* Header */}
        <div className="bm-header">
          {/* BG decoration */}
          <div className="bm-header-bg" aria-hidden="true">
            <svg width="100%" height="100%" viewBox="0 0 420 130" preserveAspectRatio="xMaxYMid slice" fill="none">
              <path d="M420 10Q360 30 330 70Q310 100 330 130" stroke="#F8F0E5" strokeWidth="2" strokeLinecap="round"/>
              <path d="M370 30Q355 18 352 34Q360 46 374 38Z" fill="#5C7A66"/>
              <path d="M340 60Q325 48 322 64Q330 76 344 68Z" fill="#5C7A66"/>
              <circle cx="330" cy="125" r="14" fill="#E8C8A0"/>
            </svg>
          </div>

          <button
            type="button"
            className="fa-modal-close bm-close"
            onClick={onClose}
            aria-label="Close"
            disabled={loading}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          <div className="bm-ally-row">
            <div
              className="bm-ally-avatar"
              style={{ background: ally.photo_url ? undefined : gradient }}
            >
              {ally.photo_url
                ? <img src={ally.photo_url} alt={ally.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials}
            </div>
            <div>
              <div className="bm-ally-name">{ally.display_name}</div>
              {roleLine && <div className="bm-ally-role">{roleLine}</div>}
            </div>
          </div>
          <p className="bm-title">
            You&rsquo;re about to book your first session with {firstName}.
          </p>
        </div>

        {/* Body */}
        <div className="bm-body">

          {/* Session summary */}
          <div className="bm-summary">
            <div className="bm-sum-row">
              <span className="bm-sum-key">
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M9 6v3.5l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                Duration
              </span>
              <span className="bm-sum-val">{duration}</span>
            </div>
            <div className="bm-sum-divider"/>
            <div className="bm-sum-row">
              <span className="bm-sum-key">
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M7 9l2 1.5L13 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Format
              </span>
              <span className="bm-sum-val">{format}</span>
            </div>
            {ally.languages_spoken && (
              <>
                <div className="bm-sum-divider"/>
                <div className="bm-sum-row">
                  <span className="bm-sum-key">
                    <svg width="14" height="14" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                      <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M3 9h12M9 2.5c-2 2-3 4-3 6.5s1 4.5 3 6.5M9 2.5c2 2 3 4 3 6.5s-1 4.5-3 6.5" stroke="currentColor" strokeWidth="1.4"/>
                    </svg>
                    Language
                  </span>
                  <span className="bm-sum-val">{ally.languages_spoken}</span>
                </div>
              </>
            )}
            <div className="bm-sum-divider"/>
            <div className="bm-sum-row">
              <span className="bm-sum-key">
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M9 5.5v7M7 7.5c0-1.1.9-2 2-2s2 .9 2 2c0 1.4-2 2-2 2s-2 .7-2 2c0 1.1.9 2 2 2s2-.9 2-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                Session fee
              </span>
              <span className="bm-sum-val" style={{ fontSize: 14 }}>{priceStr}</span>
            </div>
          </div>

          {/* What to expect */}
          <div className="bm-expect">
            <div className="bm-expect-label">What to expect</div>
            {[
              `You'll pick a time slot that works for you on the next screen`,
              `${firstName} will confirm within a few hours`,
              `A session link will be shared before the session`,
              `Payment happens before the session — not now`,
            ].map(item => (
              <div key={item} className="bm-expect-item">
                <span className="bm-expect-dot"/>
                {item}
              </div>
            ))}
          </div>

          {/* CTA */}
          {ally.zoho_embed_url ? (
            <button
              type="button"
              className="bm-cta"
              onClick={handleChooseSlot}
              disabled={loading}
            >
              {loading ? (
                <>
                  <SpinnerIcon />
                  Opening calendar…
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.6"/>
                    <path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                  Choose a time slot
                </>
              )}
            </button>
          ) : (
            <div className="bm-no-booking">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M12 8v5M12 15v1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              Booking link not set up yet. Check back soon.
            </div>
          )}

          <p className="bm-note">
            This opens <strong>Zoho Bookings</strong> where you can pick a slot from{' '}
            {firstName}&rsquo;s calendar. You can cancel or reschedule anytime.
          </p>
        </div>

      </div>
    </div>
  )
}

function SpinnerIcon() {
  return (
    <svg
      width="14" height="14" viewBox="0 0 14 14" fill="none"
      style={{ animation: 'spin 0.7s linear infinite' }}
      aria-hidden="true"
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" opacity="0.25"/>
      <path d="M7 1.5A5.5 5.5 0 0112.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
