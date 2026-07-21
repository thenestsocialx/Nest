'use client'

import { useEffect } from 'react'

// Initialises IntersectionObserver on all [data-kf-reveal] elements in the page.
// Must be rendered once inside the kanmani page — emits no DOM.
export default function KanmaniReveal() {
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const els = Array.from(document.querySelectorAll('[data-kf-reveal]'))

    if (prefersReduced) {
      els.forEach(el => el.classList.add('kf-visible'))
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('kf-visible')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 },
    )

    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  return null
}
