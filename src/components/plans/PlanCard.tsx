'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { initiateSubscription } from '@/actions/razorpay'

export interface PlanConfig {
  id: string
  name: string
  price: string
  tag: string
  features: string[]
  cta: string
  isFeatured?: boolean
}

export interface ActiveSub {
  id: string
  status: 'active' | 'authenticated' | 'paused' | 'halted'
  periodEnd: string | null
  cancelAtEnd: boolean
}

interface Props extends PlanConfig {
  currentPlan: string
  userEmail: string
  activeSub?: ActiveSub | null
  guestMode?: boolean
}

// Razorpay checkout.js is loaded dynamically at payment time
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}

interface RazorpayOptions {
  key: string
  subscription_id: string
  name: string
  description: string
  prefill: { email: string }
  theme: { color: string }
  modal: { ondismiss: () => void }
  handler: (response: {
    razorpay_payment_id: string
    razorpay_subscription_id: string
    razorpay_signature: string
  }) => void
}

interface RazorpayInstance {
  open(): void
  on(event: string, handler: () => void): void
}

// Injects checkout.js once and resolves when the SDK is ready
function loadRazorpaySDK(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function CheckIcon() {
  return (
    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
      <path
        d="M1 4 L3.5 6.5 L9 1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function PlanCard({
  id,
  name,
  price,
  tag,
  features,
  cta,
  isFeatured,
  currentPlan,
  userEmail,
  activeSub,
  guestMode,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const isCurrent = currentPlan === id

  const handleSubscribe = useCallback(async () => {
    if (isCurrent || id === 'free') return
    setLoading(true)
    setError('')

    // 1. Create subscription on server
    const result = await initiateSubscription(id)

    if (!result.success) {
      setError(result.error)
      setLoading(false)
      return
    }

    const { subscriptionId, keyId } = result

    // 2. Load Razorpay checkout.js
    const sdkLoaded = await loadRazorpaySDK()
    if (!sdkLoaded || !window.Razorpay) {
      setError('Payment SDK failed to load. Please disable any ad blockers and try again.')
      setLoading(false)
      return
    }

    // 3. Open Razorpay checkout modal
    const rzp = new window.Razorpay({
      key: keyId,
      subscription_id: subscriptionId,
      name: 'Nest',
      description: `${name} Plan`,
      prefill: { email: userEmail },
      theme: { color: '#2F4C3A' }, // --deep-pine
      modal: {
        ondismiss: () => setLoading(false),
      },
      handler: async (response) => {
        // 4. Verify payment signature server-side
        try {
          const res = await fetch('/api/razorpay/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          })
          if (!res.ok) throw new Error('Verification failed')
          router.push('/plans?success=1')
        } catch {
          setError('Payment succeeded but verification failed. Contact support with your payment ID.')
          setLoading(false)
        }
      },
    })

    rzp.open()
  }, [id, name, isCurrent, userEmail, router])

  return (
    <div className={`ns-plan-card${isFeatured ? ' ns-plan-card--featured' : ''}`}>
      <span className="ns-plan-card__tag">{tag}</span>
      <h2 className="ns-plan-card__name">{name}</h2>
      <p className="ns-plan-card__price">
        {price}
        {price !== '₹0' ? (
          <span className="ns-plan-card__price-unit"> / month</span>
        ) : (
          <span className="ns-plan-card__price-unit"> forever</span>
        )}
      </p>

      <ul className="ns-plan-card__features">
        {features.map((f) => (
          <li key={f} className="ns-plan-card__feature">
            <span className="ns-plan-card__check">
              <CheckIcon />
            </span>
            {f}
          </li>
        ))}
      </ul>

      {/* ── CTA / Status section ── */}
      {guestMode ? (
        <a
          href={id === 'free' ? '/signup' : `/signup?plan=${id}`}
          className={`ns-btn${isFeatured ? ' ns-btn--primary' : ' ns-btn--secondary'} ns-btn--full`}
          style={{ textAlign: 'center', textDecoration: 'none', display: 'block', boxSizing: 'border-box' }}
        >
          {id === 'free' ? 'Start free' : cta}
        </a>
      ) : isCurrent ? (
        <div className="ns-plan-card__current-wrap">
          <div className="ns-plan-card__current">You&apos;re on this plan</div>

          {activeSub && id !== 'free' && (
            <div className="ns-plan-card__sub-mgmt">
              {activeSub.status === 'paused' && (
                <p className="ns-plan-card__sub-detail">Subscription paused — billing on hold</p>
              )}
              {activeSub.status === 'halted' && (
                <p className="ns-plan-card__sub-detail" style={{ color: 'var(--terracotta, #9B6651)' }}>
                  Payment retries failed — please update your payment method
                </p>
              )}
              {(activeSub.status === 'active' || activeSub.status === 'authenticated') && activeSub.periodEnd && (
                <p className="ns-plan-card__sub-detail">
                  {activeSub.cancelAtEnd
                    ? `Access ends ${formatDate(activeSub.periodEnd)}`
                    : `Renews ${formatDate(activeSub.periodEnd)}`}
                </p>
              )}
              <a
                href="/profile"
                style={{
                  display: 'inline-block',
                  marginTop: 10,
                  fontSize: 12,
                  color: 'var(--moss)',
                  textDecoration: 'none',
                  opacity: 0.75,
                }}
              >
                Manage subscription → Profile
              </a>
            </div>
          )}
        </div>
      ) : id === 'free' ? (
        <div className="ns-plan-card__current" />
      ) : (
        <>
          <button
            type="button"
            className={`ns-btn${isFeatured ? ' ns-btn--primary' : ' ns-btn--secondary'} ns-btn--full`}
            disabled={loading}
            onClick={handleSubscribe}
          >
            {loading ? 'Loading…' : cta}
          </button>
          {error && (
            <div className="ns-plan-card__notice" role="alert">
              <svg className="ns-plan-card__notice-icon" width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 1.5L1.5 12h11L7 1.5z" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 6v2.4" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
                <circle cx="7" cy="10.2" r="0.65" fill="currentColor" />
              </svg>
              <span className="ns-plan-card__notice-text">{error}</span>
              <button
                type="button"
                className="ns-plan-card__notice-close"
                aria-label="Dismiss"
                onClick={() => setError('')}
              >
                ×
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
