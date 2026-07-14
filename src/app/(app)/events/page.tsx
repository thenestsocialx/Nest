import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/layout/BottomNav'
import MobileProfileLink from '@/components/layout/MobileProfileLink'
import PublicPageHeader from '@/components/layout/PublicPageHeader'
import NotifyForm from './_components/NotifyForm'

export const metadata = {
  title: 'Events — Nest',
  description: 'Workshops, listening circles, and community events hosted by Nest allies. Small groups. Real conversations. Open to everyone.',
  openGraph: {
    title: 'Events — Nest',
    description: 'Workshops, listening circles, and community events hosted by Nest allies. Small groups. Real conversations. Open to everyone.',
  },
}

/* ── Inline SVG icons ── */

function CalendarIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="8"  cy="14" r="1" fill="currentColor"/>
      <circle cx="12" cy="14" r="1" fill="currentColor"/>
      <circle cx="16" cy="14" r="1" fill="currentColor"/>
    </svg>
  )
}

function GroupIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9"  cy="8"  r="3.5" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="17" cy="9"  r="2.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M2 20c0-3.31 3.13-6 7-6s7 2.69 7 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M17 14c2.21 0 4 1.79 4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

function EaseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9Z" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M9 12.5c.5.8 1.7 1.5 3 1.5s2.5-.7 3-1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="9.5"  cy="9.5" r="1" fill="currentColor"/>
      <circle cx="14.5" cy="9.5" r="1" fill="currentColor"/>
    </svg>
  )
}

function MapIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  )
}

const VIBES = [
  {
    title: 'Small groups. Real conversations.',
    body:  'Six to eight people. Enough to feel held, few enough to be heard.',
    icon:  <GroupIcon />,
  },
  {
    title: 'No icebreakers. No pressure.',
    body:  "Show up, settle in. There's no agenda — just presence.",
    icon:  <EaseIcon />,
  },
  {
    title: 'Cities near you, soon.',
    body:  "We're starting in a few places and growing from there.",
    icon:  <MapIcon />,
  },
]

export default async function EventsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let initial = 'A'
  if (user) {
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
    initial = firstName[0]?.toUpperCase() ?? 'A'
  }

  return (
    <main className="ns-main">
      {user ? (
        <header className="ns-topbar">
          <div className="ns-topbar__left">
            <div className="ns-topbar__greeting">Events</div>
            <div className="ns-topbar__sub">Spaces to feel less alone, together</div>
          </div>
          <MobileProfileLink initial={initial} />
        </header>
      ) : (
        <PublicPageHeader />
      )}

      <div className="ns-content" style={{ paddingTop: 40 }}>
        <div style={{ maxWidth: '48rem', width: '100%', margin: '0 auto' }}>

          {/* Upcoming events */}
          <section aria-label="Upcoming events" style={{ marginBottom: 48 }}>
            <div className="ns-section-label" style={{ marginBottom: 20 }}>Upcoming</div>

            <div className="ns-evt-empty" style={{ maxWidth: '42rem', margin: '0 auto', width: '100%' }}>
              <div
                style={{
                  width:           72,
                  height:          72,
                  borderRadius:    '50%',
                  background:      'var(--pine-tint)',
                  border:          '1px solid rgba(92,122,102,0.25)',
                  display:         'flex',
                  alignItems:      'center',
                  justifyContent:  'center',
                  color:           'var(--moss)',
                  marginBottom:    4,
                }}
                aria-hidden="true"
              >
                <CalendarIcon />
              </div>

              <div>
                <h2
                  style={{
                    fontSize:   18,
                    fontWeight: 500,
                    color:      'var(--deep-pine)',
                    margin:     '0 0 10px',
                    lineHeight: 1.35,
                  }}
                >
                  No events scheduled yet.
                </h2>
                <p
                  style={{
                    fontSize:   14,
                    color:      'var(--moss)',
                    margin:     0,
                    fontStyle:  'italic',
                    lineHeight: 1.65,
                    maxWidth:   '38ch',
                  }}
                >
                  We&rsquo;re planning something special. Stay close.
                </p>
              </div>

              <div style={{ marginTop: 8, width: '100%' }}>
                <p
                  style={{
                    fontSize:      12,
                    color:         'var(--moss)',
                    margin:        '0 0 14px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    opacity:       0.8,
                  }}
                >
                  Get notified when we announce
                </p>
                <NotifyForm />
              </div>
            </div>
          </section>

          {/* What to expect */}
          <section aria-label="What to expect at Nest events">
            <div className="ns-section-label" style={{ marginBottom: 20 }}>What to expect</div>
            <div className="ns-evt-vibes-grid">
              {VIBES.map((vibe, i) => (
                <article key={i} className="ns-card ns-evt-vibe-card">
                  <div className="ns-evt-vibe-icon" aria-hidden="true">
                    {vibe.icon}
                  </div>
                  <div className="ns-evt-vibe-text">
                    <h3 className="ns-card__title" style={{ fontSize: 14, marginBottom: 6 }}>
                      {vibe.title}
                    </h3>
                    <p className="ns-card__body" style={{ fontSize: 13, margin: 0 }}>
                      {vibe.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

        </div>
      </div>

      {user && <BottomNav />}
    </main>
  )
}
