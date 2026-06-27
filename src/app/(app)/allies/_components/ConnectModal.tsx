'use client'

import { useEffect, useState } from 'react'
import { getAvatarGradient, getInitials } from '@/lib/findAllies'
import type { AllyPublicProfile } from '@/types/findAllies'

interface Props {
  ally: AllyPublicProfile | null
  onClose: () => void
}

export default function ConnectModal({ ally, onClose }: Props) {
  const [frameReady, setFrameReady] = useState(false)

  useEffect(() => {
    if (ally) setFrameReady(false)
  }, [ally?.id])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!ally) return null

  const initials  = getInitials(ally.display_name)
  const gradient  = getAvatarGradient(ally.id)
  const roleLine  = ally.primary_role
    ? `${ally.primary_role}${ally.years_experience > 0 ? ` · ${ally.years_experience} yrs` : ''}`
    : null

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fa-modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Book a session with ${ally.display_name}`}
    >
      <div className="bk-modal">

        {/* ── Slim header ── */}
        <div className="bk-header">
          <div className="bk-avatar" style={{ background: ally.photo_url ? undefined : gradient }}>
            {ally.photo_url
              ? <img src={ally.photo_url} alt={ally.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials}
          </div>
          <div className="bk-ally-info">
            <div className="bk-ally-name">{ally.display_name}</div>
            {roleLine && <div className="bk-ally-role">{roleLine}</div>}
          </div>
          <button
            type="button"
            className="bk-close"
            onClick={onClose}
            aria-label="Close booking"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* ── Zoho iframe or fallback ── */}
        {ally.zoho_embed_url ? (
          <div className="bk-frame-wrap">
            {!frameReady && (
              <div className="bk-frame-loader">
                <SpinnerIcon />
                <span>Loading calendar…</span>
              </div>
            )}
            <iframe
              src={ally.zoho_embed_url}
              title={`Book a session with ${ally.display_name}`}
              onLoad={() => setFrameReady(true)}
              style={{ opacity: frameReady ? 1 : 0 }}
              allowFullScreen
            />
          </div>
        ) : (
          <div className="bk-no-url">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M12 8v5M12 15v1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <p>Booking isn&rsquo;t set up for this ally yet.<br/>Check back soon.</p>
          </div>
        )}

      </div>
    </div>
  )
}

function SpinnerIcon() {
  return (
    <svg
      width="22" height="22" viewBox="0 0 14 14" fill="none"
      style={{ animation: 'spin 0.7s linear infinite' }}
      aria-hidden="true"
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" opacity="0.2"/>
      <path d="M7 1.5A5.5 5.5 0 0112.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
