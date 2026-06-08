'use client'

import { useState, useEffect, useRef } from 'react'
import { getAvatarGradient, getInitials } from '@/lib/findAllies'
import type { AllyPublicProfile } from '@/types/findAllies'

interface Props {
  ally: AllyPublicProfile | null
  onClose: () => void
}

export default function ConnectModal({ ally, onClose }: Props) {
  const [message, setMessage]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Reset state when ally changes
  useEffect(() => {
    if (ally) {
      setMessage('')
      setSubmitting(false)
      setSubmitted(false)
      setError(null)
      setTimeout(() => textareaRef.current?.focus(), 80)
    }
  }, [ally?.id])

  // Escape to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !submitting) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, submitting])

  if (!ally) return null

  const initials = getInitials(ally.display_name)
  const gradient = getAvatarGradient(ally.id)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!ally) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/v1/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ally_id: ally.id, message: message.trim() || undefined }),
      })

      if (res.status === 400) {
        const body = await res.json()
        if (body.error === 'Already requested') {
          setError("You've already sent a request to this ally. We'll be in touch soon.")
          setSubmitting(false)
          return
        }
      }

      if (!res.ok) {
        setError('Something went wrong. Please try again.')
        setSubmitting(false)
        return
      }

      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget && !submitting) onClose()
  }

  return (
    <div className="fa-modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label={`Connect with ${ally.display_name}`}>
      <div className="fa-modal">

        {submitted ? (
          /* ── Success state ── */
          <div className="fa-modal-success">
            <div className="fa-modal-success-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12l5 5L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="fa-modal-success-title">Request sent</div>
            <p className="fa-modal-success-sub">
              {ally.display_name} will reach out to set up your first session.
            </p>
            <div className="fa-modal-actions">
              <button type="button" className="ns-btn ns-btn--secondary" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            <div className="fa-modal-header">
              <div className="fa-modal-ally">
                <div
                  className="fa-modal-avatar"
                  style={{ background: ally.photo_url ? undefined : gradient }}
                >
                  {ally.photo_url
                    ? <img src={ally.photo_url} alt={ally.display_name} />
                    : initials}
                </div>
                <div>
                  <div className="fa-modal-ally-name">{ally.display_name}</div>
                  {ally.primary_role && (
                    <div className="fa-modal-ally-role">{ally.primary_role}</div>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="fa-modal-close"
                onClick={onClose}
                aria-label="Close"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <form className="fa-modal-body" onSubmit={handleSubmit}>
              <label className="fa-modal-label" htmlFor="connect-message">
                Anything you&rsquo;d like them to know <span style={{ opacity: 0.6 }}>(optional)</span>
              </label>
              <textarea
                id="connect-message"
                ref={textareaRef}
                className="fa-modal-textarea"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="e.g. I've been struggling with anxiety and work stress lately…"
                maxLength={500}
                disabled={submitting}
              />
              {error && <p className="fa-modal-error">{error}</p>}
              <div style={{ marginTop: 16 }}>
                <button
                  type="submit"
                  className="ns-btn ns-btn--primary ns-btn--full"
                  disabled={submitting}
                  style={{ fontSize: 14, padding: '13px 24px' }}
                >
                  {submitting ? (
                    <>
                      <SpinnerIcon />
                      Sending…
                    </>
                  ) : 'Send request'}
                </button>
              </div>
            </form>
          </>
        )}

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
