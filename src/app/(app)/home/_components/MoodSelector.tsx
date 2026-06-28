'use client'

import { useState } from 'react'

const MOODS = [
  { glyph: '😔', label: 'Low' },
  { glyph: '😕', label: 'Off' },
  { glyph: '😶', label: 'Numb' },
  { glyph: '🙂', label: 'Okay' },
  { glyph: '😌', label: 'Settled' },
]

interface Props {
  initialMood?: number | null
}

export default function MoodSelector({ initialMood = null }: Props) {
  const [selected, setSelected] = useState<number | null>(initialMood)
  const [saving, setSaving] = useState(false)

  async function handleSelect(i: number) {
    const next = i === selected ? null : i
    setSelected(next)
    if (next === null) return

    setSaving(true)
    try {
      await fetch('/api/v1/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood_index: next }),
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="ns-mood">
      <div className="ns-mood__head">
        <div className="ns-mood__label">Today&rsquo;s mood</div>
        <div className="ns-mood__note">{saving ? 'Saving…' : 'Optional · Not shared'}</div>
      </div>
      <div className="ns-mood__row">
        {MOODS.map((m, i) => (
          <button
            key={m.label}
            className={`ns-mood__chip${selected === i ? ' is-selected' : ''}`}
            onClick={() => handleSelect(i)}
            aria-label={m.label}
            aria-pressed={selected === i}
          >
            <span className="ns-mood__glyph">{m.glyph}</span>
            <span className="ns-mood__name">{m.label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
