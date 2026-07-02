import { redirect } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'

export const metadata = {
  title: 'My Sessions — Nest',
}

type SessionRow = {
  id: string
  status: string
  created_at: string
  zoho_booking_id: string | null
  allies: {
    id: string
    display_name: string | null
    primary_role: string | null
    photo_url: string | null
    tagline: string | null
    zoho_embed_url: string | null
  } | null
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  pending:   { label: 'Pending',   color: '#7A6040', bg: 'rgba(232,200,160,0.28)', dot: '#C8A070' },
  requested: { label: 'Requested', color: '#7A6040', bg: 'rgba(232,200,160,0.28)', dot: '#C8A070' },
  confirmed: { label: 'Confirmed', color: '#2F4C3A', bg: 'rgba(92,122,102,0.14)',  dot: '#5C7A66' },
  completed: { label: 'Completed', color: '#3A4F5C', bg: 'rgba(60,100,130,0.12)',  dot: '#5C88A0' },
  cancelled: { label: 'Cancelled', color: '#6B4040', bg: 'rgba(155,102,81,0.12)',  dot: '#9B6651' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function AllyAvatar({ name, photoUrl }: { name: string; photoUrl: string | null }) {
  const initials = name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div style={{
      width: 52, height: 52,
      borderRadius: '50%',
      flexShrink: 0,
      overflow: 'hidden',
      background: 'var(--deep-pine)',
      border: '2.5px solid rgba(248,240,229,0.9)',
      boxShadow: '0 3px 12px rgba(47,76,58,0.15)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.875rem', fontWeight: 600, color: 'var(--honey)',
      letterSpacing: '0.03em',
      position: 'relative',
    }}>
      {photoUrl
        ? <Image src={photoUrl} alt={name} fill sizes="52px" style={{ objectFit: 'cover' }} unoptimized />
        : initials}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'var(--moss)', bg: 'var(--pine-tint)', dot: 'var(--moss)' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: '0.6875rem', fontWeight: 500,
      letterSpacing: '0.04em',
      padding: '3px 10px 3px 8px',
      borderRadius: 'var(--r-pill)',
      color: cfg.color,
      background: cfg.bg,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  )
}

function SessionCard({ session, delay }: { session: SessionRow; delay: number }) {
  const ally = session.allies
  const allyName = ally?.display_name ?? 'Unknown Ally'
  const isUpcoming = ['pending', 'requested', 'confirmed'].includes(session.status)
  const isCompleted = session.status === 'completed'

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '18px 22px',
      background: 'var(--cream)',
      border: '1px solid rgba(224,213,197,0.8)',
      borderRadius: 'var(--r-lg)',
      animation: `nsFade 280ms ease both`,
      animationDelay: `${delay}ms`,
    }}>

      <AllyAvatar name={allyName} photoUrl={ally?.photo_url ?? null} />

      {/* Main info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 500, fontSize: '0.9375rem', color: 'var(--deep-pine)', lineHeight: 1.3 }}>
            {allyName}
          </span>
          <StatusBadge status={session.status} />
        </div>

        {ally?.primary_role && (
          <div style={{ fontSize: '0.8125rem', color: 'var(--moss)', marginBottom: 5 }}>
            {ally.primary_role}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--moss)', opacity: 0.55 }}>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M5 2V4M11 2V4M2 6.5H14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: '0.6875rem', letterSpacing: '0.02em' }}>
            {formatDate(session.created_at)}
          </span>
        </div>
      </div>

      {/* CTA */}
      {isUpcoming && (
        <a
          href={ally?.zoho_embed_url ?? '/allies'}
          target={ally?.zoho_embed_url ? '_blank' : undefined}
          rel={ally?.zoho_embed_url ? 'noopener noreferrer' : undefined}
          style={{
            flexShrink: 0,
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: '0.8125rem', fontWeight: 500,
            color: 'var(--deep-pine)',
            border: '1.5px solid var(--deep-pine)',
            borderRadius: 'var(--r-pill)',
            padding: '7px 16px',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            transition: 'background 150ms, color 150ms',
          }}
        >
          View booking
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 8h8M9 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      )}

      {isCompleted && (
        <a
          href={`/allies?highlight=${ally?.id ?? ''}`}
          style={{
            flexShrink: 0,
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: '0.8125rem', fontWeight: 500,
            color: 'var(--cream)',
            background: 'var(--terracotta)',
            borderRadius: 'var(--r-pill)',
            padding: '8px 16px',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          Book again
        </a>
      )}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <span style={{
        fontSize: '0.6875rem', fontWeight: 600,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: 'var(--moss)', opacity: 0.65,
      }}>
        {children}
      </span>
      <div style={{ flex: 1, height: 1, background: 'rgba(224,213,197,0.7)' }} />
    </div>
  )
}

