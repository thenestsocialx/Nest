'use client'

import { useEffect, useRef, useState } from 'react'
import { getAvatarGradient, getInitials } from '@/lib/findAllies'
import type { AllyPublicProfile } from '@/types/findAllies'

const REACH_TIMEOUT_MS = 25_000

interface Props {
  ally: AllyPublicProfile | null
  onClose: () => void
}

export default function ConnectModal({ ally, onClose }: Props) {
  const [frameReady, setFrameReady] = useState(false)
  const [frameError, setFrameError] = useState<string | null>(null)
  const [urlOk,      setUrlOk]      = useState<boolean | null>(null)
  const controllerRef               = useRef<AbortController | null>(null)

  useEffect(() => {
    setFrameReady(false)
    setFrameError(null)
    setUrlOk(null)

    if (!ally?.zoho_embed_url) return

    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    let cancelled = false

    const timeoutId = setTimeout(() => {
      if (!cancelled) controller.abort()
    }, REACH_TIMEOUT_MS)

    fetch(ally.zoho_embed_url, { mode: 'no-cors', signal: controller.signal })
      .then(() => {
        if (cancelled) return
        clearTimeout(timeoutId)
        setUrlOk(true)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        clearTimeout(timeoutId)
        const msg = (err as Error).name === 'AbortError'
          ? 'The booking page is taking too long to respond.'
          : "We couldn’t connect to the booking page."
        setFrameError(msg)
      })

    return () => {
      cancelled = true
      controller.abort()
      clearTimeout(timeoutId)
    }
  }, [ally?.id])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!ally) return null

  const initials = getInitials(ally.display_name)
  const gradient = getAvatarGradient(ally.id)
  const roleLine = ally.primary_role
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

        {/* ── Header ── */}
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
          <button type="button" className="bk-close" onClick={onClose} aria-label="Close booking">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        {ally.zoho_embed_url ? (
          <div className="bk-frame-wrap">

            {/* Loading */}
            {urlOk === null && !frameError && (
              <div className="bk-frame-loader">
                <SpinnerIcon />
                <span>Loading calendar…</span>
              </div>
            )}

            {/* Error screen */}
            {frameError && (
              <div className="bk-error-view">
                <div className="bk-error-icon-ring">
                  <svg width="46" height="46" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.6"/>
                    <path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                    <path d="M9.5 13.5l5 5M14.5 13.5l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h2 className="bk-error-heading">Booking page unavailable</h2>
                <p className="bk-error-desc">
                  {frameError}<br/>
                  Please try again after some time.
                </p>
                <button type="button" className="bk-error-btn" onClick={onClose}>
                  Close
                </button>
              </div>
            )}

            {/* Iframe — only mount once URL is confirmed reachable */}
            {urlOk && (
              <>
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
              </>
            )}

          </div>
        ) : (
          <div className="bk-no-url">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M12 8v5M12 15v1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <p>Booking isn&rsquo;t set up for this ally yet.</p>
            <p style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: 6 }}>
              Their calendar is being configured. Please check back in a little while or choose another ally for now.
            </p>
            <button type="button" className="bk-error-btn" onClick={onClose} style={{ marginTop: 16 }}>
              Close
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

function SpinnerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 14 14" fill="none"
      style={{ animation: 'spin 0.7s linear infinite' }} aria-hidden="true">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" opacity="0.2"/>
      <path d="M7 1.5A5.5 5.5 0 0112.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
