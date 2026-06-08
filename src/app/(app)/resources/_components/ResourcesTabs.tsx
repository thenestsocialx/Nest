'use client'

import { useState } from 'react'

type TabId = 'music' | 'films' | 'words' | 'sounds'

const TABS: { id: TabId; label: string }[] = [
  { id: 'music',  label: 'Music'  },
  { id: 'films',  label: 'Films'  },
  { id: 'words',  label: 'Words'  },
  { id: 'sounds', label: 'Sounds' },
]

const EMPTY: Record<TabId, { message: string; sub: string }> = {
  music:  {
    message: "We're handpicking sounds for where you are right now.",
    sub:     "Check back soon — something that fits just right is coming.",
  },
  films:  {
    message: "Something worth watching is being chosen with care.",
    sub:     "Launching soon — this space is being filled with warmth.",
  },
  words:  {
    message: "The right words are being gathered for you.",
    sub:     "Nothing here yet, but something meaningful is on its way.",
  },
  sounds: {
    message: "Calm is being bottled, slowly and with intention.",
    sub:     "This space will be filled with something that breathes.",
  },
}

export default function ResourcesTabs() {
  const [active, setActive] = useState<TabId>('music')
  const state = EMPTY[active]

  return (
    <div>
      <nav className="ns-res-tabs-nav" aria-label="Content categories">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className="ns-chip"
            onClick={() => setActive(tab.id)}
            aria-pressed={active === tab.id}
            style={
              active === tab.id
                ? {
                    borderColor:  'var(--moss)',
                    color:        'var(--deep-pine)',
                    background:   'var(--pine-tint)',
                    fontWeight:   500,
                  }
                : {}
            }
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Replace this block with real content grid when data is available */}
      <div
        key={active}
        className="ns-res-empty"
      >
        <div
          style={{
            width:           72,
            height:          72,
            borderRadius:    '50%',
            background:      'var(--pine-tint)',
            border:          '1px solid rgba(92,122,102,0.28)',
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            color:           'var(--moss)',
            marginBottom:    4,
            flexShrink:      0,
          }}
          aria-hidden="true"
        >
          <TabIcon id={active} />
        </div>

        <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--deep-pine)', margin: 0, maxWidth: '34ch', lineHeight: 1.45 }}>
          {state.message}
        </p>
        <p style={{ fontSize: 13, color: 'var(--moss)', margin: 0, fontStyle: 'italic', maxWidth: '40ch', lineHeight: 1.65 }}>
          {state.sub}
        </p>
      </div>
    </div>
  )
}

function TabIcon({ id }: { id: TabId }) {
  if (id === 'music') return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 18V6l12-2v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )

  if (id === 'films') return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 9h20M2 15h20M7 5v14M17 5v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )

  if (id === 'words') return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2c0 1.5-1 2.5-2 3l1 2H5l-1-2c-1-.5-1-1.5-1-3V7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M13 7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2c0 1.5-1 2.5-2 3l1 2h-3l-1-2c-1-.5-1-1.5-1-3V7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  )

  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 12h2M19 12h2M7 7.76 5.59 6.34M18.41 17.66 17 16.24M17 7.76l1.41-1.42M5.59 17.66 7 16.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )
}
