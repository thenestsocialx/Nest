'use client'

import { useTransition } from 'react'
import { signInWithGoogle } from '@/actions/auth'

export default function LoginForm({ urlError }: { urlError?: string }) {
  const [isPending, startTransition] = useTransition()

  const handleGoogleSignIn = () => {
    startTransition(async () => {
      await signInWithGoogle()
    })
  }

  const errorMessage =
    urlError === 'oauth_failed'
      ? 'Google sign-in failed. Please try again.'
      : urlError === 'callback_failed'
        ? 'Sign-in failed. The link may have expired.'
        : urlError
          ? 'Something went wrong. Please try again.'
          : null

  return (
    <>
      <div className="ns-form-wrap">
        <div className="ns-form">
          <h1 className="ns-form__title">You&rsquo;re almost in.</h1>
          <p className="ns-form__sub">
            Sign in securely with your Google account.
            <br />
            No passwords to remember.
          </p>

          {errorMessage && (
            <div className="ns-form__error" role="alert">
              {errorMessage}
            </div>
          )}

          <button
            className="ns-btn ns-btn--google ns-btn--full ns-form__cta"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isPending}
            aria-label="Continue with Google"
          >
            <GoogleIcon />
            {isPending ? 'Redirecting…' : 'Continue with Google'}
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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M17.1 9.2c0-.63-.06-1.24-.16-1.83H9v3.46h4.54a3.9 3.9 0 0 1-1.69 2.55v2.12h2.73c1.6-1.47 2.52-3.63 2.52-6.3z"
        fill="#4285F4"
      />
      <path
        d="M9 17.5c2.28 0 4.19-.76 5.59-2.05l-2.73-2.12c-.75.5-1.72.8-2.86.8-2.2 0-4.07-1.49-4.73-3.49H1.46v2.19A8.5 8.5 0 0 0 9 17.5z"
        fill="#34A853"
      />
      <path
        d="M4.27 10.64A5.07 5.07 0 0 1 4 9c0-.57.1-1.12.27-1.64V5.17H1.46A8.5 8.5 0 0 0 .5 9c0 1.37.33 2.66.96 3.79l2.81-2.15z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.88c1.24 0 2.35.43 3.23 1.27l2.41-2.41A8.5 8.5 0 0 0 9 .5 8.5 8.5 0 0 0 1.46 5.17l2.81 2.19C4.93 5.37 6.8 3.88 9 3.88z"
        fill="#EA4335"
      />
    </svg>
  )
}

function TrustItems() {
  return (
    <>
      <div className="ns-trust__item">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path
            d="M7 1 L 12 3 V7 Q12 11 7 13 Q2 11 2 7 V3 Z"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="none"
          />
          <path
            d="M5 7 L 6.5 8.5 L 9 6"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>Encrypted end-to-end</span>
      </div>
      <div className="ns-trust__item">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
          <path
            d="M4 7.5 L 6 9 L 10 5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>Delete your account anytime</span>
      </div>
      <div className="ns-trust__item">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
          <path
            d="M7 4.5 V7 L 9 8.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
        <span>3-minute setup, then you&rsquo;re in</span>
      </div>
    </>
  )
}
