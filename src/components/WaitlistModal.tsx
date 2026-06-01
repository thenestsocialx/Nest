'use client'

import { useState, useEffect, useCallback, type CSSProperties, type ReactNode } from 'react'
import { X, Check, Lock, ShieldCheck, Heart, ArrowRight } from 'lucide-react'
import { FORMSPREE_ENDPOINT } from '@/lib/config'

interface WaitlistModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Errors {
  name?: boolean
  email?: boolean
  wa?: boolean
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [wa, setWa] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setMounted(true)
    } else {
      const t = setTimeout(() => {
        setMounted(false)
        setErrors({})
        setStatus('idle')
      }, 220)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, handleClose])

  const handleSubmit = async () => {
    const errs: Errors = {}
    if (!name.trim()) errs.name = true
    if (!email.trim() || !email.includes('@')) errs.email = true
    if (!wa.trim()) errs.wa = true
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setErrors({})
    setStatus('loading')

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), whatsapp: wa.trim() }),
      })
      if (res.ok) {
        setStatus('success')
      } else {
        throw new Error('non-ok')
      }
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 200)
    }
  }

  const firstName = name.trim().split(' ')[0] || 'friend'
  const isSuccess = status === 'success'

  if (!mounted) return null

  return (
    <>
      <style>{`
        @keyframes ww-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ww-slide-up {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes ww-spin { to { transform: rotate(360deg); } }
        @keyframes ww-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .ww-backdrop  { animation: ww-fade-in  0.2s ease both; }
        .ww-container { animation: ww-slide-up 0.35s cubic-bezier(0.22,0.61,0.36,1) both; }
        .ww-spinner   { animation: ww-spin 0.65s linear infinite; }
        .ww-dot-pulse { animation: ww-pulse 2s ease-in-out infinite; }
        .ww-input::placeholder { color: #B5CCBA; font-weight: 300; }
      `}</style>

      {/* Backdrop + centering wrapper — single element so clicks always reach it */}
      <div
        className="ww-backdrop fixed inset-0 z-[300] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.60)', backdropFilter: 'blur(4px)' }}
        onClick={handleClose}
        role="dialog"
        aria-modal="true"
        aria-label="Join the waitlist"
      >
        {/* Modal card — stops propagation so inner clicks don't close */}
        <div
          className="ww-container w-full rounded-3xl overflow-hidden flex flex-col"
          style={{
            background: '#FAF7F2',
            width: 'min(420px, calc(100vw - 32px))',
            maxWidth: 420,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="relative overflow-hidden flex-shrink-0" style={{ background: '#1A3A2A', padding: '28px 24px 24px' }}>
            {/* Orb A */}
            <div
              className="absolute pointer-events-none rounded-full"
              style={{ top: -50, right: -50, width: 160, height: 160, background: 'rgba(199,142,82,0.10)' }}
              aria-hidden="true"
            />
            {/* Orb B */}
            <div
              className="absolute pointer-events-none rounded-full"
              style={{ bottom: -35, left: -20, width: 112, height: 112, background: 'rgba(91,130,97,0.14)' }}
              aria-hidden="true"
            />

            {/* Close button — cream-white colors matching the design reference exactly */}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="absolute z-10 flex items-center justify-center rounded-full transition-colors"
              style={{
                top: 14, right: 14,
                width: 28, height: 28,
                background: 'rgba(250,247,242,0.10)',
                border: '1px solid rgba(250,247,242,0.14)',
                color: 'rgba(250,247,242,0.55)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(250,247,242,0.20)'
                e.currentTarget.style.color = '#FAF7F2'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(250,247,242,0.10)'
                e.currentTarget.style.color = 'rgba(250,247,242,0.55)'
              }}
            >
              <X size={13} strokeWidth={2} aria-hidden="true" />
            </button>

            {/* "Coming soon" chip */}
            <div
              className="relative z-[1] inline-flex items-center gap-1.5 rounded-full"
              style={{
                background: 'rgba(91,130,97,0.2)',
                border: '1px solid rgba(91,130,97,0.28)',
                padding: '4px 10px',
                marginBottom: 14,
              }}
              aria-hidden="true"
            >
              <span
                className="ww-dot-pulse flex-shrink-0 rounded-full"
                style={{ width: 6, height: 6, background: '#7AB882' }}
              />
              <span
                className="text-[11px] font-medium tracking-widest uppercase"
                style={{ color: '#7AB882' }}
              >
                Coming soon
              </span>
            </div>

            {/* Heading */}
            <h2
              className="relative z-[1] leading-tight"
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: 23,
                fontWeight: 400,
                color: '#FAF7F2',
                marginBottom: 10,
              }}
            >
              You were never meant<br />to do this{' '}
              <em style={{ fontStyle: 'italic', color: '#C78E52' }}>alone.</em>
            </h2>

            {/* Tagline */}
            <p
              className="relative z-[1] leading-relaxed"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12.5,
                fontWeight: 300,
                color: 'rgba(250,247,242,0.52)',
              }}
            >
              Be the first in line for support that helps you heal, grow, and show up better — for yourself, and the people you love.
            </p>
          </div>

          {/* ── Form body ── */}
          {!isSuccess && (
            <div className="flex flex-col flex-shrink-0" style={{ padding: '22px 24px 26px', background: '#FAF7F2' }}>
              {/* Name */}
              <Field
                id="ww-name"
                label="Your name"
                error={errors.name}
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                }
              >
                <input
                  id="ww-name"
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: false })) }}
                  placeholder="What do your people call you?"
                  autoComplete="name"
                  className="ww-input border-none outline-none w-full"
                  style={inputStyle}
                />
              </Field>

              {/* Email */}
              <Field
                id="ww-email"
                label="Email address"
                error={errors.email}
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/>
                  </svg>
                }
              >
                <input
                  id="ww-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: false })) }}
                  placeholder="your@email.com"
                  autoComplete="email"
                  className="ww-input border-none outline-none w-full"
                  style={inputStyle}
                />
              </Field>

              {/* WhatsApp */}
              <Field
                id="ww-wa"
                label="WhatsApp number"
                error={errors.wa}
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                  </svg>
                }
                badge={
                  <div
                    className="flex items-center gap-1 flex-shrink-0 pointer-events-none"
                    style={{ padding: '0 12px', background: '#E9F5EA', borderLeft: '1px solid #D0E8D1' }}
                    aria-hidden="true"
                  >
                    <span className="flex-shrink-0 rounded-full" style={{ width: 5, height: 5, background: '#43A047' }} />
                    <span className="text-[10px] font-medium" style={{ color: '#2E7D32', letterSpacing: '0.03em' }}>WA</span>
                  </div>
                }
              >
                <input
                  id="ww-wa"
                  type="tel"
                  value={wa}
                  onChange={(e) => { setWa(e.target.value); if (errors.wa) setErrors((p) => ({ ...p, wa: false })) }}
                  placeholder="+91 98765 43210"
                  autoComplete="tel"
                  className="ww-input border-none outline-none w-full"
                  style={inputStyle}
                />
              </Field>

              {/* Divider */}
              <div style={{ height: 1, background: '#E4EDE5', margin: '16px 0', flexShrink: 0 }} />

              {/* Submit */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={status === 'loading'}
                className="flex items-center justify-center gap-2 rounded-xl transition-all active:scale-[0.98] flex-shrink-0"
                style={{
                  width: '100%',
                  minHeight: 50,
                  padding: '0 20px',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                  color: '#FAF7F2',
                  background: status === 'loading' ? 'rgba(26,58,42,0.72)' : '#1A3A2A',
                  border: 'none',
                  cursor: status === 'loading' ? 'default' : 'pointer',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                }}
                onMouseEnter={(e) => {
                  if (status !== 'loading') e.currentTarget.style.background = '#224C30'
                  if (status !== 'loading') e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = status === 'loading' ? 'rgba(26,58,42,0.72)' : '#1A3A2A'
                  e.currentTarget.style.transform = ''
                }}
              >
                {status === 'loading' ? (
                  <span
                    className="ww-spinner flex-shrink-0 rounded-full"
                    style={{
                      width: 14, height: 14,
                      border: '2px solid rgba(250,247,242,0.3)',
                      borderTopColor: '#FAF7F2',
                    }}
                    aria-label="Loading"
                  />
                ) : (
                  <>
                    <span>{status === 'error' ? 'Try again' : 'Claim my spot'}</span>
                    <ArrowRight size={15} strokeWidth={1.75} aria-hidden="true" />
                  </>
                )}
              </button>

              {/* Note */}
              <p className="text-center font-light" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#8FAF95', marginTop: 12, lineHeight: 1.5 }}>
                No spam, ever. Just{' '}
                <strong style={{ color: '#4A6B52', fontWeight: 500 }}>early access</strong>
                {' '}when we open the doors.
              </p>
            </div>
          )}

          {/* ── Success state ── */}
          {isSuccess && (
            <div className="flex flex-col items-center text-center flex-shrink-0" style={{ padding: '40px 28px', background: '#FAF7F2' }}>
              <div
                className="flex items-center justify-center flex-shrink-0 rounded-full"
                style={{
                  width: 58, height: 58,
                  background: '#EBF3EC',
                  border: '1.5px solid #C3D9C5',
                  color: '#4A6B52',
                  fontSize: 22,
                  marginBottom: 18,
                }}
              >
                <Check size={22} strokeWidth={2} aria-hidden="true" />
              </div>
              <h3
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: 21,
                  fontWeight: 400,
                  color: '#1A3A2A',
                  marginBottom: 8,
                }}
              >
                You&apos;re on the list.
              </h3>
              <p
                className="leading-relaxed"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  fontWeight: 300,
                  color: '#5B7A62',
                  marginBottom: 18,
                }}
              >
                Welcome to the nest, <strong style={{ fontWeight: 500, color: '#2F4C3A' }}>{firstName}</strong>.<br />
                We&apos;ll reach out when the doors open.
              </p>
              <div
                className="inline-flex items-center gap-1.5 rounded-full"
                style={{
                  background: '#EBF3EC',
                  border: '1px solid #C3D9C5',
                  padding: '6px 14px',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: '#3D6648',
                }}
              >
                <Heart size={11} fill="#3D6648" strokeWidth={0} aria-hidden="true" />
                <span>Talk soon</span>
              </div>
            </div>
          )}

          {/* ── Trust bar ── */}
          {!isSuccess && (
            <div
              className="flex flex-wrap items-center justify-center gap-3 flex-shrink-0"
              style={{
                padding: '12px 24px',
                background: '#EDE8E0',
                borderTop: '1px solid #E0D9D0',
              }}
            >
              {[
                { icon: <Lock size={13} strokeWidth={1.75} aria-hidden="true" />, label: 'Private & safe' },
                { icon: <ShieldCheck size={13} strokeWidth={1.75} aria-hidden="true" />, label: 'No spam, ever' },
                { icon: <Heart size={13} strokeWidth={1.75} aria-hidden="true" />, label: 'Built with care' },
              ].map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1 whitespace-nowrap"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 11,
                    color: '#7A8E7E',
                  }}
                >
                  <span style={{ color: '#8FAF95' }}>{icon}</span>
                  {label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── Shared styles ──

const inputStyle: CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 13.5,
  fontWeight: 400,
  color: '#1A3A2A',
  background: '#FFFFFF',
  padding: '0 12px',
  minHeight: 48,
  WebkitAppearance: 'none',
  appearance: 'none',
  boxShadow: 'none',
  borderRadius: 0,
}

// ── Field wrapper component ──

interface FieldProps {
  id: string
  label: string
  error?: boolean
  icon: ReactNode
  badge?: ReactNode
  children: ReactNode
}

function Field({ id, label, error, icon, badge, children }: FieldProps) {
  return (
    <div className="flex flex-col" style={{ gap: 6, marginBottom: 14 }}>
      <label
        htmlFor={id}
        className="text-[11px] font-medium tracking-widest uppercase"
        style={{ fontFamily: "'DM Sans', sans-serif", color: '#4A6B52' }}
      >
        {label}
      </label>
      <div
        className="overflow-hidden"
        style={{
          display: 'grid',
          gridTemplateColumns: badge ? '42px 1fr auto' : '42px 1fr',
          background: '#FFFFFF',
          border: `1.5px solid ${error ? '#B85C3A' : '#DDE9DE'}`,
          borderRadius: 10,
          minHeight: 50,
          boxShadow: error ? '0 0 0 3px rgba(184,92,58,0.08)' : undefined,
          transition: 'border-color 0.18s, box-shadow 0.18s',
        }}
        onFocusCapture={(e) => {
          if (!error) {
            e.currentTarget.style.borderColor = '#4A6B52'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,107,82,0.1)'
          }
        }}
        onBlurCapture={(e) => {
          if (!error) {
            e.currentTarget.style.borderColor = '#DDE9DE'
            e.currentTarget.style.boxShadow = ''
          }
        }}
      >
        {/* Icon cell */}
        <div
          className="flex items-center justify-center flex-shrink-0 pointer-events-none"
          style={{
            background: '#FFFFFF',
            color: '#8FAF95',
            borderRight: '1px solid #EDF3EE',
          }}
        >
          {icon}
        </div>

        {/* Input */}
        {children}

        {/* Optional badge (WhatsApp) */}
        {badge}
      </div>
    </div>
  )
}
