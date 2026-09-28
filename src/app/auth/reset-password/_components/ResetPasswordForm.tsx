'use client'

import { useActionState, useState } from 'react'
import { updatePassword, type AuthActionState } from '@/actions/auth'
import {
  checkPasswordRules,
  passwordStrengthScore,
  STRENGTH_LABELS,
} from '@/lib/password'

const initialState: AuthActionState = {}

export default function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(updatePassword, initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [clientConfirmError, setClientConfirmError] = useState('')
  const [started, setStarted] = useState(false)

  const rules = checkPasswordRules(password)
  const score = passwordStrengthScore(password)

  const passwordError = state.field === 'password' ? (state.error ?? '') : ''
  const confirmError = state.field === 'confirm' ? (state.error ?? '') : clientConfirmError

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (password !== confirm) {
      e.preventDefault()
      setClientConfirmError("Passwords don't match.")
    } else {
      setClientConfirmError('')
    }
  }

  return (
    <div className="ns-form" style={{ width: '100%', maxWidth: 380 }}>
      <h1 className="ns-form__title">Set a new password.</h1>
      <p className="ns-form__sub">Choose something you&rsquo;ll remember.</p>

      <form action={formAction} onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: 4 }}>
          <label className="ns-form__label" htmlFor="rp-password">
            New password
          </label>
          <div className={`ns-form__field ns-form__field--pw${passwordError ? ' ns-form__field--error' : ''}`}>
            <input
              className="ns-form__input"
              id="rp-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              autoFocus
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (!started && e.target.value.length > 0) setStarted(true)
              }}
              disabled={isPending}
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

        <div style={{ marginBottom: 24 }}>
          <label className="ns-form__label" htmlFor="rp-confirm">
            Confirm new password
          </label>
          <div className={`ns-form__field ns-form__field--pw${confirmError ? ' ns-form__field--error' : ''}`}>
            <input
              className="ns-form__input"
              id="rp-confirm"
              name="confirm"
              type={showConfirm ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={isPending}
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
          disabled={isPending}
          aria-label="Update password"
        >
          {isPending ? (
            <>
              <span className="ns-page-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
              Updating…
            </>
          ) : (
            <>
              Update password
              <ArrowIcon />
            </>
          )}
        </button>
      </form>
    </div>
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
