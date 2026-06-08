'use client'

import { useState } from 'react'
import { createCheckoutSession, createBillingPortalSession } from '@/actions/stripe'

export interface PlanConfig {
  id: string
  name: string
  price: string
  tag: string
  features: string[]
  cta: string
  isFeatured?: boolean
}

interface Props extends PlanConfig {
  currentPlan: string
}

function CheckIcon() {
  return (
    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
      <path d="M1 4 L3.5 6.5 L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
}: Props) {
  const [loading, setLoading] = useState(false)
  const isCurrent = currentPlan === id
  const userIsOnPaidPlan = currentPlan === 'core' || currentPlan === 'premium'

  async function handleCTA() {
    if (isCurrent || id === 'free') return
    setLoading(true)
    try {
      if (userIsOnPaidPlan) {
        await createBillingPortalSession()
      } else {
        await createCheckoutSession(id)
      }
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className={`ns-plan-card${isFeatured ? ' ns-plan-card--featured' : ''}`}>
      <span className="ns-plan-card__tag">{tag}</span>
      <h2 className="ns-plan-card__name">{name}</h2>
      <p className="ns-plan-card__price">
        {price}
        {price !== '₹0' && (
          <span className="ns-plan-card__price-unit"> / month</span>
        )}
        {price === '₹0' && (
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

      {isCurrent || id === 'free' ? (
        <div className="ns-plan-card__current">
          {isCurrent ? "You're on this plan" : ''}
        </div>
      ) : (
        <button
          type="button"
          className={`ns-btn${isFeatured ? ' ns-btn--primary' : ' ns-btn--secondary'} ns-btn--full`}
          disabled={loading}
          onClick={handleCTA}
        >
          {loading ? 'Redirecting…' : cta}
        </button>
      )}
    </div>
  )
}
