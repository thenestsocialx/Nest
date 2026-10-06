'use client'

import { useState } from 'react'
import { setPhoneAuthEnabled } from '../actions'

export default function PhoneAuthCard({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  async function handleToggle() {
    const next = !enabled
    setSaving(true)
    setMsg('')
    const { error } = await setPhoneAuthEnabled(next)
    setSaving(false)
    if (!error) {
      setEnabled(next)
      setMsg(next ? 'Phone sign-in is on.' : 'Phone sign-in is off. Users see email and Google only.')
    } else {
      setMsg('Failed to save. Try again.')
    }
    setTimeout(() => setMsg(''), 3500)
  }

  return (
    <div className="ns-card" style={{ marginBottom: 20 }}>
      <div className="ns-toggle-row" style={{ borderBottom: 'none', padding: 0 }}>
        <div className="ns-toggle-row__info">
          <div className="ns-toggle-row__title">Phone sign-in · SMS OTP (Firebase)</div>
          <div className="ns-toggle-row__desc">
            When on, the sign-in and create-account pages offer &ldquo;Continue with phone&rdquo;.
            Switch it off if SMS codes stop working: the button disappears and phone sign-in is
            blocked on the server. Email and Google sign-in keep working either way.
          </div>
          {msg && (
            <div style={{ marginTop: 8, fontSize: 12, color: msg.startsWith('Failed') ? 'var(--ns-red)' : 'var(--ns-teal)', fontWeight: 500 }}>
              {msg}
            </div>
          )}
        </div>
        <label className="ns-toggle" style={{ opacity: saving ? 0.5 : 1 }}>
          <input type="checkbox" checked={enabled} onChange={handleToggle} disabled={saving} aria-label="Phone sign-in" />
          <div className="ns-toggle__track" />
          <div className="ns-toggle__thumb" />
        </label>
      </div>
    </div>
  )
}
