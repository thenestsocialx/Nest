'use client'

import { useEffect, useRef } from 'react'
import { TURNSTILE_SITE_KEY } from '@/lib/turnstile'

// Cloudflare Turnstile, the bot check Supabase verifies when CAPTCHA protection is on.
// Renders nothing until NEXT_PUBLIC_TURNSTILE_SITE_KEY is set, so forms keep working before then.
// Inside a <form> it adds a hidden `cf-turnstile-response` field that the server action reads.

interface TurnstileApi {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string
  reset: (id: string) => void
  remove: (id: string) => void
}
declare global {
  interface Window { turnstile?: TurnstileApi }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
let loading: Promise<void> | null = null

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve()
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = SCRIPT_SRC
      s.async = true
      s.onload = () => resolve()
      s.onerror = () => { loading = null; reject(new Error('Turnstile failed to load')) }
      document.head.appendChild(s)
    })
  }
  return loading
}

interface Props {
  /** Called with the token once the check passes, and with null when it expires, fails or resets */
  onVerify?: (token: string | null) => void
  /** Change this after every submit: tokens are single-use, so the widget fetches a new one */
  resetKey?: unknown
}

export default function Turnstile({ onVerify, resetKey }: Props) {
  const box = useRef<HTMLDivElement>(null)
  const widget = useRef<string | null>(null)
  const verify = useRef(onVerify)
  useEffect(() => { verify.current = onVerify }, [onVerify])

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return
    let cancelled = false
    loadScript()
      .then(() => {
        if (cancelled || !box.current || !window.turnstile) return
        widget.current = window.turnstile.render(box.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: 'light',
          size: 'flexible',
          callback: (token: string) => verify.current?.(token),
          'expired-callback': () => verify.current?.(null),
          'error-callback': () => verify.current?.(null),
        })
      })
      .catch(() => verify.current?.(null))
    return () => {
      cancelled = true
      if (widget.current && window.turnstile) window.turnstile.remove(widget.current)
      widget.current = null
    }
  }, [])

  useEffect(() => {
    if (resetKey === undefined || !widget.current || !window.turnstile) return
    verify.current?.(null)
    window.turnstile.reset(widget.current)
  }, [resetKey])

  if (!TURNSTILE_SITE_KEY) return null
  return <div ref={box} style={{ margin: '4px 0 16px', minHeight: 65 }} />
}
