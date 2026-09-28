'use client'

import { useActionState, useState, useEffect } from 'react'
import Link from 'next/link'
import { sendPasswordReset, type AuthActionState } from '@/actions/auth'

const initialState: AuthActionState = {}
const RESEND_COOLDOWN = 30

export default function ForgotPasswordForm({ expiredLink }: { expiredLink?: boolean }) {
  const [state, formAction, isPending] = useActionState(sendPasswordReset, initialState)
  const [resendState, resendAction, resendPending] = useActionState(sendPasswordReset, initialState)
  const [cooldown, setCooldown] = useState(0)
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (state.success && cooldown === 0) setCooldown(RESEND_COOLDOWN)
  }, [state.success])

  useEffect(() => {
    if (resendState.success) setCooldown(RESEND_COOLDOWN)
  }, [resendState.success])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const emailError = state.field === 'email' ? (state.error ?? '') : ''
  const displayEmail = resendState.email ?? state.email

  if (state.success) {
    return (
      <div className="ns-form-wrap">
        <div className="ns-form">
          <div className="ns-sent">
            <div className="ns-sent__icon">
              <MailIcon />
            </div>
            <p className="ns-sent__title">Check your inbox.</p>
            <p className="ns-sent__sub">
              We sent a password reset link to{' '}
              <span className="ns-sent__email">{displayEmail}</span>
              . The link expires in 1 hour.
            </p>
            <p className="ns-sent__sub" style={{ fontSize: 13, marginTop: 4 }}>
              Didn&rsquo;t receive it? Check your spam folder, or resend below.
            </p>

            {resendState.error && (
              <p style={{ fontSize: 12, color: 'var(--terracotta)', marginTop: 8 }}>
                {resendState.error}
              </p>
            )}

            <form action={resendAction}>
              <input type="hidden" name="email" value={displayEmail} />
              <button
                type="submit"
                className="ns-btn ns-btn--ghost"
                disabled={cooldown > 0 || resendPending}
                style={{ marginTop: 8 }}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend reset link'}
              </button>
            </form>

            <Link href="/login" className="ns-sent__back">
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ns-form-wrap">
      <div className="ns-form">
        <Link href="/login" className="ns-form__back">
          <ChevronLeftIcon />
          Back to sign in
        </Link>

        <h1 className="ns-form__title">Forgot your password?</h1>
        <p className="ns-form__sub">
          Enter your email and we&rsquo;ll send you a secure reset link.
        </p>

        {/* Fixed-height zone for expired-link or non-field errors */}
        {expiredLink && (
          <div className="ns-form__zone" role="alert">
            Your link has expired. Enter your email below to get a new one.
          </div>
        )}

        <form action={formAction} noValidate>
          <div style={{ marginBottom: 4 }}>
            <label className="ns-form__label" htmlFor="fp-email">
              Email address
            </label>
            <div className={`ns-form__field${emailError ? ' ns-form__field--error' : ''}`}>
              <input
                className="ns-form__input"
                id="fp-email"
                name="email"
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                autoFocus
                disabled={isPending}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <p className="ns-form__field-hint" role={emailError ? 'alert' : undefined}>
              {emailError}
            </p>
          </div>

          <button
            type="submit"
            className="ns-btn ns-btn--primary ns-btn--full ns-form__cta"
            disabled={isPending}
            aria-label="Send reset link"
          >
            {isPending ? (
              <>
                <span className="ns-page-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Sending…
              </>
            ) : (
              <>
                Send reset link
                <ArrowIcon />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

function MailIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M3 9h12M10 4l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
