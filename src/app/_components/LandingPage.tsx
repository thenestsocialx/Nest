'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import styles from '../landing.module.css'
import { IS_WAITLIST } from '@/lib/config'
import { WaitlistModal } from '@/components/WaitlistModal'
import PublicHeader from '@/components/layout/PublicHeader'
import LandingHelpline from '@/components/layout/LandingHelpline'
import LandingFooter from '@/components/layout/LandingFooter'

interface Props {
  isAuthenticated: boolean
}

// The Nest playlist ("Dead Poets Society"). Replace with the real Spotify link.
const SPOTIFY_PLAYLIST_URL = 'https://open.spotify.com/playlist/4fdJZ6aY1uFZpEIuzyGoOa'

const FAMILIAR = [
  {
    now: '"It\'s 2am and my thoughts won\'t stop. I can\'t call anyone. I don\'t want to be a burden."',
    with: 'Nila, at 3am. No judgment. No questions you\'re not ready for. Just there.',
  },
  {
    now: '"The breakup wrecked me more than I expected. I keep replaying it. I don\'t know who I am without them."',
    with: 'Slowly finding your footing. Beginning to trust your own choices again.',
  },
  {
    now: '"I have people around me but I\'ve never felt more alone. I can\'t explain it without sounding ungrateful."',
    with: 'People who actually get it, without you having to explain yourself first.',
  },
  {
    now: '"I\'m fine on paper. Good job, good life. But something feels off and I can\'t even name what it is."',
    with: 'A space to finally sit with it, and start making sense of what\'s actually going on.',
  },
]

const PLAYLIST_MOODS = ['For 2am', 'For the Drive Home', 'For a Slow Sunday']

