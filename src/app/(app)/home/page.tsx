import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getFeatureFlags } from '@/lib/featureFlags'
import { getConfig, getPeriodStart } from '@/lib/nila-config'
import BottomNav from '@/components/layout/BottomNav'
import MobileProfileLink from '@/components/layout/MobileProfileLink'
import MoodSelector from './_components/MoodSelector'

export const metadata = {
  title: 'Home — Nest',
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MOOD_HEIGHT = [18, 36, 52, 72, 92]

// Mirrors the BRANCH_SPECIALTY map from /api/v1/allies/recommended/route.ts
const BRANCH_SPECIALTY: Record<string, string> = {
  anxiety:      'anxiety',
  loneliness:   'loneliness',
  'low-mood':   'depression',
  relationship: 'relationships',
  burnout:      'burnout',
  grief:        'grief',
}

// Fallbacks match DB defaults — actual values fetched from nest_config at runtime
const FREE_LIMIT_FALLBACK = 20
const PERIOD_FALLBACK = 'weekly'

function getGreeting() {
  // IST offset (+5:30 = 330 min) for India-centric greeting
  const nowIST = new Date(Date.now() + 330 * 60 * 1000)
  const hour = nowIST.getUTCHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function fmtRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1)  return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
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

  if (!user) redirect('/login')

  const admin = createAdminClient()

  const sixDaysAgo = (() => {
    const d = new Date(); d.setDate(d.getDate() - 6); return d.toISOString().slice(0, 10)
  })()

  // Fetch nila limit config alongside other data
  const [profileResult, moodResult, flags, nilaConvResult, sessionResult, limitStr, resetPeriod] = await Promise.all([
    // Extended profile select: includes plan, branch, avatar for personalization
    supabase
      .from('profiles')
      .select('full_name, display_name, plan, last_assessment_branch, avatar_url')
      .eq('id', user.id)
      .maybeSingle(),
    admin.from('mood_entries')
      .select('logged_date, mood_index')
      .eq('user_id', user.id)
      .gte('logged_date', sixDaysAgo)
      .order('logged_date', { ascending: true }),
    getFeatureFlags(),
    // Last Nila conversation (not deleted)
    admin.from('nila_conversations')
      .select('id, updated_at, last_mode')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    // Next upcoming session with ally details
    admin.from('sessions')
      .select('id, status, created_at, zoho_booking_id, allies(id, display_name, full_name, primary_role, photo_url, zoho_embed_url)')
      .eq('user_id', user.id)
      .in('status', ['requested', 'confirmed'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    // Real limit & period from nest_config (same keys the Nila route uses)
    getConfig('nila.free_daily_message_limit', String(FREE_LIMIT_FALLBACK)),
    getConfig('nila.limit_reset_period', PERIOD_FALLBACK),
  ])

  const freeLimit = parseInt(limitStr, 10) || FREE_LIMIT_FALLBACK
  const periodStart = getPeriodStart(resetPeriod)
  const periodLabel = resetPeriod === 'weekly' ? 'this week' : 'today'

  // Count messages for the current period (same window the Nila route enforces)
  const { count: nilaPeriodCount } = await admin
    .from('nila_messages')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('role', 'user')
    .gte('sent_at', periodStart.toISOString())
    .is('deleted_at', null)

  const profile = profileResult.data
  const moodEntries = (moodResult.data ?? []) as { logged_date: string; mood_index: number }[]

  const today = new Date().toISOString().slice(0, 10)
  const todayEntry = moodEntries.find(e => e.logged_date === today)
  const weekBars = buildWeekBars(moodEntries)
  const loggedCount = weekBars.filter(b => b.logged).length

  const firstName = profile?.display_name ?? profile?.full_name?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'there'
  const initial = firstName[0]?.toUpperCase() ?? 'A'
  const greeting = getGreeting()
  const userPlan = profile?.plan ?? 'free'
  const avatarUrl = profile?.avatar_url ?? null
  const nilaPeriodUsed = nilaPeriodCount ?? 0

  // Nila: fetch last user message from the most recent conversation for the quote
  const nilaConv = nilaConvResult.data
  let nilaLastQuote: string | null = null
  let nilaLastTime: string | null = null
  if (nilaConv) {
    const { data: lastMsg } = await admin
      .from('nila_messages')
      .select('content, sent_at')
      .eq('conversation_id', nilaConv.id)
      .eq('role', 'user')
      .is('deleted_at', null)
      .order('sent_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (lastMsg) {
      nilaLastQuote = lastMsg.content.length > 80
        ? lastMsg.content.slice(0, 80).trimEnd() + '…'
        : lastMsg.content
      nilaLastTime = lastMsg.sent_at
    }
  }

  const showNilaUsage = userPlan === 'free'
  const nilaAtLimit = nilaPeriodUsed >= freeLimit

  // Session: extract ally from joined result
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nextSession = sessionResult.data as any
  const nextAlly = nextSession
    ? (Array.isArray(nextSession.allies) ? nextSession.allies[0] : nextSession.allies)
    : null
  const nextAllyName = nextAlly?.display_name ?? nextAlly?.full_name ?? null

  // Ally recommendation: only when user has no upcoming session AND has an assessment branch
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let recommendedAlly: any = null
  if (!nextSession && profile?.last_assessment_branch) {
    const specialty = BRANCH_SPECIALTY[profile.last_assessment_branch]
    if (specialty) {
      const { data: recAlly } = await admin
        .from('allies')
        .select('id, display_name, full_name, primary_role, tagline, quote, photo_url, specialties, zoho_embed_url')
        .eq('is_active', true)
        .eq('onboarding_status', 'active')
        .eq('visibility_search', true)
        .is('deleted_at', null)
        .contains('specialties', [specialty])
        .order('manual_priority_score', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (recAlly) recommendedAlly = recAlly
    }

    // If no specialty match, backfill with any top active ally
    if (!recommendedAlly) {
      const { data: backfill } = await admin
        .from('allies')
        .select('id, display_name, full_name, primary_role, tagline, quote, photo_url, specialties, zoho_embed_url')
        .eq('is_active', true)
        .eq('onboarding_status', 'active')
        .eq('visibility_search', true)
        .is('deleted_at', null)
        .order('manual_priority_score', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (backfill) recommendedAlly = backfill
    }
  }

  return (
    <div className="ns-main">
        {/* Top bar */}
        <header className="ns-topbar">
          <div className="ns-topbar__left">
            <div className="ns-topbar__greeting">
              {greeting}, {firstName}.
            </div>
            <div className="ns-topbar__sub">How are you holding up?</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
                <div className="ns-card__eyebrow">
                  {nilaConv ? 'Continue where you left off' : 'Your space to talk'}
                </div>
                <div className="ns-continue">
                  <NilaAvatar />
                  <div className="ns-continue__body">
                    <h3 className="ns-card__title" style={{ marginBottom: 4 }}>
                      Chat with Nila
                    </h3>
                    {nilaLastQuote && nilaLastTime ? (
                      <p className="ns-continue__last">
                        <span className="ns-continue__quote">
                          &ldquo;{nilaLastQuote}&rdquo;
                        </span>
                        <span className="ns-continue__time">
                          {fmtRelativeTime(nilaLastTime)}
                        </span>
                      </p>
                    ) : (
                      <p className="ns-continue__last">
                        <span className="ns-continue__quote" style={{ fontStyle: 'normal', opacity: 0.6 }}>
                          Nila is here whenever you&rsquo;re ready.
                        </span>
                      </p>
                    )}

                    {/* Usage bar — free plan only, uses real limit + period from nest_config */}
                    {showNilaUsage && (
                      <div style={{ marginTop: 10 }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          marginBottom: 4, fontSize: 11, color: nilaAtLimit ? 'var(--terracotta)' : 'var(--moss)',
                          opacity: 0.8,
                        }}>
                          <span>
                            {nilaAtLimit
                              ? `${resetPeriod === 'weekly' ? 'Weekly' : 'Daily'} limit reached`
                              : `Messages ${periodLabel}`}
                          </span>
                          <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {nilaPeriodUsed} / {freeLimit}
                          </span>
                        </div>
                        <div style={{
                          height: 4, borderRadius: 4,
                          background: 'rgba(92,122,102,0.18)',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${Math.min((nilaPeriodUsed / freeLimit) * 100, 100)}%`,
                            borderRadius: 4,
                            background: nilaAtLimit
                              ? 'var(--terracotta)'
                              : nilaPeriodUsed >= freeLimit - 4
                              ? '#C47A2A'
                              : 'var(--moss)',
                            transition: 'width 400ms ease',
                          }} />
                        </div>
                        {nilaAtLimit && (
                          <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--terracotta)', opacity: 0.8 }}>
                            Resets {resetPeriod === 'weekly' ? 'next Monday' : 'at midnight'} ·{' '}
                            <a href="/plans" style={{ color: 'inherit', textDecoration: 'underline' }}>
                              Upgrade for unlimited
                            </a>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <a
                    href="/nila"
                    className="ns-btn ns-btn--primary"
                    style={nilaAtLimit ? { opacity: 0.5, pointerEvents: 'none' } : {}}
                    aria-disabled={nilaAtLimit}
                  >
                    {nilaConv ? 'Resume' : 'Start'} <ArrowIcon />
                  </a>
                </div>
              </article>

              {/* Ally session / recommendation */}
              <article className="ns-card">
                {nextSession && nextAllyName ? (
                  /* ── Has upcoming session ── */
                  <>
                    <div className="ns-card__eyebrow">Your next Ally session</div>
                    <div className="ns-session">
                      <AllyAvatar name={nextAllyName} photoUrl={nextAlly?.photo_url ?? null} />
                      <div className="ns-session__body">
                        <h3 className="ns-card__title" style={{ marginBottom: 4 }}>
                          {nextAllyName}
                        </h3>
                        {nextAlly?.primary_role && (
                          <div className="ns-session__meta">{nextAlly.primary_role}</div>
                        )}
                        <div className="ns-session__reminder">
                          {nextSession.status === 'confirmed' ? 'Confirmed' : 'Requested'} · {fmtDate(nextSession.created_at)}
                        </div>
                      </div>
                      <a
                        href={nextAlly?.zoho_embed_url ?? '/sessions'}
                        target={nextAlly?.zoho_embed_url ? '_blank' : undefined}
                        rel={nextAlly?.zoho_embed_url ? 'noopener noreferrer' : undefined}
                        className="ns-btn ns-btn--secondary"
                      >
                        View
                      </a>
                    </div>
                  </>
                ) : recommendedAlly ? (
                  /* ── No session but we have a recommendation from their assessment ── */
                  <>
                    <div className="ns-card__eyebrow">Recommended for you</div>
                    <div className="ns-session">
                      <AllyAvatar
                        name={recommendedAlly.display_name ?? recommendedAlly.full_name ?? 'Ally'}
                        photoUrl={recommendedAlly.photo_url ?? null}
                      />
                      <div className="ns-session__body">
                        <h3 className="ns-card__title" style={{ marginBottom: 4 }}>
                          {recommendedAlly.display_name ?? recommendedAlly.full_name}
                        </h3>
                        {recommendedAlly.primary_role && (
                          <div className="ns-session__meta">{recommendedAlly.primary_role}</div>
                        )}
                        {(recommendedAlly.tagline || recommendedAlly.quote) && (
                          <div className="ns-session__reminder" style={{ fontStyle: 'italic', opacity: 0.75 }}>
                            &ldquo;{(recommendedAlly.tagline ?? recommendedAlly.quote ?? '').slice(0, 60)}&rdquo;
                          </div>
                        )}
                      </div>
                      <a
                        href={recommendedAlly.zoho_embed_url ?? '/allies'}
                        target={recommendedAlly.zoho_embed_url ? '_blank' : undefined}
                        rel={recommendedAlly.zoho_embed_url ? 'noopener noreferrer' : undefined}
                        className="ns-btn ns-btn--secondary"
                      >
                        Book <ArrowIcon />
                      </a>
                    </div>
                  </>
                ) : (
                  /* ── No session, no recommendation (no assessment yet) ── */
                  <>
                    <div className="ns-card__eyebrow">Your next Ally session</div>
                    <div className="ns-session" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--moss)', opacity: 0.7, lineHeight: 1.5 }}>
                        Connect with a professional listener when you&rsquo;re ready.
                      </p>
                      <a href="/allies" className="ns-btn ns-btn--secondary">
                        Find an ally <ArrowIcon />
                      </a>
                    </div>
                  </>
                )}
              </article>

              {/* Saved resources — only when resources feature is enabled */}
              {/* TODO: replace with real resources from DB when content is ready */}
              {flags.resources && (
                <article className="ns-card">
                  <div className="ns-card__head">
                    <div className="ns-card__eyebrow">Resources</div>
                    <a href="/resources" className="ns-link ns-link--quiet">See all</a>
                  </div>
                  <div style={{
                    padding: '20px 0', textAlign: 'center',
                    color: 'var(--moss)', opacity: 0.55, fontSize: 13,
                  }}>
                    We&rsquo;re curating resources for you — check back soon.
                  </div>
                </article>
              )}
            </div>

            {/* RIGHT column */}
            <div className="ns-dash-col ns-dash-col--narrow">
              {/* Upcoming event — only when events feature is enabled */}
              {/* TODO: replace with real events from DB when content is ready */}
              {flags.events && (
                <article className="ns-card">
                  <div className="ns-card__eyebrow">Upcoming events</div>
                  <div style={{
                    padding: '24px 0', textAlign: 'center',
                    color: 'var(--moss)', opacity: 0.55, fontSize: 13,
                  }}>
                    No events scheduled yet.{' '}
                    <a href="/events" style={{ color: 'inherit', textDecoration: 'underline' }}>
                      Browse events
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

function AllyAvatar({ name, photoUrl }: { name: string; photoUrl?: string | null }) {
  const ini = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  if (photoUrl) {
    return (
      <div className="ns-ally-avatar" style={{ width: 44, height: 44, overflow: 'hidden', padding: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photoUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
      </div>
    )
  }
  return (
    <div className="ns-ally-avatar" style={{ width: 44, height: 44 }}>
      <span>{ini}</span>
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

// Unused but kept for future notification feature
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _BellIconUnused() { return <BellIcon /> }
