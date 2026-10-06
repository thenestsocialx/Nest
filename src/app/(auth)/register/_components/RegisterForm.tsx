'use client'

import { useActionState, useState, useTransition, useEffect } from 'react'
import Link from 'next/link'
import {
  signUpWithEmail,
  signInWithGoogle,
  resendVerification,
  type AuthActionState,
} from '@/actions/auth'
import {
  checkPasswordRules,
  passwordStrengthScore,
  STRENGTH_LABELS,
} from '@/lib/password'
import PhoneAuthForm from '../../_components/PhoneAuthForm'

const initialState: AuthActionState = {}
const RESEND_COOLDOWN = 30

export default function RegisterForm({ phoneEnabled }: { phoneEnabled: boolean }) {
  const [state, formAction, isPending] = useActionState(signUpWithEmail, initialState)
  const [googlePending, startGoogleTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [clientConfirmError, setClientConfirmError] = useState('')
  const [started, setStarted] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [usePhone, setUsePhone] = useState(false)
  const [resendError, setResendError] = useState('')

  const rules = checkPasswordRules(password)
  const score = passwordStrengthScore(password)

  // Route server errors to their fields
  const emailError = state.field === 'email' ? (state.error ?? '') : ''
  const passwordError = state.field === 'password' ? (state.error ?? '') : ''
  const confirmError = state.field === 'confirm' ? (state.error ?? '') : clientConfirmError

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const handleGoogleSignIn = () => {
    startGoogleTransition(async () => {
      await signInWithGoogle()
    })
  }

  const handleResend = async () => {
    if (!state.email || cooldown > 0) return
    setResendError('')
    setCooldown(RESEND_COOLDOWN)
    const result = await resendVerification(state.email)
    if (result.error) setResendError(result.error)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (password !== confirm) {
      e.preventDefault()
      setClientConfirmError("Passwords don't match.")
    } else {
      setClientConfirmError('')
    }
  }

  const busy = isPending || googlePending

  if (usePhone && phoneEnabled) {
    return (
      <PhoneAuthForm
        title="Create your account."
        subtitle="Sign up with your phone number. We'll text you a code."
        onBack={() => setUsePhone(false)}
      />
    )
  }

  if (state.success && state.email) {
    return (
      <div className="ns-form-wrap">
        <div className="ns-form">
          <div className="ns-sent">
            <div className="ns-sent__icon">
              <MailIcon />
            </div>
            <p className="ns-sent__title">Check your inbox.</p>
            <p className="ns-sent__sub">
              We sent a verification link to{' '}
              <span className="ns-sent__email">{state.email}</span>
              . Click it to confirm and continue setting up your account.
            </p>

            {resendError && (
              <p style={{ fontSize: 12, color: 'var(--terracotta)', marginTop: 8 }}>
                {resendError}
              </p>
            )}

            <button
              type="button"
              className="ns-btn ns-btn--ghost"
              onClick={handleResend}
              disabled={cooldown > 0}
              style={{ marginTop: 8 }}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend email'}
            </button>

            <Link href="/login" className="ns-sent__back">
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="ns-form-wrap">
        <div className="ns-form">
          <h1 className="ns-form__title">Create your account.</h1>
          <p className="ns-form__sub">Private, safe, and yours.</p>

          <form action={formAction} onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: 4 }}>
              <label className="ns-form__label" htmlFor="reg-email">
                Email address
              </label>
              <div className={`ns-form__field${emailError ? ' ns-form__field--error' : ''}`}>
                <input
                  className="ns-form__input"
                  id="reg-email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  autoComplete="email"
                  autoFocus
                  disabled={busy}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <p className="ns-form__field-hint" role={emailError ? 'alert' : undefined}>
                {emailError}
              </p>
            </div>

            <div style={{ marginBottom: 4 }}>
              <label className="ns-form__label" htmlFor="reg-password">
                Password
              </label>
              <div className={`ns-form__field ns-form__field--pw${passwordError ? ' ns-form__field--error' : ''}`}>
                <input
                  className="ns-form__input"
                  id="reg-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (!started && e.target.value.length > 0) setStarted(true)
                  }}
                  disabled={busy}
                />
                <button
                  type="button"
                  className="ns-form__eye"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              {/* Server error OR strength bar occupies this space */}
              {passwordError ? (
                <p className="ns-form__field-hint" role="alert">{passwordError}</p>
              ) : started ? (
                <>
                  <div className="ns-pw-strength" aria-hidden="true">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`ns-pw-bar${score >= i ? ` s${score}` : ''}`} />
                    ))}
                  </div>
                  <p className="ns-pw-label">{STRENGTH_LABELS[score]}</p>
                  <div className="ns-pw-reqs" aria-live="polite">
                    <RequirementRow met={password.length >= 8 && password.length <= 64} label="8–64 characters" />
                    <RequirementRow met={rules.lowercase} label="One lowercase letter (a–z)" />
                    <RequirementRow met={rules.uppercase} label="One uppercase letter (A–Z)" />
                    <RequirementRow met={rules.digit} label="One number (0–9)" />
                    <RequirementRow met={rules.symbol} label="One special character (!@#$%^&*-_=+?)" />
                  </div>
                </>
              ) : (
                <p className="ns-form__field-hint" />
              )}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="ns-form__label" htmlFor="reg-confirm">
                Confirm password
              </label>
              <div className={`ns-form__field ns-form__field--pw${confirmError ? ' ns-form__field--error' : ''}`}>
                <input
                  className="ns-form__input"
                  id="reg-confirm"
                  name="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={busy}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
                <button
                  type="button"
                  className="ns-form__eye"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <p className="ns-form__field-hint" role={confirmError ? 'alert' : undefined}>
                {confirmError}
              </p>
            </div>

            <button
              type="submit"
              className="ns-btn ns-btn--primary ns-btn--full ns-form__cta"
              disabled={busy}
              aria-label="Create account"
            >
              {isPending ? (
                <>
                  <span className="ns-page-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Creating account…
                </>
              ) : (
                <>
                  Create account
                  <ArrowIcon />
                </>
              )}
            </button>
          </form>

          <p className="ns-form__alt" style={{ marginTop: 20 }}>
            Already have an account?{' '}
            <Link href="/login" className="ns-link">
              Sign in
            </Link>
          </p>

          <div className="ns-form__divider">
            <span>or</span>
          </div>

          <button
            className="ns-btn ns-btn--google ns-btn--full"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={busy}
            aria-label="Continue with Google"
          >
            <GoogleIcon />
            {googlePending ? 'Redirecting…' : 'Continue with Google'}
          </button>

          {phoneEnabled && (
            <button
              className="ns-btn ns-btn--google ns-btn--full"
              type="button"
              onClick={() => setUsePhone(true)}
              disabled={busy}
              aria-label="Continue with phone"
              style={{ marginTop: 12 }}
            >
              <PhoneIcon />
              Continue with phone
            </button>
          )}

          <p className="ns-form__legal">
            By creating an account you agree to our{' '}
            <a href="/terms" className="ns-link ns-link--quiet">
              Terms of Use
            </a>{' '}
            and{' '}
            <a href="/privacy" className="ns-link ns-link--quiet">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </>
  )
}

