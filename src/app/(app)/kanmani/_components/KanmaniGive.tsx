'use client'

import { useState } from 'react'
import DonationModal from './DonationModal'

const PRESETS = [
  { amount: 799,  sessions: '1 session',  phrase: 'One full hour.\nJust theirs.'     },
  { amount: 1598, sessions: '2 sessions', phrase: 'Twice the time.\nReal change.'    },
  { amount: 2397, sessions: '3 sessions', phrase: 'Three sessions.\nA beginning.'    },
]

export default function KanmaniGive() {
  const [selected,     setSelected]     = useState(799)
  const [isCustom,     setIsCustom]     = useState(false)
  const [customVal,    setCustomVal]    = useState('')
  const [isModalOpen,  setIsModalOpen]  = useState(false)

  const effectiveAmount = isCustom
    ? (parseInt(customVal, 10) || 0)
    : selected

  const sessions = Math.floor(effectiveAmount / 799)

  function openModal() {
    if (effectiveAmount < 1) return
    setIsModalOpen(true)
  }

  return (
    <>
      <section className="kf-section kf-section--tint" id="give">
        <span className="kf-eyebrow" data-kf-reveal>What ₹799 Buys</span>

        <p className="kf-anchor-text" data-kf-reveal>
          ₹799 funds one full session. That&apos;s it. That&apos;s the whole ask.
        </p>

        {/* Amount cards */}
        <div className="kf-amount-grid" data-kf-reveal>
          {PRESETS.map((p) => (
            <button
              key={p.amount}
              type="button"
              className={`kf-amount-card${!isCustom && selected === p.amount ? ' is-active' : ''}`}
              onClick={() => { setSelected(p.amount); setIsCustom(false) }}
            >
              <span className="kf-amount-card__price">₹{p.amount.toLocaleString('en-IN')}</span>
              <span className="kf-amount-card__sessions">{p.sessions}</span>
              <span className="kf-amount-card__phrase">
                {p.phrase.split('\n').map((line, i, arr) => (
                  <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                ))}
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          className={`kf-amount-custom-link${isCustom ? ' is-active' : ''}`}
          onClick={() => setIsCustom(true)}
        >
          + Custom amount
        </button>

        {isCustom && (
          <div className="kf-custom-wrap">
            <label htmlFor="kf-custom-amount">Amount (₹)</label>
            <input
              id="kf-custom-amount"
              type="number"
              min="1"
              placeholder="e.g. 1500"
              value={customVal}
              onChange={(e) => setCustomVal(e.target.value)}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
            />
          </div>
        )}

        {/* Impact preview (live) */}
        {sessions > 0 && (
          <p
            style={{
              marginTop: '1.25rem',
              fontFamily: 'var(--font-playfair)',
              fontStyle: 'italic',
              fontSize: '1rem',
              color: 'var(--terracotta)',
              opacity: 0.9,
            }}
          >
            {sessions} session{sessions !== 1 ? 's' : ''} funded
          </p>
        )}

        <button
          type="button"
          className="kf-give-btn ns-btn ns-btn--primary"
          disabled={effectiveAmount < 1}
          onClick={openModal}
        >
          Give {effectiveAmount > 0 ? `₹${effectiveAmount.toLocaleString('en-IN')}` : 'now'}
        </button>
      </section>

      <DonationModal
        isOpen={isModalOpen}
        initialAmount={effectiveAmount}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
