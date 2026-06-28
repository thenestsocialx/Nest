'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()
  const [selected, setSelected] = useState<number | null>(initialMood)
  const [saving, setSaving] = useState(false)

  // Sync when server refreshes with a new saved value
  useEffect(() => {
    setSelected(initialMood ?? null)
  }, [initialMood])

  async function handleSelect(i: number) {
    const next = i === selected ? null : i
    setSelected(next)   // optimistic — updates chip immediately
    if (next === null) return

    setSaving(true)
    try {
      await fetch('/api/v1/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood_index: next }),
      })
      router.refresh()  // re-fetch server data so trend bars update
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
