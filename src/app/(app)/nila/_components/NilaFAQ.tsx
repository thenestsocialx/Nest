'use client'

import { useState } from 'react'

const FAQS = [
  {
    id: 'f1',
    q: 'What happens to my conversations if I cancel?',
    a: 'They stay in your account, private to you. You can keep reading them, export them, or delete them. Cancelling only stops future billing. Nothing disappears.',
  },
  {
    id: 'f2',
    q: 'Can I switch plans?',
    a: 'Yes, any time. Upgrade immediately, downgrade at the end of your billing cycle. No fees, no friction.',
  },
  {
    id: 'f3',
    q: 'Is Nila a therapist?',
    a: 'No. Nila is an AI companion — she listens, reflects, and helps you feel less alone. She is not a licensed therapist and does not provide clinical diagnosis or treatment. For clinical support, our allies are here.',
  },
  {
    id: 'f4',
    q: 'Is what I tell Nila private?',
    a: "Yes. Your conversations are stored securely on Nest's servers and are never shared with third parties or used to train AI models. Only you can access your history.",
  },
  {
    id: 'f5',
    q: 'Will Nila remember what we talked about?',
    a: 'Within a session, yes. Across sessions, Nila can pick up where you left off if you choose. You can always start a fresh session.',
  },
  {
    id: 'f6',
    q: 'Can I use Nila if I am going through something serious?',
    a: 'Nila is here for the in-between — for nights that feel heavy, for processing what\'s on your mind. If you are in crisis, please reach out to iCall (9152 987 821) or Vandrevala (1860 2662 345). Both are free. If you want structured support, our allies are licensed professionals ready to help.',
  },
]

export default function NilaFAQ() {
  const [open, setOpen] = useState<string>('f1')

  return (
    <div style={{ width: '100%', maxWidth: 800 }}>
      {FAQS.map((faq) => {
        const isOpen = open === faq.id
        return (
          <div key={faq.id} className="ns-ld-faq-row">
            <button
              className="ns-ld-faq-trigger"
              type="button"
              onClick={() => setOpen(isOpen ? '' : faq.id)}
              aria-expanded={isOpen}
            >
              <span style={{ fontSize: 16, fontWeight: 500, color: '#2F4C3A', lineHeight: 1.4 }}>
                {faq.q}
              </span>
              <span
                style={{
                  fontSize: 22,
                  color: '#5C7A66',
                  lineHeight: 1,
                  paddingLeft: 16,
                  flexShrink: 0,
                  fontWeight: 300,
                }}
                aria-hidden="true"
              >
                {isOpen ? '−' : '+'}
              </span>
            </button>
            {isOpen && (
              <p className="ns-ld-faq-answer">
                {faq.a}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