const FAQS = [
  {
    q: 'Is this therapy?',
    a: 'Not in the clinical sense. The Nest Social is a place to talk and feel less alone. Our allies include licensed psychologists and counsellors, and you never need a diagnosis to start.',
  },
  {
    q: 'Do I need to sign up to start?',
    a: 'No. You can start with a few gentle questions without an account. You only sign up when you want to book an ally or keep talking with Nila.',
  },
  {
    q: 'How are allies chosen?',
    a: 'Every ally applies and is reviewed by our team before anyone can book them. We look at their training, their experience and how they work with people.',
  },
  {
    q: 'Is what I share private?',
    a: 'Yes. Conversations are encrypted and only you and your ally can read them. We never sell your data, and you can delete your account and all your data anytime.',
  },
  {
    q: 'What does it cost?',
    a: 'You can start for free. The Moonlit plan is Rs. 99, and each ally sets their own session price. You can compare everything on our plans page.',
  },
]

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function LandingPage({ isAuthenticated }: Props) {
  // ── Waitlist modal ──
  const [waitlistOpen, setWaitlistOpen] = useState(false)

  // ── Breathe state ──
  const [breathPhase, setBreathPhase] = useState<'idle' | 'in' | 'out'>('idle')
  const [breathing, setBreathing] = useState(false)
  const [breathLines, setBreathLines] = useState(['tap to', 'begin'])
  const [breathTextVisible, setBreathTextVisible] = useState(true)
  const breathActiveRef = useRef(false)
  const breathTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cycleRef = useRef<() => void>(() => {})

  // ── Scroll reveal ──
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-animate]')
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible')
            obs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.1 }
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  // ── Breathing ──
  const changeText = useCallback((lines: string[]) => {
    setBreathTextVisible(false)
    setTimeout(() => { setBreathLines(lines); setBreathTextVisible(true) }, 450)
  }, [])

  const cycle = useCallback(() => {
    if (!breathActiveRef.current) return
    setBreathPhase('in')
    changeText(['breathe', 'in…'])
    breathTimerRef.current = setTimeout(() => {
      if (!breathActiveRef.current) return
      setBreathPhase('out')
      changeText(['breathe', 'out…'])
      breathTimerRef.current = setTimeout(() => {
        if (!breathActiveRef.current) return
        cycleRef.current() // next breath (via ref: a callback can't call itself before it exists)
      }, 6400)
    }, 4400)
  }, [changeText])
  useEffect(() => { cycleRef.current = cycle }, [cycle])

  const toggleBreathe = useCallback(() => {
    if (!breathActiveRef.current) {
      breathActiveRef.current = true
      setBreathing(true)
      cycle()
    } else {
      breathActiveRef.current = false
      setBreathing(false)
      if (breathTimerRef.current) clearTimeout(breathTimerRef.current)
      setBreathPhase('idle')
      changeText(['tap to', 'begin'])
    }
  }, [cycle, changeText])

  useEffect(() => () => { if (breathTimerRef.current) clearTimeout(breathTimerRef.current) }, [])

  const handleCta = (e: React.MouseEvent) => {
    if (IS_WAITLIST) {
      e.preventDefault()
      setWaitlistOpen(true)
    }
  }

  const ctaLabel = IS_WAITLIST ? 'Join Waitlist' : 'Start Here'
  const ctaHref = IS_WAITLIST ? '#' : '/assessment'

  return (
    <>
      {/* ══ NAVBAR ══ */}
      <PublicHeader isAuthenticated={isAuthenticated} dark />

      <main>
        {/* ══ HERO ══ */}
        <section className={styles.hero} id="hero" aria-label="Welcome to The Nest Social">
          <div className={styles.containerWide}>
            <div className={styles.heroInner}>
              <div>
                <p className={styles.heroLabel} data-animate data-delay="1">A place to land when things feel heavy</p>
                <h1 data-animate data-delay="2">The Nest Social Is Where You Stop Carrying It <em>Alone.</em></h1>
                <p className={styles.heroSub} data-animate data-delay="3">
                  Whether it&apos;s a breakup, the quiet drift from people you love, anxiety that won&apos;t switch off, or a heaviness you can&apos;t name yet, The Nest Social is built to meet you right there.
                </p>
                <div className={styles.heroCtaRow} data-animate data-delay="4">
                  <Link href={ctaHref} onClick={handleCta} className={styles.btnMain}>
                    {ctaLabel}
                    <ArrowIcon />
                  </Link>
                  <span className={styles.heroNoPressure}>No strings attached.</span>
                </div>
              </div>

              {/* Glow + example exchange */}
              <div className={styles.heroVis} data-animate data-delay="5" aria-hidden="true">
                <div className={styles.heroOrb}>
                  <svg className={styles.heroOrbRings} viewBox="0 0 400 400" fill="none">
                    <circle cx="200" cy="200" r="190" stroke="rgba(248,240,229,0.06)" strokeWidth="1"/>
                    <circle cx="200" cy="200" r="150" stroke="rgba(248,240,229,0.08)" strokeWidth="1"/>
                    <circle cx="200" cy="200" r="110" stroke="rgba(248,240,229,0.1)" strokeWidth="1"/>
                    <path d="M60 250 Q200 330 340 250" stroke="rgba(232,200,160,0.25)" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M90 280 Q200 345 310 280" stroke="rgba(232,200,160,0.15)" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <div className={styles.heroOrbGlow} />
                  <div className={styles.heroOrbCore} />
                </div>
                <div className={`${styles.heroBubble} ${styles.heroBubbleUser}`}>
                  I was out with friends all evening. Came home and felt more alone than before I left.
                </div>
                <div className={`${styles.heroBubble} ${styles.heroBubbleAlly}`}>
                  <span className={styles.heroBubbleLabel}>Your ally</span>
                  That happens to more people than you&apos;d think. What felt missing in the room tonight?
                </div>
              </div>
            </div>
          </div>
          <div className={styles.heroScroll} aria-hidden="true">
            <span>scroll</span>
            <div className={styles.heroScrollLine} />
          </div>
        </section>

        {/* ══ TWO WAYS ══ */}
        <section className={styles.ways} id="features" aria-label="How The Nest Social helps">
          <div className={styles.containerWide}>
            <span className={styles.sectionLabel} data-animate>How Nest helps</span>
            <h2 className={styles.sectionTitle} data-animate data-delay="1">Two Ways to Start Feeling Like Yourself Again.</h2>
            <div className={styles.waysGrid}>
              <article className={styles.wayCard} data-animate data-delay="1" id="allies">
                <div className={styles.wayTag}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                    <circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/>
                    <path d="M2 20c0-3.3 2.7-6 6-6M16 14c3.3 0 6 2.7 6 6M9 20c0-2 1.3-3 3-3s3 1 3 3"/>
                  </svg>
                  Human Allies
                </div>
                <h3>Find an Ally Who Gets It.</h3>
                <p>Browse ally profiles and pick someone who feels right. These are warm, trained people: licensed psychologists and counsellors who&apos;ve sat with hard things before. You set the pace.</p>
                <Link href="/allies" className={styles.wayBtn}>Find an Ally</Link>
              </article>
              <article className={styles.wayCard} data-animate data-delay="2" id="nila">
                <div className={styles.wayTag}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-5l-5 4v-4H7a3 3 0 0 1-3-3Z"/>
                  </svg>
                  Nila, AI Companion
                </div>
                <h3>Talk to Nila, Anytime.</h3>
                <p>Nila is there at 3am when everything feels loud. She listens without judgment, without unsolicited advice, without making you feel like a burden. Just there, whenever you need.</p>
                <Link href="/nila" className={styles.wayBtn}>Meet Nila</Link>
              </article>
            </div>
          </div>
        </section>

        {/* ══ WE SEE YOU ══ */}
        <section className={styles.familiar} id="pain" aria-label="Maybe some of this sounds familiar">
          <div className={styles.containerWide}>
            <span className={styles.sectionLabel} data-animate>We see you</span>
            <h2 className={styles.sectionTitle} data-animate data-delay="1">Maybe Some of This Sounds Familiar.</h2>
            <div className={styles.familiarGrid}>
              {FAMILIAR.map((row, i) => (
                <div key={i} className={styles.familiarCard} data-animate data-delay={String(i + 1)}>
                  <div className={styles.familiarNowLabel}>Right now</div>
                  <p className={styles.familiarNow}>{row.now}</p>
                  <div className={styles.familiarWithLabel}>With The Nest Social</div>
                  <p className={styles.familiarWith}>{row.with}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ BREATHE ══ */}
        <section className={styles.breathe} id="breathe" aria-label="Breathing exercise">
          <div className={`${styles.container} ${styles.breatheContent}`}>
            <div className={styles.breatheRingsWrap} data-animate>
              <div className={styles.breatheRingOuter1} aria-hidden="true" />
              <div className={styles.breatheRingOuter2} aria-hidden="true" />
              <div
                className={[
                  styles.breatheRing,
                  breathPhase === 'in' ? styles.breatheRingIn : '',
                  breathPhase === 'out' ? styles.breatheRingOut : '',
                ].filter(Boolean).join(' ')}
                role="button"
                aria-label={breathing ? 'Pause breathing exercise' : 'Start breathing exercise'}
                tabIndex={0}
                onClick={toggleBreathe}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleBreathe() } }}
              >
                <div className={styles.breatheRingText} style={{ opacity: breathTextVisible ? 0.8 : 0 }}>
                  {breathLines[0]}<br />{breathLines[1]}
                </div>
              </div>
            </div>
            <p className={styles.breatheEyebrow} data-animate data-delay="1">Just for right now</p>
            <h2 data-animate data-delay="2">You Landed Here for a Reason.</h2>
            <p className={styles.breatheContext} data-animate data-delay="3">
              Before we go anywhere, one breath. Just one. Your body needs this more than your mind knows right now.
            </p>
            <div data-animate data-delay="4">
              <button className={styles.breatheBtn} onClick={toggleBreathe}>
                {breathing ? 'Pause' : 'Begin'}
              </button>
            </div>
            <p className={styles.breatheFooterLine} data-animate data-delay="5">
              4 in. 6 out. That was something real.
            </p>
          </div>
        </section>

        {/* ══ PLAYLIST ══ */}
        <section className={styles.playlist} id="playlist" aria-label="A Nest playlist">
          <div className={styles.containerWide}>
            <div className={styles.playlistInner}>
              <div data-animate>
                <span className={styles.sectionLabel}>Something to press play on</span>
                <h2 className={styles.sectionTitle}>A Playlist for When You Need to Feel a Little Lighter.</h2>
                <p className={styles.playlistBody}>
                  Songs we reach for when the day has been a lot. Put it on while you walk, cook, or lie on the floor for a bit. You don&apos;t have to feel anything in particular. Just let it carry some of the weight.
                </p>
                <div className={styles.playlistMoods}>
                  {PLAYLIST_MOODS.map((m) => <span key={m} className={styles.playlistMood}>{m}</span>)}
                </div>
                <a href={SPOTIFY_PLAYLIST_URL} target="_blank" rel="noopener noreferrer" className={styles.spotifyBtn}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.6 14.4a.62.62 0 0 1-.86.2c-2.35-1.44-5.3-1.76-8.79-.96a.62.62 0 1 1-.28-1.22c3.81-.87 7.08-.5 9.72 1.12.3.18.39.57.2.86Zm1.23-2.74a.78.78 0 0 1-1.07.26c-2.69-1.66-6.8-2.14-9.98-1.17a.78.78 0 1 1-.45-1.49c3.64-1.1 8.17-.57 11.25 1.33.37.22.48.7.25 1.07Zm.1-2.85C14.7 8.9 9.38 8.72 6.3 9.66a.94.94 0 1 1-.54-1.79c3.53-1.07 9.41-.87 13.12 1.33a.94.94 0 0 1-.96 1.61Z"/>
                  </svg>
                  Listen on Spotify
                </a>
                <p className={styles.playlistNote}>Free to listen. Opens in Spotify.</p>
              </div>

              <a href={SPOTIFY_PLAYLIST_URL} target="_blank" rel="noopener noreferrer" className={styles.playerCard} data-animate data-delay="2" aria-label="Open the Dead Poets Society playlist on Spotify">
                <div className={styles.playerDeck}>
                  <svg className={styles.playerRecord} viewBox="0 0 200 200" fill="none" aria-hidden="true">
                    <circle cx="100" cy="100" r="96" fill="#1C2B22"/>
                    <circle cx="100" cy="100" r="80" stroke="rgba(248,240,229,0.08)" strokeWidth="1"/>
                    <circle cx="100" cy="100" r="66" stroke="rgba(248,240,229,0.08)" strokeWidth="1"/>
                    <circle cx="100" cy="100" r="52" stroke="rgba(248,240,229,0.08)" strokeWidth="1"/>
                    <circle cx="100" cy="100" r="34" fill="#E8C8A0"/>
                    <path d="M92 96 Q100 90 108 96" stroke="#2F4C3A" strokeWidth="2.4" strokeLinecap="round"/>
                    <circle cx="100" cy="88" r="2.6" fill="#2F4C3A"/>
                    <circle cx="100" cy="100" r="3" fill="#1C2B22"/>
                  </svg>
                  <svg className={styles.playerArm} viewBox="0 0 80 140" fill="none" aria-hidden="true">
                    <circle cx="62" cy="14" r="10" fill="#E8C8A0" opacity="0.9"/>
                    <path d="M62 14 L40 104 L28 122" stroke="#E8C8A0" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="18" y="118" width="16" height="10" rx="2" fill="#E8C8A0" transform="rotate(-30 26 123)"/>
                  </svg>
                </div>
                <div className={styles.playerMeta}>
                  <div className={styles.playerLabel}>A Nest playlist</div>
                  <div className={styles.playerTitle}>Dead Poets Society</div>
                  <div className={styles.playerBar}><span /></div>
                  <div className={styles.playerFoot}>
                    <span>Press play</span>
                    <span>Stay a while</span>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* ══ LIFESTYLE + PRIVACY ══ */}
        <section className={styles.destig} id="safety" aria-label="What The Nest Social is and is not">
          <div className={styles.containerWide}>
            <div className={styles.destigInner}>
              <div data-animate>
                <p className={styles.destigEyebrow}>This is not a hospital</p>
                <h2>We&apos;re Building a Lifestyle, Not a Diagnosis.</h2>
                <p className={styles.destigBody}>Most mental wellness spaces feel clinical. We built this to feel like a home. No waiting rooms, no jargon, no labels you didn&apos;t ask for.</p>
                <div className={styles.destigPoints}>
                  {[
                    { h: 'Lifestyle, Not Treatment', p: 'Like the gym, but for how you feel on the inside. You don\'t wait until you\'re sick to work out.', icon: <path d="M3 8a5 5 0 1 0 10 0A5 5 0 0 0 3 8Zm2.5 0 1.8 1.8L10.5 6.5"/> },
                    { h: 'No Stigma, No Labels', p: 'You\'re a person, not a patient. That\'s enough to be here. No diagnosis required, ever.', icon: <><circle cx="8" cy="8" r="5"/><path d="M8 5.5V8l1.8 1.5"/></> },
                    { h: 'You Define "Better"', p: 'We don\'t have a template. You tell us what better looks like, and we help you get there.', icon: <path d="M8 2.5l1.4 2.8 3.1.5-2.3 2.2.6 3.1L8 9.6l-2.8 1.5.6-3.1L3.5 5.8l3.1-.5Z"/> },
                  ].map((pt) => (
                    <div key={pt.h} className={styles.destigPoint}>
                      <div className={styles.destigPointIcon} aria-hidden="true">
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{pt.icon}</svg>
                      </div>
                      <div>
                        <h3>{pt.h}</h3>
                        <p>{pt.p}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.destigRight} data-animate data-delay="2">
                <div className={styles.destigPrivacyCard}>
                  <p className={styles.destigPrivacyEyebrow}>Your privacy</p>
                  <h3>Your Story Stays Yours. Always.</h3>
                  <div className={styles.destigPrivacyPoints}>
                    {[
                      'Conversations are encrypted. Only you and your ally can read them.',
                      'We never sell your data. Not now, not ever.',
                      'Delete your account and all your data, anytime.',
                    ].map((pt) => (
                      <div key={pt} className={styles.destigPrivacyPt}>
                        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                          <path d="M2 7l3 3 7-6"/>
                        </svg>
                        {pt}
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles.destigQuoteCard}>
                  <p>&ldquo;I was afraid to start. Now I wonder why I waited so long.&rdquo;</p>
                  <cite>A Nest Social member</cite>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ TAMIL QUOTE ══ */}
        <section className={styles.tamilQuote} id="tamil-quote" aria-label="A poem by Kaber Vasuki">
          <div className={`${styles.container} ${styles.tamilQuoteContent}`}>
            <div className={styles.tamilQuoteMark} aria-hidden="true">&ldquo;</div>
            <p className={styles.tamilQuoteMain} data-animate lang="ta">
              <span className={styles.tamilQuoteLine}>ஆனால் மிஞ்சி போனால் மரணம் என்ற போது,</span>
              <span className={styles.tamilQuoteLine}>வாழ்க்கை வாழ வெக்க படலாமா</span>
            </p>
            <p className={styles.tamilQuoteEnglish} data-animate data-delay="1">
              When even death feels like what remains at the end, should life itself be ashamed of wanting to be lived?
            </p>
            <p className={styles.tamilQuoteAttr} data-animate data-delay="2">— Kaber Vasuki</p>
          </div>
        </section>

        {/* ══ FINAL CTA ══ */}
        <section className={styles.finalSection} id="signup" aria-label="Start when you're ready">
          <div className={styles.container}>
            <svg className={styles.finalNestArt} width="64" height="40" viewBox="0 0 64 40" fill="none" aria-hidden="true">
              <path d="M4 32 Q32 6 60 32" stroke="#2F4C3A" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              <path d="M0 26 Q32 -2 64 26" stroke="#2F4C3A" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity=".6"/>
              <circle cx="24" cy="16" r="4" fill="#2F4C3A" opacity=".25"/>
              <circle cx="32" cy="12" r="4.5" fill="#2F4C3A" opacity=".3"/>
              <circle cx="40" cy="16" r="4" fill="#2F4C3A" opacity=".25"/>
            </svg>
            <h2 data-animate>No Rush. Really.</h2>
            <p data-animate data-delay="1">Maybe tonight is the night. Maybe it&apos;s three months from now. Maybe you just needed to know that something like this exists. All of it is okay. When you&apos;re ready, we&apos;ll be here.</p>
            <div data-animate data-delay="2">
              <Link href={ctaHref} onClick={handleCta} className={styles.btnMain}>
                {ctaLabel}
                <ArrowIcon />
              </Link>
              <span className={styles.finalGhost}>Or hang out here a bit longer. That&apos;s fine too.</span>
            </div>
          </div>
        </section>

        {/* ══ FAQ ══ */}
        <section className={styles.faq} id="faq" aria-labelledby="faq-heading">
          <div className={styles.container}>
            <h2 id="faq-heading" className={styles.faqTitle} data-animate>Common Questions</h2>
            <div className={styles.faqList} data-animate data-delay="1">
              {FAQS.map((f) => (
                <details key={f.q} className={styles.faqItem}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ══ CRISIS STRIP ══ */}
      <LandingHelpline />

      {/* ══ FOOTER ══ */}
      <LandingFooter />

      {IS_WAITLIST && (
        <WaitlistModal isOpen={waitlistOpen} onClose={() => setWaitlistOpen(false)} />
      )}
    </>
  )
}