function RequirementRow({ met, label }: { met: boolean; label: string }) {
  return (
    <div className={`ns-pw-req${met ? ' ns-pw-req--met' : ''}`}>
      <span className="ns-pw-req__dot" aria-hidden="true">
        {met ? (
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
            <path d="M1 5l3.5 3.5L11 1" stroke="var(--moss)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="4" height="4" viewBox="0 0 4 4" fill="none">
            <circle cx="2" cy="2" r="2" fill="currentColor" />
          </svg>
        )}
      </span>
      <span>{label}</span>
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

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="6" y="2" width="12" height="20" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <line x1="11" y1="18" x2="13" y2="18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M17.1 9.2c0-.63-.06-1.24-.16-1.83H9v3.46h4.54a3.9 3.9 0 0 1-1.69 2.55v2.12h2.73c1.6-1.47 2.52-3.63 2.52-6.3z" fill="#4285F4" />
      <path d="M9 17.5c2.28 0 4.19-.76 5.59-2.05l-2.73-2.12c-.75.5-1.72.8-2.86.8-2.2 0-4.07-1.49-4.73-3.49H1.46v2.19A8.5 8.5 0 0 0 9 17.5z" fill="#34A853" />
      <path d="M4.27 10.64A5.07 5.07 0 0 1 4 9c0-.57.1-1.12.27-1.64V5.17H1.46A8.5 8.5 0 0 0 .5 9c0 1.37.33 2.66.96 3.79l2.81-2.15z" fill="#FBBC05" />
      <path d="M9 3.88c1.24 0 2.35.43 3.23 1.27l2.41-2.41A8.5 8.5 0 0 0 9 .5 8.5 8.5 0 0 0 1.46 5.17l2.81 2.19C4.93 5.37 6.8 3.88 9 3.88z" fill="#EA4335" />
    </svg>
  )
}
