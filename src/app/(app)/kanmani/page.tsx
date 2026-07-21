import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import PublicPageHeader from '@/components/layout/PublicPageHeader'
import KanmaniReveal    from './_components/KanmaniReveal'
import KanmaniGive      from './_components/KanmaniGive'
import KanmaniStats     from './_components/KanmaniStats'
import KanmaniProofOfLife from './_components/KanmaniProofOfLife'
import './kanmani.css'

export const metadata: Metadata = {
  title: 'Kanmani — A Nest Social Fund',
  description:
    'Fund a therapy session for someone who couldn\'t afford one. ₹799 pays for one full hour with a real practitioner.',
  openGraph: {
    title:       'Kanmani — A Nest Social Fund',
    description: 'Fund a therapy session for someone who couldn\'t afford one. ₹799 pays for one full hour.',
  },
}

interface Stats {
  total_raised_inr: number
  sessions_funded:  number
}

interface Entry {
  id:         string
  entry_text: string
  detail?:    string | null
  created_at: string
}

export default async function KanmaniPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdminClient()
  const [statsRes, entriesRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from('kanmani_stats').select('total_raised_inr, sessions_funded').maybeSingle(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any)
      .from('kanmani_fund_entries')
      .select('id, entry_text, detail, created_at')
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const stats: Stats   = statsRes.data   ?? { total_raised_inr: 0, sessions_funded: 0 }
  const entries: Entry[] = entriesRes.data ?? []

  return (
    <div className="kf-page">
      {user ? (
        <nav className="kf-back-nav">
          <a href="/home" className="kf-back-link">
            ← Back to Nest
          </a>
        </nav>
      ) : (
        <PublicPageHeader />
      )}

      {/* Initialises IntersectionObserver for scroll-reveal — emits no DOM */}
      <KanmaniReveal />

      {/* Grain overlay */}
      <div className="kf-grain" aria-hidden="true" />

        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <section className="kf-section kf-section--dark kf-hero">
          <span className="kf-wordmark-label">A Nest Social Fund</span>
          <h1 className="kf-hero-name">Kanmani</h1>
          <p className="kf-hero-line">
            You know a Kanmani.<br />
            This one, you&apos;ll never meet.
          </p>

          <div className="kf-chair-wrap" aria-hidden="true">
            <svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="An empty chair with light falling on it">
              <polygon points="88,0 152,0 178,240 62,240" fill="#E8C8A0" opacity="0.12"/>
              <rect x="76"  y="118" width="8"  height="76" fill="#5C7A66"/>
              <rect x="116" y="118" width="8"  height="76" fill="#5C7A66"/>
              <rect x="70"  y="28"  width="60" height="92" rx="8" fill="#E8C8A0"/>
              <rect x="50"  y="118" width="100" height="16" rx="5" fill="#E8C8A0"/>
              <rect x="56"  y="134" width="9"  height="62" rx="2" fill="#E8C8A0"/>
              <rect x="135" y="134" width="9"  height="62" rx="2" fill="#E8C8A0"/>
            </svg>
          </div>

          <p className="kf-hero-sub">
            A fund that pays for the therapy session someone else couldn&apos;t.
          </p>
          <div className="kf-scroll-cue" aria-hidden="true" />
        </section>

        {/* ── WHO KANMANI IS ────────────────────────────────────────────── */}
        <section className="kf-section kf-section--dark">
          <span className="kf-eyebrow" data-kf-reveal>Who Kanmani Is</span>
          <div className="kf-narrative-inner">
            <p data-kf-reveal>
              Kanmani isn&apos;t one person. Kanmani isn&apos;t even one gender.
            </p>
            <p data-kf-reveal data-kf-delay="1">
              She&apos;s the one who says <em>&ldquo;I ate, I&apos;m fine&rdquo;</em> on the Sunday
              call home, and means none of it.
            </p>
            <p data-kf-reveal data-kf-delay="2">
              She&apos;s the one who runs the whole house and hasn&apos;t had four hundred
              rupees in years that were only hers to spend on herself.
            </p>
            <p data-kf-reveal data-kf-delay="3">
              She&apos;s four months into motherhood, and nobody&apos;s asked how she&apos;s
              really doing since the day everyone came to see the baby.
            </p>
            <p data-kf-reveal data-kf-delay="4">
              He&apos;s the one everyone calls when they&apos;re falling apart. Nobody&apos;s
              number is the one he&apos;d call.
            </p>
            <p data-kf-reveal data-kf-delay="5">
              Whoever it is, they had the booking page open last night, saw the price,
              and closed the tab telling themselves it wasn&apos;t serious enough to spend money on.
            </p>
            <p data-kf-reveal className="kf-narrative-turn">
              You&apos;ve probably met one of them. You might have been one of them.
            </p>
            <p data-kf-reveal className="kf-narrative-turn">
              But this fund isn&apos;t for the one you know. It&apos;s for the stranger
              sitting with that same tab open right now, with no one to notice and no one
              to pay for them.
            </p>
            <p data-kf-reveal className="kf-narrative-close">
              That&apos;s who your money is for.
            </p>
          </div>
        </section>

        {/* ── WHAT THIS FUND DOES ───────────────────────────────────────── */}
        <section className="kf-section kf-section--light">
          <span className="kf-eyebrow" data-kf-reveal>What This Fund Does</span>
          <div className="kf-divider" data-kf-reveal />
          <p className="kf-purpose-text" data-kf-reveal>
            This fund pays for therapy sessions for people who can&apos;t afford them.
            Every rupee goes to a session — not a feature, not overhead. You&apos;re not
            donating to an app. You&apos;re paying for the hour someone else couldn&apos;t.
          </p>
        </section>

        {/* ── GIVE — client component (amount selector + modal) ─────────── */}
        <KanmaniGive />

        {/* ── STATS — client component (live counter + realtime) ────────── */}
        <KanmaniStats initialStats={stats} />

        {/* ── PROOF OF LIFE ─────────────────────────────────────────────── */}
        <KanmaniProofOfLife entries={entries} />

        {/* ── TRUST ─────────────────────────────────────────────────────── */}
        <section className="kf-section kf-section--mid">
          <span className="kf-eyebrow" data-kf-reveal>How It Moves</span>
          <p className="kf-trust-text" data-kf-reveal>
            Every session funded through Kanmani is booked through The Nest
            Social&apos;s own Ally network. No black box between your donation and
            someone sitting across from a real practitioner.
          </p>
          <p className="kf-trust-reg" data-kf-reveal>
            Kanmani operates under The Nest Social. Trust registration in progress —
            details will appear here once complete.
          </p>
        </section>

        {/* ── CLOSE ─────────────────────────────────────────────────────── */}
        <section className="kf-section kf-section--dark kf-close-wrap">
          <div className="kf-close-inner">
            <div className="kf-close-illustration" data-kf-reveal aria-hidden="true">
              <svg viewBox="0 0 220 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A faceless silhouette approaching an empty chair">
                <rect x="130" y="128" width="8"  height="66" fill="#5C7A66"/>
                <rect x="168" y="128" width="8"  height="66" fill="#5C7A66"/>
                <rect x="112" y="140" width="94" height="15" rx="5" fill="#E8C8A0"/>
                <rect x="128" y="42"  width="56" height="98" rx="8" fill="#E8C8A0"/>
                <rect x="117" y="156" width="9"  height="46" rx="2" fill="#E8C8A0"/>
                <rect x="188" y="156" width="9"  height="46" rx="2" fill="#E8C8A0"/>
                <ellipse cx="42" cy="70" rx="16" ry="17" fill="#9B6651"/>
                <path d="M 26 92 Q 42 84 58 92 L 62 190 Q 42 200 22 190 Z" fill="#9B6651"/>
                <rect x="22" y="180" width="10" height="52" rx="4" fill="#9B6651"/>
                <rect x="48" y="180" width="10" height="52" rx="4" fill="#9B6651"/>
              </svg>
            </div>

            <div className="kf-close-right">
              <p className="kf-close-text" data-kf-reveal>
                You know a Kanmani.<br />
                This isn&apos;t for her.<br />
                It&apos;s for the one you don&apos;t know.
              </p>
              <a
                href="#give"
                className="kf-give-btn ns-btn ns-btn--primary"
                data-kf-reveal
              >
                Give now
              </a>
            </div>
          </div>
        </section>

        <footer className="kf-footer">
          KANMANI &middot; A NEST SOCIAL FUND &middot; CHENNAI
        </footer>
    </div>
  )
}
