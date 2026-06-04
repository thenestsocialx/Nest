'use client'

import { useActionState, useState } from 'react'
import { saveSignupProfile, type ProfileActionState } from '@/actions/profile'

const initialState: ProfileActionState = {}

interface SignupFormProps {
  defaultName: string
  email: string
}

export default function SignupForm({ defaultName, email }: SignupFormProps) {
  const [state, formAction, isPending] = useActionState(saveSignupProfile, initialState)
  const [tcChecked, setTcChecked] = useState(false)
  const [waChecked, setWaChecked] = useState(false)

  return (
    <div className="ns-su-wrap">
      <div className="ns-su-form-inner">
        <p className="ns-su-eyebrow">Create your account</p>
        <h1 className="ns-su-headline">
          Let&rsquo;s make<br />this yours.
        </h1>
        <p className="ns-su-sub">
          We only ask for what we actually need. Nothing here gets shared without your knowledge.
        </p>

        {state.error && (
          <div className="ns-form__error" role="alert" style={{ marginBottom: 16 }}>
            {state.error}
          </div>
        )}

        <form action={formAction} className="ns-su-body" noValidate>

          {/* ── Section 1: About you ── */}
          <fieldset className="ns-su-section">
            <legend className="ns-su-section-label">About you</legend>

            <div className="ns-su-field">
              <label className="ns-su-field-label" htmlFor="su-name">Your name</label>
              <input
                className="ns-su-input"
                type="text"
                id="su-name"
                name="name"
                defaultValue={defaultName}
                placeholder="How you'd like to be called"
                autoComplete="given-name"
                required
              />
            </div>

            <div className="ns-su-field">
              <label className="ns-su-field-label" htmlFor="su-email">Email address</label>
              <input
                className="ns-su-input ns-su-input--readonly"
                type="email"
                id="su-email"
                name="email_display"
                defaultValue={email}
                readOnly
                aria-label="Email from your Google account — cannot be changed here"
                tabIndex={-1}
              />
            </div>
          </fieldset>

          {/* ── Section 2: Your number ── */}
          <fieldset className="ns-su-section">
            <legend className="ns-su-section-label">Your number</legend>

            <div className="ns-su-field">
              <label className="ns-su-field-label" htmlFor="su-phone">Phone number</label>
              <div className="ns-su-phone-stack">
                <div className="ns-su-phone-row">
                  <select
                    className="ns-su-select"
                    name="phone_country_code"
                    defaultValue="+91"
                    aria-label="Country code"
                  >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+61">🇦🇺 +61</option>
                    <option value="+971">🇦🇪 +971</option>
                  </select>
                  <input
                    className="ns-su-input"
                    type="tel"
                    id="su-phone"
                    name="phone"
                    placeholder="98765 43210"
                    autoComplete="tel-national"
                    required
                    style={{ flex: 1, minWidth: 0 }}
                  />
                </div>

                {/* WhatsApp opt-in chip */}
                <label
                  className={`ns-su-wa-row${waChecked ? ' checked' : ''}`}
                  htmlFor="su-wa"
                >
                  <input
                    type="checkbox"
                    id="su-wa"
                    name="whatsapp_opt_in"
                    checked={waChecked}
                    onChange={(e) => setWaChecked(e.target.checked)}
                    value="true"
                  />
                  <span className="ns-su-wa-box" aria-hidden="true">
                    <svg
                      className="ns-su-wa-tick"
                      width="10"
                      height="8"
                      viewBox="0 0 10 8"
                      fill="none"
                    >
                      <path
                        d="M1 4l3 3 5-6"
                        stroke="#F8F0E5"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="ns-su-wa-icon" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.06L2 22l5.06-1.38A9.96 9.96 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2Z"
                        fill="#25D366"
                        opacity="0.8"
                      />
                      <path
                        d="M17 14.5c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.41-1.5-.89-.79-1.49-1.77-1.67-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.19-.57-.34Z"
                        fill="#F8F0E5"
                      />
                    </svg>
                  </span>
                  <span className="ns-su-wa-label">This is also my WhatsApp number</span>
                </label>
              </div>
            </div>
          </fieldset>

          {/* ── Section 3: Just in case ── */}
          <fieldset className="ns-su-section">
            <legend className="ns-su-section-label">Just in case</legend>

            <div className="ns-su-field">
              <label className="ns-su-field-label" htmlFor="su-emergency">
                Emergency contact number
              </label>
              <p className="ns-su-hint" id="su-emergency-hint">
                Someone we can reach if you ever need a little extra support. They
                won&rsquo;t be contacted without your knowledge.
              </p>
              <div className="ns-su-phone-row" style={{ marginTop: 6 }}>
                <select
                  className="ns-su-select"
                  name="emergency_country_code"
                  defaultValue="+91"
                  aria-label="Emergency contact country code"
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+61">🇦🇺 +61</option>
                  <option value="+971">🇦🇪 +971</option>
                </select>
                <input
                  className="ns-su-input"
                  type="tel"
                  id="su-emergency"
                  name="emergency_phone"
                  placeholder="A trusted person's number"
                  autoComplete="off"
                  aria-describedby="su-emergency-hint"
                  style={{ flex: 1, minWidth: 0 }}
                />
              </div>
            </div>
          </fieldset>

          {/* ── Section 4: Agreement + Submit ── */}
          <fieldset className="ns-su-section ns-su-section--last">
            <legend className="sr-only">Agreement</legend>

            {/* T&C checkbox */}
            <label
              className={`ns-su-tc-row${tcChecked ? ' checked' : ''}`}
              htmlFor="su-tc"
            >
              <input
                type="checkbox"
                id="su-tc"
                name="tc"
                checked={tcChecked}
                onChange={(e) => setTcChecked(e.target.checked)}
                value="true"
                required
              />
              <span className="ns-su-tc-box" aria-hidden="true">
                <svg
                  className="ns-su-tc-tick"
                  width="11"
                  height="9"
                  viewBox="0 0 11 9"
                  fill="none"
                >
                  <path
                    d="M1 4.5l3.5 3.5 5.5-7"
                    stroke="#F8F0E5"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="ns-su-tc-text">
                I&rsquo;ve read and agree to NEST&rsquo;s{' '}
                <a
                  href="/terms"
                  className="ns-su-tc-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  Terms of Use
                </a>{' '}
                and{' '}
                <a
                  href="/privacy"
                  className="ns-su-tc-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  Privacy Policy
                </a>
                . I understand my data stays private.
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              className="ns-btn ns-btn--primary ns-btn--full ns-su-submit"
              disabled={!tcChecked || isPending}
              aria-label="Create your NEST account"
            >
              {isPending ? (
                'Setting things up…'
              ) : (
                <>
                  Create my account{' '}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 18 18"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 9h12M10 4l5 5-5 5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </>
              )}
            </button>

            <p className="ns-su-note">Takes less than a minute &middot; No card required</p>
          </fieldset>
        </form>
      </div>
    </div>
  )
}
