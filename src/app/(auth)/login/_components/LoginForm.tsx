'use client'

import { useActionState, useState, useTransition } from 'react'
import Link from 'next/link'
import { signInWithEmail, signInWithGoogle, type AuthActionState } from '@/actions/auth'

const initialState: AuthActionState = {}

export default function LoginForm({ urlError }: { urlError?: string }) {
  const [state, formAction, isPending] = useActionState(signInWithEmail, initialState)
  const [googlePending, startGoogleTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const urlErrorMessage =
    urlError === 'oauth_failed'
      ? 'Google sign-in failed. Please try again.'
      : urlError === 'callback_failed'
        ? 'Sign-in failed. The link may have expired.'
        : urlError
          ? 'Something went wrong. Please try again.'
          : ''

  const emailError = state.field === 'email' ? (state.error ?? '') : ''
  // Wrong credentials, empty password, and URL-level errors all surface below the password field
  const passwordError = state.field === 'password' ? (state.error ?? '') : urlErrorMessage

  const handleGoogleSignIn = () => {
    startGoogleTransition(async () => {
      await signInWithGoogle()
    })
  }

  const busy = isPending || googlePending

  return (
    <>
      <div className="ns-form-wrap">
        <div className="ns-form">
          <h1 className="ns-form__title">Welcome back.</h1>
          <p className="ns-form__sub">Sign in to your account.</p>

          <form action={formAction} noValidate>
            {/* Email */}
            <div style={{ marginBottom: 4 }}>
              <label className="ns-form__label" htmlFor="login-email">
                Email address
              </label>
              <div className={`ns-form__field${emailError ? ' ns-form__field--error' : ''}`}>
                <input
                  className="ns-form__input"
                  id="login-email"
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

            {/* Password */}
            <div style={{ marginBottom: 16 }}>
              <div className="ns-form__row">
                <label className="ns-form__label" htmlFor="login-password">
                  Password
                </label>
                <Link href="/forgot-password" className="ns-form__forgot" tabIndex={0}>
                  Forgot password?
                </Link>
              </div>
              <div className={`ns-form__field ns-form__field--pw${passwordError ? ' ns-form__field--error' : ''}`}>
                <input
                  className="ns-form__input"
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={busy}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              <p className="ns-form__field-hint" role={passwordError ? 'alert' : undefined} aria-live="polite">
                {passwordError}
              </p>
            </div>

            <button
              type="submit"
              className="ns-btn ns-btn--primary ns-btn--full ns-form__cta"
              disabled={busy}
              aria-label="Sign in"
            >
              {isPending ? (
                <>
                  <span className="ns-page-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowIcon />
                </>
              )}
            </button>
          </form>

          <p className="ns-form__alt" style={{ marginTop: 20 }}>
            Don&rsquo;t have an account?{' '}
            <Link href="/register" className="ns-link">
              Create one
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

          <p className="ns-form__legal">
            By continuing, you agree to our{' '}
            <a href="/privacy" className="ns-link ns-link--quiet">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>

      <div className="ns-trust">
        <TrustItems />
      </div>
    </>
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

function TrustItems() {
  return (
    <>
      <div className="ns-trust__item">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M7 1 L 12 3 V7 Q12 11 7 13 Q2 11 2 7 V3 Z" stroke="currentColor" strokeWidth="1.2" fill="none" />
          <path d="M5 7 L 6.5 8.5 L 9 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>Encrypted end-to-end</span>
      </div>
      <div className="ns-trust__item">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
          <path d="M4 7.5 L 6 9 L 10 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>Delete your account anytime</span>
      </div>
      <div className="ns-trust__item">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
          <path d="M7 4.5 V7 L 9 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <span>3-minute setup, then you&rsquo;re in</span>
      </div>
    </>
  )
}
