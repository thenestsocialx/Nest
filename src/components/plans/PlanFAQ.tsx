'use client'

import { useState } from 'react'

const FAQS = [
  {
    q: 'What happens to my Nila conversations if I cancel?',
    a: 'They stay yours for 90 days, then are automatically deleted as always.',
  },
  {
    q: 'Can I switch plans?',
    a: 'Yes, anytime. Changes take effect immediately.',
  },
  {
    q: 'Is this therapy?',
    a: "No. Nest is a space to feel less alone — not a replacement for professional care.",
  },
  {
    q: 'How are Ally sessions different from Nila?',
    a: 'Allies are real humans. Trained listeners who give you their full attention for your session.',
  },
]

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 5 L7 9 L11 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function PlanFAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="ns-faq">
      <h2 className="ns-faq__title">Common questions</h2>
      {FAQS.map((faq, i) => (
        <div key={i} className="ns-faq__item">
          <button
            className="ns-faq__trigger"
            type="button"
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? null : i)}
          >
            {faq.q}
            <ChevronIcon />
          </button>
          {open === i && (
            <p className="ns-faq__answer">{faq.a}</p>
          )}
        </div>
      ))}
    </div>
  )
}
