'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  type ConfirmationResult,
} from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase/client'
import { PHONE_COUNTRY_CODES } from '@/lib/phone-auth'
import { signInWithPhone } from '@/actions/auth'

const OTP_LENGTH = 6
const RESEND_COOLDOWN = 30

interface PhoneAuthFormProps {
  title: string
  subtitle: string
  onBack: () => void
}

export default function PhoneAuthForm({ title, subtitle, onBack }: PhoneAuthFormProps) {
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [countryCode, setCountryCode] = useState<string>('+91')
  const [phone, setPhone] = useState('')
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [signingIn, startSignIn] = useTransition()

  const confirmationRef = useRef<ConfirmationResult | null>(null)
  const verifierRef = useRef<RecaptchaVerifier | null>(null)
  const recaptchaHostRef = useRef<HTMLDivElement>(null)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const fullPhone = `${countryCode}${phone.replace(/[\s\-()]/g, '')}`
  const busy = sending || verifying || signingIn

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  useEffect(() => {
    return () => verifierRef.current?.clear()
  }, [])

  // reCAPTCHA can't be re-rendered into the same element, so each send gets a fresh one
  const freshVerifier = () => {
    verifierRef.current?.clear()
    const host = recaptchaHostRef.current!
    host.innerHTML = ''
    const el = document.createElement('div')
    host.appendChild(el)
    verifierRef.current = new RecaptchaVerifier(getFirebaseAuth(), el, {
      size: 'invisible',
      badge: 'inline',
    })
    return verifierRef.current
  }

  const sendCode = async () => {
    const national = phone.replace(/[\s\-()]/g, '')
    if (!/^\d{7,15}$/.test(national)) {
      setError('Please enter a valid phone number.')
      return
    }
    setError('')
    setSending(true)
    try {
      confirmationRef.current = await signInWithPhoneNumber(
        getFirebaseAuth(),
        fullPhone,
        freshVerifier(),
      )
      setDigits(Array(OTP_LENGTH).fill(''))
      setStep('code')
      setCooldown(RESEND_COOLDOWN)
      setTimeout(() => otpRefs.current[0]?.focus(), 0)
    } catch (err) {
      setError(firebaseErrorMessage(err))
    } finally {
      setSending(false)
    }
  }

  const verifyCode = async (code: string) => {
    if (!confirmationRef.current || code.length !== OTP_LENGTH) return
    setError('')
    setVerifying(true)
    let idToken: string
    try {
      const cred = await confirmationRef.current.confirm(code)
      idToken = await cred.user.getIdToken()
      // Firebase is only used to verify the number — the app session lives in Supabase
      await signOut(getFirebaseAuth())
    } catch (err) {
      setError(firebaseErrorMessage(err))
      setDigits(Array(OTP_LENGTH).fill(''))
      otpRefs.current[0]?.focus()
      setVerifying(false)
      return
    }
    setVerifying(false)
    startSignIn(async () => {
      const result = await signInWithPhone(idToken)
      if (result?.error) setError(result.error)
    })
  }

  const updateDigits = (next: string[]) => {
    setDigits(next)
    const code = next.join('')
    if (code.length === OTP_LENGTH) verifyCode(code)
  }

  const handleDigitChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '')
    if (!clean) {
      const next = [...digits]
      next[index] = ''
      setDigits(next)
      return
    }
    // Typing or autofill may deliver several digits at once
    const next = [...digits]
    for (let i = 0; i < clean.length && index + i < OTP_LENGTH; i++) {
      next[index + i] = clean[i]
    }
    const focusAt = Math.min(index + clean.length, OTP_LENGTH - 1)
    otpRefs.current[focusAt]?.focus()
    updateDigits(next)
  }

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    e.preventDefault()
    const next = Array(OTP_LENGTH).fill('')
    pasted.split('').forEach((d, i) => (next[i] = d))
    otpRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus()
    updateDigits(next)
  }

  return (
    <div className="ns-form-wrap">
      <div className="ns-form">
        <h1 className="ns-form__title">{step === 'phone' ? title : 'Enter your code.'}</h1>
        <p className="ns-form__sub">
          {step === 'phone' ? (
            subtitle
          ) : (
            <>
              We sent a 6-digit code to <strong>{countryCode} {phone}</strong>.
            </>
          )}
        </p>

        {step === 'phone' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              sendCode()
            }}
            noValidate
          >
            <div style={{ marginBottom: 4 }}>
              <label className="ns-form__label" htmlFor="phone-number">
                Phone number
              </label>
              <div className={`ns-form__field${error ? ' ns-form__field--error' : ''}`}>
                <select
                  className="ns-form__prefix"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  aria-label="Country code"
                  disabled={busy}
                  style={{ border: 'none', borderRight: '1px solid var(--honey-mute)', fontFamily: 'inherit', cursor: 'pointer' }}
                >
                  {PHONE_COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <input
                  className="ns-form__input"
                  id="phone-number"
                  type="tel"
                  inputMode="tel"
                  placeholder="98765 43210"
                  autoComplete="tel-national"
                  autoFocus
                  disabled={busy}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <p className="ns-form__field-hint" role={error ? 'alert' : undefined}>
                {error}
              </p>
            </div>

            <button
              type="submit"
              className="ns-btn ns-btn--primary ns-btn--full ns-form__cta"
              disabled={busy}
            >
              {sending ? (
                <>
                  <span className="ns-page-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Sending code…
                </>
              ) : (
                <>
                  Send code
                  <ArrowIcon />
                </>
              )}
            </button>
          </form>
        ) : (
          <div>
            <label className="ns-form__label" htmlFor="otp-0">
              Verification code
            </label>
            <div className="ns-otp" style={{ marginBottom: 4 }}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  ref={(el) => {
                    otpRefs.current[i] = el
                  }}
                  className={`ns-otp__box${d ? ' is-filled' : ''}`}
                  type="text"
                  inputMode="numeric"
                  autoComplete={i === 0 ? 'one-time-code' : 'off'}
                  maxLength={i === 0 ? OTP_LENGTH : 1}
                  aria-label={`Digit ${i + 1}`}
                  disabled={busy}
                  value={d}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleDigitKeyDown(i, e)}
                  onFocus={(e) => e.target.select()}
                  style={{ width: '100%', minWidth: 0, padding: 0 }}
                  onPaste={handlePaste}
                />
              ))}
            </div>
            <p className="ns-form__field-hint" role={error ? 'alert' : undefined} aria-live="polite">
              {error}
            </p>

            <button
              type="button"
              className="ns-btn ns-btn--primary ns-btn--full ns-form__cta"
              disabled={busy || digits.join('').length !== OTP_LENGTH}
              onClick={() => verifyCode(digits.join(''))}
            >
              {verifying || signingIn ? (
                <>
                  <span className="ns-page-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Verifying…
                </>
              ) : (
                <>
                  Verify &amp; continue
                  <ArrowIcon />
                </>
              )}
            </button>

            <p className="ns-form__resend">
              Didn&rsquo;t get it?{' '}
              <button
                type="button"
                className="ns-link"
                onClick={sendCode}
                disabled={busy || cooldown > 0}
                style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: cooldown > 0 ? 'default' : 'pointer' }}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
              </button>
              {' · '}
              <button
                type="button"
                className="ns-link"
                onClick={() => {
                  setStep('phone')
                  setError('')
                }}
                disabled={busy}
                style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer' }}
              >
                Change number
              </button>
            </p>
          </div>
        )}

        <p className="ns-form__alt" style={{ marginTop: 20 }}>
          <button
            type="button"
            className="ns-link"
            onClick={onBack}
            disabled={busy}
            style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer' }}
          >
            ← Use email instead
          </button>
        </p>

        {/* Invisible reCAPTCHA required by Firebase phone auth. Its badge renders inline here and
            is visually hidden, so Google requires the notice below instead. */}
        <div
          ref={recaptchaHostRef}
          aria-hidden="true"
          style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', visibility: 'hidden' }}
        />
        <p className="ns-form__legal">
          This site is protected by reCAPTCHA and the Google{' '}
          <a href="https://policies.google.com/privacy" className="ns-link ns-link--quiet" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>{' '}
          and{' '}
          <a href="https://policies.google.com/terms" className="ns-link ns-link--quiet" target="_blank" rel="noopener noreferrer">
            Terms of Service
          </a>{' '}
          apply.
        </p>
      </div>
    </div>
  )
}

function firebaseErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code ?? ''
  console.warn('[phone-auth]', code, (err as { message?: string })?.message ?? err)
  const message = friendlyMessage(code)
  // Surface the raw Firebase code in development to make setup problems easy to diagnose
  return process.env.NODE_ENV === 'development' && code ? `${message} (${code})` : message
}

function friendlyMessage(code: string): string {
  switch (code) {
    case 'auth/billing-not-enabled':
    case 'auth/operation-not-allowed':
      return 'Phone sign-in isn’t available right now. Please use email instead.'
    case 'auth/invalid-phone-number':
      return 'That phone number doesn’t look right. Please check it.'
    case 'auth/too-many-requests':
    case 'auth/quota-exceeded':
      return 'Too many attempts. Please wait a little and try again.'
    case 'auth/invalid-verification-code':
      return 'That code isn’t right. Please try again.'
    case 'auth/code-expired':
      return 'That code has expired. Please request a new one.'
    case 'auth/captcha-check-failed':
    case 'auth/invalid-app-credential':
      return 'We couldn’t verify this request. Please refresh and try again.'
    default:
      return 'Something went wrong. Please try again.'
  }
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M3 9h12M10 4l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
