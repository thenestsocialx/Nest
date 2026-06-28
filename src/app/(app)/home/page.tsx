import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getFeatureFlags } from '@/lib/featureFlags'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import MobileProfileLink from '@/components/layout/MobileProfileLink'
import MoodSelector from './_components/MoodSelector'

export const metadata = {
  title: 'Home — Nest',
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
// Maps mood_index 0-4 to bar height %
const MOOD_HEIGHT = [18, 36, 52, 72, 92]

function getGreeting() {
  const hour = new Date().getUTCHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function buildWeekBars(entries: { logged_date: string; mood_index: number }[]) {
  const today = new Date()
  const bars = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const entry = entries.find(e => e.logged_date === dateStr)
    bars.push({
      day: DAY_LABELS[d.getDay()],
      h: entry ? MOOD_HEIGHT[entry.mood_index] : 0,
      logged: !!entry,
      hi: entry ? entry.mood_index >= 3 : false,
    })
  }
  return bars
}

function moodCaption(bars: ReturnType<typeof buildWeekBars>): string {
  const logged = bars.filter(b => b.logged)
  if (logged.length === 0) return 'No mood entries this week yet.'
  const settled = logged.filter(b => b.hi).length
  if (settled >= 4) return 'A strong week — mostly settled and okay.'
  if (settled >= 2) return `${settled} settled ${settled === 1 ? 'day' : 'days'} this week. That's something.`
  if (logged.length <= 2) return 'Just getting started — keep checking in.'
  return 'Some harder days in there. You showed up anyway.'
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const admin = createAdminClient()

  const [profileResult, moodResult, flags] = await Promise.all([
    supabase.from('profiles').select('full_name, display_name').eq('id', user.id).maybeSingle(),
    admin.from('mood_entries')
      .select('logged_date, mood_index')
      .eq('user_id', user.id)
      .gte('logged_date', (() => { const d = new Date(); d.setDate(d.getDate() - 6); return d.toISOString().slice(0, 10) })())
      .order('logged_date', { ascending: true }),
    getFeatureFlags(),
  ])

  const profile = profileResult.data
  const moodEntries = (moodResult.data ?? []) as { logged_date: string; mood_index: number }[]

  const today = new Date().toISOString().slice(0, 10)
  const todayEntry = moodEntries.find(e => e.logged_date === today)
  const weekBars = buildWeekBars(moodEntries)
  const loggedCount = weekBars.filter(b => b.logged).length

  const firstName = profile?.display_name ?? profile?.full_name?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'there'
  const initial = firstName[0]?.toUpperCase() ?? 'A'
  const greeting = getGreeting()

  return (
    <div className="ns-shell">
      <Sidebar userName={firstName} userInitial={initial} />

      <div className="ns-main">
        {/* Top bar */}
        <header className="ns-topbar ns-topbar--auth">
          <div className="ns-topbar__left">
            <div className="ns-topbar__greeting">
              {greeting}, {firstName}.
            </div>
            <div className="ns-topbar__sub">How are you holding up?</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="ns-bell" aria-label="Notifications">
              <BellIcon />
              <span className="ns-bell__dot" aria-hidden="true" />
            </button>
            <MobileProfileLink initial={initial} />
          </div>
        </header>

        {/* Ambient morning strip */}
        <div className="ns-ambient-wrap ns-ambient-wrap--morning" aria-hidden="true">
          <AmbientPath />
        </div>

        {/* Content */}
        <div className="ns-content">
          <MoodSelector initialMood={todayEntry?.mood_index ?? null} />

          <div className="ns-dash-grid">
            {/* LEFT column */}
            <div className="ns-dash-col">
              {/* Continue with Nila */}
              <article className="ns-card ns-card--accent">
                <div className="ns-card__eyebrow">Continue where you left off</div>
                <div className="ns-continue">
                  <NilaAvatar />
                  <div className="ns-continue__body">
                    <h3 className="ns-card__title" style={{ marginBottom: 4 }}>
                      Chat with Nila
                    </h3>
                    <p className="ns-continue__last">
                      <span className="ns-continue__quote">
                        &ldquo;I&rsquo;ve been feeling really alone lately&hellip;&rdquo;
                      </span>
                      <span className="ns-continue__time">2 hours ago</span>
                    </p>
                  </div>
                  <a href="/nila" className="ns-btn ns-btn--primary">
                    Resume <ArrowIcon />
                  </a>
                </div>
              </article>

              {/* Next Ally session */}
              <article className="ns-card">
                <div className="ns-card__eyebrow">Your next Ally session</div>
                <div className="ns-session">
                  <AllyAvatar />
                  <div className="ns-session__body">
                    <h3 className="ns-card__title" style={{ marginBottom: 4 }}>
                      Priya Nair
                    </h3>
                    <div className="ns-session__meta">
                      Monday, 22 July · 4:00 PM · Video call
                    </div>
                    <div className="ns-session__reminder">
                      Reminder set · day before, and one hour ahead
                    </div>
                  </div>
                  <button className="ns-btn ns-btn--secondary">Join</button>
                </div>
              </article>

              {/* Saved resources — only when resources feature is enabled */}
              {flags.resources && (
                <article className="ns-card">
                  <div className="ns-card__head">
                    <div className="ns-card__eyebrow">Saved resources</div>
                    <a href="/resources" className="ns-link ns-link--quiet">
                      See all
                    </a>
                  </div>
                  <ul className="ns-saved">
                    <li className="ns-saved__item">
                      <span className="ns-tag ns-tag--outline">Article</span>
                      <div className="ns-saved__title">
                        Why feeling lonely in a crowd is real
                      </div>
                      <span className="ns-saved__meta">4 min read</span>
                    </li>
                    <li className="ns-saved__item">
                      <span className="ns-tag ns-tag--outline">Playlist</span>
                      <div className="ns-saved__title">
                        For nights when quiet feels too loud
                      </div>
                      <span className="ns-saved__meta">54 min</span>
                    </li>
                    <li className="ns-saved__item">
                      <span className="ns-tag ns-tag--outline">Guide</span>
                      <div className="ns-saved__title">
                        Talking to someone you trust — how to start
                      </div>
                      <span className="ns-saved__meta">8 min read</span>
                    </li>
                  </ul>
                </article>
              )}
            </div>

            {/* RIGHT column */}
            <div className="ns-dash-col ns-dash-col--narrow">
              {/* Upcoming event — only when events feature is enabled */}
              {flags.events && (
                <article className="ns-card ns-event">
                  <div className="ns-event__poster" aria-hidden="true">
                    <EventPosterSVG />
                  </div>
                  <div className="ns-event__body">
                    <div className="ns-event__date">SAT 26 JULY · 6:00 PM</div>
                    <h3 className="ns-card__title">Sunday Circle</h3>
                    <div className="ns-event__loc">
                      Indiranagar, Bangalore · 8 spots left
                    </div>
                    <a
                      href="/events"
                      className="ns-btn ns-btn--ghost ns-btn--full"
                      style={{ marginTop: 16 }}
                    >
                      View details
                    </a>
                  </div>
                </article>
              )}

              {/* Mood trend */}
              <article className="ns-card">
                <div className="ns-card__head">
                  <div className="ns-card__eyebrow">This week</div>
                  <div className="ns-trend__note">{loggedCount} of 7 days</div>
                </div>
                <div className="ns-trend">
                  {weekBars.map((b, i) => (
                    <div key={i} className="ns-trend__col">
                      <div className="ns-trend__track">
                        <div
                          className={`ns-trend__bar${b.hi ? ' is-hi' : ''}${!b.logged ? ' is-empty' : ''}`}
                          style={{ height: b.logged ? `${b.h}%` : '8%' }}
                        />
                      </div>
                      <div className="ns-trend__day">{b.day}</div>
                    </div>
                  ))}
                </div>
                <p className="ns-trend__caption">
                  <em>{moodCaption(weekBars)}</em>
                </p>
              </article>
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
    </div>
  )
}

/* ── Inline SVG components ── */

function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3.5 11 Q3.5 7 4.5 5.5 Q5.5 4 8 4 Q10.5 4 11.5 5.5 Q12.5 7 12.5 11 H3.5 Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M3.5 11 H 12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M6.5 12.5 Q6.5 13.5 8 13.5 Q9.5 13.5 9.5 12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <path d="M8 4 V3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 7 H 11 M8 4 L 11 7 L 8 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function NilaAvatar() {
  return (
    <svg width="48" height="48" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="#F8F0E5" stroke="#E0D5C5" strokeWidth="1" />
      <circle cx="20" cy="20" r="13" fill="none" stroke="#E8C8A0" strokeWidth="0.7" opacity="0.7" />
      <path d="M20 14 Q24 16 23.5 20 Q22 23 18.5 23 Q16 22 17 19" stroke="#2F4C3A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <circle cx="20" cy="20" r="1.4" fill="#2F4C3A" />
    </svg>
  )
}

