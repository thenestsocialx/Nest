'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCountUp } from '../_hooks/useCountUp'

interface Stats {
  total_raised_inr: number
  sessions_funded:  number
}

interface Props {
  initialStats: Stats
}

export default function KanmaniStats({ initialStats }: Props) {
  const [stats, setStats] = useState<Stats>(initialStats)
  // Ref tracks what values we're animating FROM to avoid stale closures in the realtime callback
  const statsRef = useRef<Stats>(initialStats)

  const animatedTotal    = useCountUp(stats.total_raised_inr)
  const animatedSessions = useCountUp(stats.sessions_funded)

  useEffect(() => {
    statsRef.current = stats
  }, [stats])

  useEffect(() => {
    function fetchFresh() {
      fetch('/api/kanmani/stats')
        .then(r => r.json())
        .then((fresh: Stats) => setStats(fresh))
        .catch(() => {})
    }

    // Always fetch live stats on mount — the server-rendered initialStats may be stale
    fetchFresh()

    // Re-fetch when a payment is captured on this page (dispatched by DonationModal)
    window.addEventListener('kanmani:payment-captured', fetchFresh)

    const supabase = createClient()
    const channel = supabase
      .channel('kf-donations-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'kanmani_donations' },
        fetchFresh,
      )
      .subscribe()

    return () => {
      window.removeEventListener('kanmani:payment-captured', fetchFresh)
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <section className="kf-section kf-section--dark" id="fund-stats">
      <span className="kf-eyebrow" data-kf-reveal>Where It Stands</span>

      <div className="kf-numbers-row" data-kf-reveal>
        <div className="kf-number-block">
          <span className="kf-number-value">
            ₹{animatedTotal.toLocaleString('en-IN')}
          </span>
          <span className="kf-number-label">Raised so far</span>
        </div>
        <div className="kf-number-block">
          <span className="kf-number-value">{animatedSessions}</span>
          <span className="kf-number-label">Sessions funded</span>
        </div>
      </div>

      <p className="kf-numbers-caption" data-kf-reveal>
        Every fund starts at zero. This one starts today, with you.
      </p>
    </section>
  )
}
