import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { loadNilaSessionMessages } from '@/actions/nila'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'

export const metadata = { title: 'Session — Nila History' }

function formatTime(iso: string): string {
  const d = new Date(iso)
  const h = d.getHours()
  const m = d.getMinutes()
  const ampm = h >= 12 ? 'pm' : 'am'
  const hour = h % 12 || 12
  const min = m.toString().padStart(2, '0')
  return `${hour}:${min} ${ampm}`
}

function NilaBubbleAvatar() {
  return (
    <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="12.5" fill="#F8F0E5" stroke="#E0D5C5" strokeWidth="0.8" />
      <circle cx="14" cy="14" r="9" fill="none" stroke="#E8C8A0" strokeWidth="0.6" opacity="0.7" />
      <path d="M14 10 Q17 11.5 16.5 14.5 Q15.5 17 13 17 Q11 16 12 14" stroke="#2F4C3A" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      <circle cx="14" cy="14" r="1" fill="#2F4C3A" />
    </svg>
  )
}

export default async function NilaSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('nila_onboarded, display_name, full_name')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.nila_onboarded) redirect('/nila/onboarding')

  const displayName = profile?.display_name ?? profile?.full_name?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'You'
  const initial = displayName[0]?.toUpperCase() ?? 'Y'

  const messages = await loadNilaSessionMessages(id)
  if (messages.length === 0) notFound()

  return (
    <div className="ns-shell">
      <Sidebar userName={displayName} userInitial={initial} />
      <main className="ns-main">
        <div className="ns-content">
          <div style={{ maxWidth: 620 }}>
            <div style={{ marginBottom: 24 }}>
              <Link href="/nila/history" style={{ fontSize: 12, color: 'var(--moss)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                ← Back to history
              </Link>
              <h1 style={{ fontSize: 20, fontWeight: 400, color: 'var(--deep-pine)', margin: 0, letterSpacing: '-0.01em' }}>
                Session — {new Date(messages[0].sentAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </h1>
              <p style={{ fontSize: 11, color: 'var(--moss)', opacity: 0.6, marginTop: 4 }}>Read-only · {messages.filter((m) => m.role === 'user').length} messages from you</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`ns-bubble ns-bubble--${m.role === 'nila' ? 'nila' : 'user'}`}
                  style={{ maxWidth: '72%', opacity: 0.9 }}
                >
                  <div className="ns-bubble__avatar">
                    {m.role === 'nila' ? (
                      <NilaBubbleAvatar />
                    ) : (
                      <div className="ns-bubble__user-avatar" aria-hidden="true">{initial}</div>
                    )}
                  </div>
                  <div className="ns-bubble__col">
                    <div className="ns-bubble__body">{m.content}</div>
                    <div className="ns-bubble__time">{formatTime(m.sentAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <BottomNav />
      </main>
    </div>
  )
}
