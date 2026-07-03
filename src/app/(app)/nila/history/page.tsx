import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { loadNilaHistory, softDeleteNilaConversation } from '@/actions/nila'
import { getConfig } from '@/lib/nila-config'
import BottomNav from '@/components/layout/BottomNav'

export const metadata = { title: 'Nila History — Nest' }

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDuration(startedAt: string, endedAt: string | null): string {
  if (!endedAt) return 'In progress'
  const ms = new Date(endedAt).getTime() - new Date(startedAt).getTime()
  const mins = Math.round(ms / 60000)
  if (mins < 1) return '< 1 min'
  return `${mins} min`
}

function daysUntilDeletion(startedAt: string, retentionDays: number): number {
  const deleteAt = new Date(startedAt).getTime() + retentionDays * 24 * 60 * 60 * 1000
  return Math.max(0, Math.ceil((deleteAt - Date.now()) / (24 * 60 * 60 * 1000)))
}

export default async function NilaHistoryPage() {
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

  const [history, retentionConfig] = await Promise.all([
    loadNilaHistory(),
    getConfig('nila.history_retention_days', '90'),
  ])

  const retentionDays = parseInt(retentionConfig, 10)

  return (
    <main className="ns-main">
        <div className="ns-content">
          <div style={{ maxWidth: 640 }}>
            <div style={{ marginBottom: 24 }}>
              <Link href="/nila" style={{ fontSize: 12, color: 'var(--moss)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                ← Back to Nila
              </Link>
              <h1 style={{ fontSize: 24, fontWeight: 400, color: 'var(--deep-pine)', margin: '0 0 6px', letterSpacing: '-0.01em' }}>Session history</h1>
              <p style={{ fontSize: 12, color: 'var(--moss)', opacity: 0.7, margin: 0, fontStyle: 'italic' }}>
                Your conversations are private and automatically deleted after {retentionDays} days.
              </p>
            </div>

            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--moss)', opacity: 0.6 }}>
                <p style={{ fontSize: 14 }}>No past sessions yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {history.map((item) => {
                  const daysLeft = daysUntilDeletion(item.startedAt, retentionDays)
                  return (
                    <div key={item.id} className="ns-card" style={{ padding: '16px 20px', flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, color: 'var(--moss)', opacity: 0.7, marginBottom: 4 }}>
                          {formatDate(item.startedAt)} · {formatDuration(item.startedAt, item.endedAt)} · {item.messageCount} messages
                        </div>
                        <div style={{ fontSize: 14, color: 'var(--deep-pine)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.firstUserMessage ?? 'No messages'}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--moss)', opacity: 0.55, marginTop: 4 }}>
                          Deletes in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <Link
                          href={`/nila/history/${item.id}`}
                          className="ns-btn ns-btn--ghost ns-btn--sm"
                          style={{ textDecoration: 'none' }}
                        >
                          View
                        </Link>
                        <form action={async () => {
                          'use server'
                          await softDeleteNilaConversation(item.id)
                          revalidatePath('/nila/history')
                        }}>
                          <button type="submit" className="ns-btn ns-btn--sm" style={{ background: 'transparent', border: '1px solid rgba(155,102,81,0.3)', color: 'var(--terracotta)' }}>
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
        <BottomNav />
      </main>
  )
}