function AllyAvatar() {
  return (
    <div className="ns-ally-avatar" style={{ width: 44, height: 44 }}>
      <span>PN</span>
    </div>
  )
}

function AmbientPath() {
  return (
    <svg className="ns-ambient" viewBox="0 0 1100 80" preserveAspectRatio="none" aria-hidden="true">
      <ellipse cx="600" cy="80" rx="500" ry="50" fill="#E8C8A0" opacity="0.18" />
      <path d="M460 78 Q540 60 600 50 Q660 60 740 78" stroke="#9B6651" strokeWidth="0.6" fill="none" opacity="0.5" />
      <path d="M440 80 Q540 56 600 46 Q660 56 760 80 L 760 80 L 440 80 Z" fill="#9B6651" opacity="0.08" />
      {[80, 160, 260, 360].map((x, i) => (
        <g key={`l${i}`} opacity={0.25 + i * 0.06}>
          <path
            d={`M${x} 80 L ${x} ${55 - i * 3} Q ${x - 10} ${55 - i * 3} ${x - 12} ${65 - i * 3} Q ${x - 6} ${70 - i * 3} ${x} ${68 - i * 3} Q ${x + 6} ${70 - i * 3} ${x + 12} ${65 - i * 3} Q ${x + 10} ${55 - i * 3} ${x} ${55 - i * 3} Z`}
            fill="#2F4C3A"
          />
        </g>
      ))}
      {[1020, 940, 840, 740].map((x, i) => (
        <g key={`r${i}`} opacity={0.25 + i * 0.06}>
          <path
            d={`M${x} 80 L ${x} ${55 - i * 3} Q ${x - 10} ${55 - i * 3} ${x - 12} ${65 - i * 3} Q ${x - 6} ${70 - i * 3} ${x} ${68 - i * 3} Q ${x + 6} ${70 - i * 3} ${x + 12} ${65 - i * 3} Q ${x + 10} ${55 - i * 3} ${x} ${55 - i * 3} Z`}
            fill="#2F4C3A"
          />
        </g>
      ))}
      <circle cx="500" cy="32" r="1" fill="#E8C8A0" opacity="0.6" />
      <circle cx="680" cy="22" r="1" fill="#E8C8A0" opacity="0.5" />
      <circle cx="780" cy="34" r="1" fill="#E8C8A0" opacity="0.4" />
    </svg>
  )
}

