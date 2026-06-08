'use client'

import { useState } from 'react'

export default function NotifyForm() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <div
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            10,
          padding:        '14px 0',
          animation:      'nsFade 200ms var(--ease) both',
        }}
      >
        <span
          style={{
            width:           28,
            height:          28,
            borderRadius:    '50%',
            background:      'var(--pine-tint)',
            border:          '1.5px solid var(--moss)',
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            color:           'var(--moss)',
            flexShrink:      0,
          }}
          aria-hidden="true"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <span style={{ fontSize: 14, color: 'var(--moss)', fontStyle: 'italic' }}>
          We&rsquo;ll reach out when something is ready.
        </span>
      </div>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (email.trim()) setSubmitted(true)
      }}
      style={{ display: 'flex', gap: 8, maxWidth: 360, margin: '0 auto' }}
      aria-label="Get notified about upcoming events"
    >
      <input
        type="email"
        id="notify-email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        aria-label="Email address for event notifications"
        style={{
          flex:        1,
          padding:     '11px 16px',
          fontFamily:  'inherit',
          fontSize:    14,
          border:      'var(--bd-input)',
          borderRadius:'var(--r-sm)',
          background:  'var(--cream)',
          color:       'var(--deep-pine)',
          outline:     'none',
          minWidth:    0,
        }}
      />
      <button type="submit" className="ns-btn ns-btn--primary">
        Notify me
      </button>
    </form>
  )
}
