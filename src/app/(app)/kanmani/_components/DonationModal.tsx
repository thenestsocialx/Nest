'use client'

import { useState, useEffect, useCallback } from 'react'
import { createDonationOrder } from '@/actions/kanmani'
import DonationSuccessScreen from './DonationSuccessScreen'

interface Props {
  isOpen: boolean
  initialAmount: number
  onClose: () => void
}

const PRESETS = [
  { amount: 799,  label: '1 session'  },
  { amount: 1598, label: '2 sessions' },
  { amount: 2397, label: '3 sessions' },
]

function loadRazorpaySDK(): Promise<boolean> {
  return new Promise((resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src    = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async  = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

function fmt(n: number) {
  return '₹' + n.toLocaleString('en-IN')
}

export default function DonationModal({ isOpen, initialAmount, onClose }: Props) {
  const [mounted,      setMounted]      = useState(false)
  const [closing,      setClosing]      = useState(false)
  const [amount,       setAmount]       = useState(initialAmount)
  const [isCustom,     setIsCustom]     = useState(false)
  const [customVal,    setCustomVal]    = useState('')
  const [donorName,    setDonorName]    = useState('')
  const [donorEmail,   setDonorEmail]   = useState('')
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')
  const [successData,  setSuccessData]  = useState<{
    amountInr: number
    prevTotalInr: number
    prevSessions: number
  } | null>(null)

  // Mount / unmount with animation
  useEffect(() => {
    if (isOpen) {
      setMounted(true)
      setClosing(false)
      setAmount(initialAmount)
      const isPreset = PRESETS.some(p => p.amount === initialAmount)
      setIsCustom(!isPreset)
      setCustomVal(!isPreset ? String(initialAmount) : '')
      setError('')
      setLoading(false)
    } else {
      setClosing(true)
      const t = setTimeout(() => {
        setMounted(false)
        setClosing(false)
        setSuccessData(null)
      }, 250)
      return () => clearTimeout(t)
    }
  }, [isOpen, initialAmount])

  // Escape key
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  function handleClose() {
    setClosing(true)
    setTimeout(() => onClose(), 230)
  }

  const effectiveAmount = isCustom
    ? (parseInt(customVal, 10) || 0)
    : amount

  const sessions = Math.floor(effectiveAmount / 799)

  const handlePay = useCallback(async () => {
    if (effectiveAmount < 1) {
      setError('Please enter a valid amount.')
      return
    }
    setLoading(true)
    setError('')

    // Snapshot fund total BEFORE this donation so the success screen can count from it
    let prevTotalInr  = 0
    let prevSessions  = 0
    try {
      const r = await fetch('/api/kanmani/stats')
      if (r.ok) {
        const s = await r.json()
        prevTotalInr = s.total_raised_inr ?? 0
        prevSessions = s.sessions_funded  ?? 0
      }
    } catch { /* non-critical */ }

    const orderResult = await createDonationOrder(effectiveAmount)
    if (!orderResult.success) {
      setError(orderResult.error)
      setLoading(false)
      return
    }

    const sdkLoaded = await loadRazorpaySDK()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!sdkLoaded || !(window as any).Razorpay) {
      setError('Payment SDK failed to load. Please disable ad-blockers and try again.')
      setLoading(false)
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const RzpClass = (window as any).Razorpay
    const rzp = new RzpClass({
      key:      orderResult.keyId,
      order_id: orderResult.orderId,
      amount:   orderResult.amount,
      currency: 'INR',
      name:     'Kanmani — A Nest Social Fund',
      description: sessions > 0
        ? `Funding ${sessions} therapy session${sessions !== 1 ? 's' : ''}`
        : 'Contribution to the Kanmani fund',
      prefill: {
        name:  donorName  || undefined,
        email: donorEmail || undefined,
      },
      notes: { fund: 'kanmani' },
      theme: { color: '#2F4C3A' }, // --deep-pine
      modal: {
        ondismiss: () => setLoading(false),
      },
      handler: async (response: {
        razorpay_payment_id: string
        razorpay_order_id:   string
        razorpay_signature:  string
      }) => {
        try {
          const res = await fetch('/api/kanmani/verify-payment', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_signature:  response.razorpay_signature,
              donor_email: donorEmail || undefined,
              donor_name:  donorName  || undefined,
            }),
          })
          if (!res.ok) throw new Error('Verification failed')
          // Show success screen — keeps same z-stack, overlay appears on top
          setSuccessData({ amountInr: effectiveAmount, prevTotalInr, prevSessions })
        } catch {
          setError(
            'Payment went through but confirmation failed. Please contact us with your payment ID.',
          )
          setLoading(false)
        }
      },
    })

    rzp.open()
  }, [effectiveAmount, sessions, donorName, donorEmail])

  // Success screen takes full control
  if (successData) {
    return (
      <DonationSuccessScreen
        {...successData}
        onClose={() => {
          setSuccessData(null)
          onClose()
        }}
      />
    )
  }

  if (!mounted) return null

  return (
    <div
      className={`kf-modal-backdrop${closing ? ' is-closing' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
      role="dialog"
      aria-modal="true"
      aria-label="Make a donation"
    >
      <div className="kf-modal-card">
        {/* Header */}
        <div className="kf-modal-head">
          <span className="kf-modal-title">Give to Kanmani</span>
          <button
            type="button"
            className="kf-modal-close"
            aria-label="Close"
            onClick={handleClose}
          >
            ×
          </button>
        </div>

        <div className="kf-modal-body">

          {/* Amount selector */}
          <div>
            <p className="kf-modal-section-label">Choose an amount</p>
            <div className="kf-modal-amounts">
              {PRESETS.map((p) => (
                <button
                  key={p.amount}
                  type="button"
                  className={`kf-modal-amount-btn${!isCustom && amount === p.amount ? ' is-active' : ''}`}
                  onClick={() => { setAmount(p.amount); setIsCustom(false); setError('') }}
                >
                  <span className="kf-modal-amt-value">{fmt(p.amount)}</span>
                  <span className="kf-modal-amt-label">{p.label}</span>
                </button>
              ))}
              <button
                type="button"
                className={`kf-modal-amount-btn kf-modal-amount-btn--custom${isCustom ? ' is-active' : ''}`}
                onClick={() => { setIsCustom(true); setError('') }}
              >
                <span className="kf-modal-amt-value">Custom</span>
                <span className="kf-modal-amt-label">any amount</span>
              </button>
            </div>

            {isCustom && (
              <input
                className="kf-modal-custom-input"
                type="number"
                min="1"
                placeholder="e.g. 1500"
                value={customVal}
                onChange={(e) => { setCustomVal(e.target.value); setError('') }}
                style={{ marginTop: '0.75rem' }}
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
              />
            )}
          </div>

          {/* Impact preview */}
          {effectiveAmount > 0 && (
            <div className="kf-modal-impact">
              <p className="kf-modal-impact__line">
                {sessions > 0
                  ? <>You&apos;re funding <span>{sessions} session{sessions !== 1 ? 's' : ''}</span> for a stranger.</>
                  : <>Every rupee goes toward the next session.</>
                }
              </p>
            </div>
          )}

          {/* Optional donor details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <p className="kf-modal-section-label" style={{ marginBottom: 0 }}>
              Your details <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400, opacity: 0.65 }}>(optional)</span>
            </p>
            <div className="kf-modal-field">
              <label htmlFor="kf-donor-name">Name</label>
              <input
                id="kf-donor-name"
                type="text"
                placeholder="Your name"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                autoComplete="name"
              />
            </div>
            <div className="kf-modal-field">
              <label htmlFor="kf-donor-email">Email</label>
              <input
                id="kf-donor-email"
                type="email"
                placeholder="For a receipt"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="kf-modal-error" role="alert">
              <span>{error}</span>
            </div>
          )}

          {/* Pay CTA */}
          <button
            type="button"
            className="kf-give-btn kf-modal-pay-btn ns-btn ns-btn--primary"
            disabled={loading || effectiveAmount < 1}
            onClick={handlePay}
          >
            {loading
              ? 'Opening payment…'
              : effectiveAmount > 0
                ? `Give ${fmt(effectiveAmount)}`
                : 'Give now'
            }
          </button>

        </div>
      </div>
    </div>
  )
}
