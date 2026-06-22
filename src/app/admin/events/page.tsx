'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { saveAdminConfig } from '../config/actions'

export default function AdminEventsPage() {
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('nest_config')
      .select('value')
      .eq('key', 'features.events.enabled')
      .maybeSingle()
      .then(({ data }) => {
        setEnabled(data?.value === 'true')
        setLoading(false)
      })
  }, [])

  async function handleToggle() {
    const next = !enabled
    setSaving(true)
    setMsg('')
    const { error } = await saveAdminConfig('features.events.enabled', next ? 'true' : 'false')
    setSaving(false)
    if (!error) {
      setEnabled(next)
      setMsg(next ? 'Events are now visible to users.' : 'Events hidden from users.')
    } else {
      setMsg('Failed to save — try again.')
    }
    setTimeout(() => setMsg(''), 3500)
  }

  return (
    <>
      {/* Feature toggle */}
      <div className="ns-card" style={{ marginBottom: 20 }}>
        <div className="ns-toggle-row" style={{ borderBottom: 'none', padding: 0 }}>
          <div className="ns-toggle-row__info">
            <div className="ns-toggle-row__title">Events · Visible to users</div>
            <div className="ns-toggle-row__desc">
              When enabled, the Events section appears in the app sidebar and bottom nav.
              Users can browse upcoming events and sign up for notifications. Disable to hide it entirely — direct URL access is also blocked.
            </div>
            {msg && (
              <div style={{ marginTop: 8, fontSize: 12, color: msg.startsWith('Failed') ? 'var(--ns-red)' : 'var(--ns-teal)', fontWeight: 500 }}>
                {msg}
              </div>
            )}
          </div>
          {loading ? (
            <div style={{ width: 38, height: 22, borderRadius: 11, background: 'var(--ns-border)', flexShrink: 0 }} />
          ) : (
            <label className="ns-toggle" style={{ opacity: saving ? 0.5 : 1 }}>
              <input type="checkbox" checked={enabled} onChange={handleToggle} disabled={saving} />
              <div className="ns-toggle__track" />
              <div className="ns-toggle__thumb" />
            </label>
          )}
        </div>
      </div>

      {/* Coming soon */}
      <div className="ns-card" style={{ textAlign: 'center', padding: '52px 32px' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'var(--ns-forest-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          color: 'var(--ns-forest)',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <path d="M3 9h18M8 2v4M16 2v4"/>
            <circle cx="8" cy="14" r="1" fill="currentColor" stroke="none"/>
            <circle cx="12" cy="14" r="1" fill="currentColor" stroke="none"/>
            <circle cx="16" cy="14" r="1" fill="currentColor" stroke="none"/>
          </svg>
        </div>
        <div style={{ fontFamily: 'var(--ns-font-serif)', fontSize: 20, color: 'var(--ns-ink)', marginBottom: 10 }}>
          Events management is coming
        </div>
        <div style={{ fontSize: 13, color: 'var(--ns-ink-4)', lineHeight: 1.7, maxWidth: '42ch', margin: '0 auto' }}>
          This is where you&rsquo;ll create and manage in-person gatherings — Sunday Circles, quiet evenings, city-based events — with registrations and automated follow-ups.
        </div>
        <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['Create events', 'Registrations', 'Waitlists', 'Reminders', 'Post-event flow'].map((label) => (
            <span key={label} className="ns-badge ns-badge--gray">{label}</span>
          ))}
        </div>
        <div style={{ marginTop: 28, fontSize: 12, color: 'var(--ns-ink-4)', opacity: 0.65, fontStyle: 'italic' }}>
          For now, use the toggle above to control user visibility.
        </div>
      </div>
    </>
  )
}