function EventPosterSVG() {
  return (
    <svg viewBox="0 0 280 140" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
      <rect width="280" height="140" fill="#9B6651" opacity="0.18" />
      <ellipse cx="140" cy="120" rx="120" ry="20" fill="#E8C8A0" opacity="0.4" />
      <g fill="#2F4C3A">
        <circle cx="60"  cy="78" r="9" />
        <path d="M50 92 Q50 110 60 114 Q70 110 70 92 Z" />
      </g>
      <g fill="#5C7A66">
        <circle cx="100" cy="70" r="9" />
        <path d="M90 84 Q90 108 100 112 Q110 108 110 84 Z" />
      </g>
      <g fill="#2F4C3A">
        <circle cx="140" cy="68" r="9" />
        <path d="M130 82 Q130 108 140 112 Q150 108 150 82 Z" />
      </g>
      <g fill="#5C7A66">
        <circle cx="180" cy="70" r="9" />
        <path d="M170 84 Q170 108 180 112 Q190 108 190 84 Z" />
      </g>
      <g fill="#2F4C3A">
        <circle cx="220" cy="78" r="9" />
        <path d="M210 92 Q210 110 220 114 Q230 110 230 92 Z" />
      </g>
      <circle cx="50"  cy="28" r="1.6" fill="#E8C8A0" />
      <circle cx="140" cy="22" r="1.4" fill="#E8C8A0" />
      <circle cx="220" cy="32" r="1.6" fill="#E8C8A0" />
    </svg>
  )
}
