'use client'

import { useEffect, useState } from 'react'

interface Props {
  amountInr: number
  prevTotalInr: number
  prevSessions: number
  onClose: () => void
}

const MESSAGES: Record<number, string> = {
  1: 'One hour. Theirs now.',
  2: 'Two sessions. A thread of continuity for someone who\'s never had one.',
  3: 'Three sessions is where real work begins. You gave someone that.',
}

function getMessage(sessions: number): string {
  if (sessions <= 3) return MESSAGES[sessions] ?? MESSAGES[1]
  if (sessions <= 5) return 'You gave them a run. That\'s rare. That matters.'
  return 'You funded a chapter. Most people never get one.'
}

export default function DonationSuccessScreen({
  amountInr,
  prevTotalInr,
  prevSessions,
  onClose,
}: Props) {
  const sessions  = Math.max(1, Math.floor(amountInr / 799))
  const newTotal    = prevTotalInr + amountInr
  const newSessions = prevSessions + sessions

  // Animation phase (0–7) drives which elements have .kf-anim-in
  const [phase, setPhase] = useState(0)

  // Animated counter values
  const [displayTotal,    setDisplayTotal]    = useState(prevTotalInr)
  const [displaySessions, setDisplaySessions] = useState(prevSessions)

  // Staggered entrance
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 550),
      setTimeout(() => setPhase(3), 900),
      setTimeout(() => setPhase(4), 1250),
      setTimeout(() => setPhase(5), 1600),
      setTimeout(() => setPhase(6), 2100),
      setTimeout(() => setPhase(7), 2600),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  // Count-up starts at phase 5 (1600 ms into the sequence)
  useEffect(() => {
    if (phase < 5) return

    const duration = 1600
    const startTime = performance.now()
    let raf: number

    function tick(now: number) {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased    = 1 - Math.pow(1 - progress, 3)
      setDisplayTotal(Math.round(prevTotalInr + (newTotal - prevTotalInr) * eased))
      setDisplaySessions(Math.round(prevSessions + (newSessions - prevSessions) * eased))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase >= 5])

  // Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const anim = (threshold: number) => phase >= threshold ? 'kf-anim-in' : ''

  return (
    <div
      className="kf-success-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Donation confirmed"
    >
      <div className="kf-success-inner">

        {/* Wordmark */}
        <span className={`kf-success-wordmark ${anim(1)}`}>
          Kanmani · A Nest Social Fund
        </span>

        {/* Chair — person now seated */}
        <div className={`kf-success-chair ${anim(2)}`} aria-hidden="true">
          <svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg">
            {/* Light shaft */}
            <polygon points="88,0 152,0 178,240 62,240" fill="#E8C8A0" opacity="0.1"/>
            {/* Chair back */}
            <rect x="70" y="28" width="60" height="92" rx="8" fill="#E8C8A0"/>
            {/* Chair legs */}
            <rect x="76" y="118" width="8" height="76" fill="#5C7A66"/>
            <rect x="116" y="118" width="8" height="76" fill="#5C7A66"/>
            {/* Seat */}
            <rect x="50" y="118" width="100" height="16" rx="5" fill="#E8C8A0"/>
            {/* Front legs */}
            <rect x="56"  y="134" width="9" height="62" rx="2" fill="#E8C8A0"/>
            <rect x="135" y="134" width="9" height="62" rx="2" fill="#E8C8A0"/>
            {/* Person sitting — terracotta, gentle opacity */}
            <ellipse cx="100" cy="55" rx="13" ry="14" fill="#9B6651" opacity="0.65"/>
            <path d="M 87 73 Q 100 66 113 73 L 115 118 Q 100 124 85 118 Z" fill="#9B6651" opacity="0.65"/>
          </svg>
        </div>

        {/* Thank you */}
        <h1 className={`kf-success-heading ${anim(3)}`}>
          Thank you.
        </h1>

        {/* Sessions funded copy */}
        <p className={`kf-success-funded ${anim(4)}`}>
          You just funded {sessions} session{sessions !== 1 ? 's' : ''}<br />
          for a stranger who couldn&apos;t.
        </p>

        {/* Animated counter */}
        <div className={`kf-success-counter ${anim(5)}`}>
          <div className="kf-success-counter__row">
            <div className="kf-success-counter__block">
              <span className="kf-success-counter__value">
                ₹{displayTotal.toLocaleString('en-IN')}
              </span>
              <span className="kf-success-counter__label">Fund total</span>
            </div>
            <div className="kf-success-counter__divider" aria-hidden="true" />
            <div className="kf-success-counter__block">
              <span className="kf-success-counter__value">{displaySessions}</span>
              <span className="kf-success-counter__label">Sessions funded</span>
            </div>
          </div>
        </div>

        {/* Personal message */}
        <p className={`kf-success-message ${anim(6)}`}>
          &ldquo;{getMessage(sessions)}&rdquo;
        </p>

        {/* Quiet final line */}
        <p className={`kf-success-chair-line ${anim(7)}`}>
          Someone will sit in that chair.
        </p>

        {/* Close */}
        <button
          type="button"
          className={`kf-success-close ns-btn ns-btn--ghost ${anim(7)}`}
          onClick={onClose}
        >
          Back to Kanmani
        </button>

      </div>
    </div>
  )
}