function EmptyState({ message, sub, href, cta }: { message: string; sub?: string; href?: string; cta?: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '36px 24px',
      background: 'rgba(248,240,229,0.5)',
      border: '1px dashed rgba(224,213,197,0.9)',
      borderRadius: 'var(--r-lg)',
      textAlign: 'center',
      gap: 8,
    }}>
      <div style={{ fontSize: '0.875rem', color: 'var(--moss)', opacity: 0.7 }}>{message}</div>
      {sub && <div style={{ fontSize: '0.8125rem', color: 'var(--moss)', opacity: 0.45 }}>{sub}</div>}
      {href && cta && (
        <a href={href} style={{
          marginTop: 8,
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: '0.8125rem', fontWeight: 500,
          color: 'var(--deep-pine)',
          border: '1.5px solid var(--deep-pine)',
          borderRadius: 'var(--r-pill)',
          padding: '7px 18px',
          textDecoration: 'none',
        }}>
          {cta}
        </a>
      )}
    </div>
  )
}

export default async function SessionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, display_name')
    .eq('id', user.id)
    .maybeSingle()

  const firstName =
    profile?.display_name ??
    profile?.full_name?.split(' ')[0] ??
    user.email?.split('@')[0] ??
    'there'
  const initial = firstName[0]?.toUpperCase() ?? 'A'

  const admin = createAdminClient()
  const { data: rows } = await admin
    .from('sessions')
    .select(`
      id, status, created_at, zoho_booking_id,
      allies ( id, display_name, primary_role, photo_url, tagline, zoho_embed_url )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const UPCOMING = new Set(['pending', 'requested', 'confirmed'])
  const sessions = (rows ?? []) as unknown as SessionRow[]
  const upcoming = sessions.filter(r => UPCOMING.has(r.status))
  const past     = sessions.filter(r => !UPCOMING.has(r.status))
  const total    = sessions.length

  return (
    <div className="ns-shell">
      <Sidebar userName={firstName} userInitial={initial} />

      <main className="ns-main" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* Topbar */}
        <header style={{
          flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 40px',
          background: 'var(--cream)',
          borderBottom: '1px solid var(--honey-mute)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div className="fa-topbar-breadcrumb">your care</div>
            <h1 style={{ fontSize: '1.0625rem', fontWeight: 500, color: 'var(--deep-pine)', letterSpacing: '-0.01em', margin: 0 }}>
              My Sessions
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {total > 0 && (
              <span style={{
                fontSize: '0.75rem', fontWeight: 500,
                color: 'var(--moss)', opacity: 0.6,
                padding: '4px 12px',
                background: 'var(--pine-tint)',
                border: '1px solid rgba(92,122,102,0.18)',
                borderRadius: 'var(--r-pill)',
              }}>
                {total} {total === 1 ? 'session' : 'sessions'}
              </span>
            )}
            <a href="/allies" className="fa-user-chip" style={{ textDecoration: 'none' }} aria-label="Find an ally">
              <span style={{ fontSize: 13, color: 'var(--moss)', opacity: 0.8 }}>Find an ally</span>
              <div className="fa-avatar" aria-hidden="true">+</div>
            </a>
          </div>
        </header>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'clamp(24px,4vw,40px) clamp(24px,5vw,48px) 64px' }}>
          <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 40 }}>

            {/* Upcoming */}
            <section>
              <SectionLabel>Upcoming</SectionLabel>
              {upcoming.length === 0 ? (
                <EmptyState
                  message="No upcoming sessions"
                  sub="Book a session with an ally to get started."
                  href="/allies"
                  cta="Browse allies"
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {upcoming.map((s, i) => <SessionCard key={s.id} session={s} delay={i * 40} />)}
                </div>
              )}
            </section>

            {/* Past */}
            <section>
              <SectionLabel>Past Sessions</SectionLabel>
              {past.length === 0 ? (
                <EmptyState
                  message="No past sessions yet"
                  sub="Your session history will appear here."
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {past.map((s, i) => <SessionCard key={s.id} session={s} delay={i * 40} />)}
                </div>
              )}
            </section>

          </div>
        </div>

        <BottomNav />
      </main>
    </div>
  )
}
