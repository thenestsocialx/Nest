'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import styles from '../landing.module.css'
import { IS_WAITLIST } from '@/lib/config'
import { WaitlistModal } from '@/components/WaitlistModal'

interface Props {
  isAuthenticated: boolean
}

interface ChatEntry {
  id: number
  type: 'ara' | 'user'
  sender: string
  text: string
  visible: boolean
  typing?: boolean
}

const CHAT_SCRIPT = [
  { type: 'ara' as const, sender: 'Nila', text: "Hey. How are you actually doing? Not the 'I'm fine' version." },
  { type: 'user' as const, sender: 'You', text: "Honestly? Really struggling since the breakup. It's been weeks and I still can't stop thinking about it." },
  { type: 'ara' as const, sender: 'Nila', text: "That makes complete sense. There's no timeline for this. What's been the hardest part — missing them, or the questions about yourself?" },
  { type: 'user' as const, sender: 'You', text: "Both. But I think mostly the second one." },
  { type: 'ara' as const, sender: 'Nila', text: "Yeah. That second one tends to be the quieter, heavier one. Can you tell me more about what those questions sound like?" },
]

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}

export default function LandingPage({ isAuthenticated }: Props) {
  // ── Waitlist modal ──
  const [waitlistOpen, setWaitlistOpen] = useState(false)

  // ── Nav state ──
  const [scrolled, setScrolled] = useState(false)

  // ── Breathe state ──
  const [breathPhase, setBreathPhase] = useState<'idle' | 'in' | 'out'>('idle')
  const [breathCount, setBreathCount] = useState(0)
  const [breathLines, setBreathLines] = useState(['tap to', 'begin'])
  const [breathTextVisible, setBreathTextVisible] = useState(true)
  const breathActiveRef = useRef(false)
  const breathTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Chat state ──
  const [chatEntries, setChatEntries] = useState<ChatEntry[]>([])
  const chatStartedRef = useRef(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // ── Scroll listener ──
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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

  // ── Chat replay ──
  const playChat = useCallback(async () => {
    if (chatStartedRef.current) return
    chatStartedRef.current = true

    for (let i = 0; i < CHAT_SCRIPT.length; i++) {
      const m = CHAT_SCRIPT[i]
      const typingId = -(i + 1)

      if (m.type === 'ara') {
        setChatEntries((p) => [...p, { id: typingId, type: 'ara', sender: 'Nila', text: '', visible: false, typing: true }])
        await sleep(300)
        setChatEntries((p) => p.map((e) => e.id === typingId ? { ...e, visible: true } : e))
        await sleep(1200 + m.text.length * 18)
        setChatEntries((p) => p.filter((e) => e.id !== typingId))
      } else {
        await sleep(600)
      }

      setChatEntries((p) => [...p, { id: i, ...m, visible: false }])
      await sleep(50)
      setChatEntries((p) => p.map((e) => e.id === i ? { ...e, visible: true } : e))
      // Scroll within the chat container only — do NOT call scrollIntoView (it scrolls the page)
      const container = messagesEndRef.current?.parentElement
      if (container) container.scrollTop = container.scrollHeight
      await sleep(m.type === 'ara' ? 600 : 900)
    }
  }, [])

  useEffect(() => {
    const el = chatContainerRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { playChat(); obs.disconnect() } },
      { threshold: 0.4 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [playChat])

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
        setBreathCount((c) => c + 1)
        cycle()
      }, 6400)
    }, 4400)
  }, [changeText])

  const toggleBreathe = useCallback(() => {
    if (!breathActiveRef.current) {
      breathActiveRef.current = true
      setBreathCount(0)
      cycle()
    } else {
      breathActiveRef.current = false
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

  const navClass = [styles.nav, scrolled ? styles.navScrolled : ''].filter(Boolean).join(' ')

  return (
    <>
      {/* ══ NAVBAR ══ */}
      <header className={navClass} role="banner">
        <div className={styles.navInner}>
          <Link href="/" className={styles.navLogo} aria-label="nest home">
            {/* Brand mark — arc (nest) + dot */}
            <svg width="26" height="24" viewBox="0 0 30 28" fill="none" aria-hidden="true">
              <path d="M 3,16 Q 15,26 27,16" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round"/>
              <circle cx="15" cy="8" r="3.2" fill="currentColor"/>
            </svg>
            <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '22px', fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1, color: 'currentColor' }}>nest</span>
          </Link>

          <nav className={styles.navLinks} aria-label="Main navigation">
            {isAuthenticated
              ? <Link href="/home" className={styles.navCta}>Go to your space →</Link>
              : <Link href="/login" className={styles.navCta}>Sign in</Link>
            }
          </nav>
        </div>

      </header>

      <main>
        {/* ══ HERO ══ */}
        <section className={styles.hero} id="hero" aria-label="Welcome to nest">
          <div className={styles.heroBg} aria-hidden="true">
            <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" fill="none">
              <path d="M0 800 Q100 600 200 650 Q400 580 600 590 Q800 560 1000 570 Q1100 550 1200 560 L1200 800Z" fill="rgba(248,240,229,0.02)"/>
              <path d="M0 800 Q300 700 600 670 Q900 650 1200 665 L1200 800Z" fill="rgba(248,240,229,0.015)"/>
              <ellipse cx="980" cy="340" rx="180" ry="220" fill="rgba(232,200,160,0.04)"/>
              <ellipse cx="980" cy="340" rx="90" ry="120" fill="rgba(232,200,160,0.04)"/>
              <rect x="860" y="140" width="240" height="340" rx="6" stroke="rgba(248,240,229,0.05)" strokeWidth="1.5" fill="none"/>
              <line x1="980" y1="140" x2="980" y2="480" stroke="rgba(248,240,229,0.03)" strokeWidth="1"/>
              <line x1="860" y1="310" x2="1100" y2="310" stroke="rgba(248,240,229,0.03)" strokeWidth="1"/>
              <circle cx="120" cy="100" r="1.5" fill="rgba(248,240,229,0.18)"/>
              <circle cx="200" cy="60" r="1" fill="rgba(248,240,229,0.13)"/>
              <circle cx="340" cy="120" r="1.5" fill="rgba(248,240,229,0.13)"/>
              <circle cx="60" cy="200" r="1" fill="rgba(248,240,229,0.1)"/>
            </svg>
          </div>
          <div className={styles.container}>
            <div className={styles.heroInner}>
              <div>
                <p className={styles.heroLabel} data-animate data-delay="1">a place to land when things feel heavy</p>
                <h1 data-animate data-delay="2">You don&apos;t have to keep<br />carrying this <em>alone.</em></h1>
                <p className={styles.heroSub} data-animate data-delay="3">Whether it&apos;s a breakup, a relationship falling apart, feeling disconnected from everyone, anxiety that won&apos;t quit — or just a heaviness you can&apos;t name. You found the right place.</p>
                <div data-animate data-delay="4">
                  <Link href={IS_WAITLIST ? '#' : '/assessment'} onClick={handleCta} className={styles.btnMain}>
                    {IS_WAITLIST ? 'Join Waitlist' : 'Start Here'}
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                  <span className={styles.heroNoPressure}>no sign up needed to begin. takes about 3 minutes.</span>
                </div>
              </div>
              <div className={styles.heroVis} aria-hidden="true">
                <svg width="360" height="420" viewBox="0 0 360 420" fill="none" data-animate data-delay="5">
                  <rect x="60" y="40" width="200" height="260" rx="8" stroke="rgba(248,240,229,0.18)" strokeWidth="1.5" fill="none"/>
                  <line x1="160" y1="40" x2="160" y2="300" stroke="rgba(248,240,229,0.08)" strokeWidth="1"/>
                  <line x1="60" y1="170" x2="260" y2="170" stroke="rgba(248,240,229,0.08)" strokeWidth="1"/>
                  <ellipse cx="160" cy="170" rx="70" ry="80" fill="rgba(232,200,160,0.08)"/>
                  <ellipse cx="160" cy="170" rx="35" ry="45" fill="rgba(232,200,160,0.09)"/>
                  <rect x="154" y="195" width="12" height="40" rx="2" fill="rgba(248,240,229,0.14)"/>
                  <ellipse cx="160" cy="193" rx="6" ry="3" fill="rgba(232,200,160,0.38)"/>
                  <path d="M160 185 Q162 176 160 170 Q158 176 160 185" fill="rgba(232,200,160,0.6)"/>
                  <path d="M240 60 Q290 40 320 80 Q310 100 290 90" stroke="rgba(248,240,229,0.13)" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <path d="M270 88 Q300 78 310 92" stroke="rgba(232,200,160,0.38)" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <path d="M266 84 Q299 70 314 88" stroke="rgba(232,200,160,0.25)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  <circle cx="284" cy="74" r="3.5" fill="rgba(248,240,229,0.22)"/>
                  <circle cx="295" cy="72" r="3" fill="rgba(248,240,229,0.17)"/>
                  <circle cx="160" cy="340" r="16" fill="rgba(248,240,229,0.1)"/>
                  <path d="M148 356 Q148 380 160 385 Q172 380 172 356" fill="rgba(248,240,229,0.08)"/>
                  <path d="M140 372 Q135 385 148 388" stroke="rgba(248,240,229,0.09)" strokeWidth="6" strokeLinecap="round" fill="none"/>
                  <path d="M180 372 Q185 385 172 388" stroke="rgba(248,240,229,0.09)" strokeWidth="6" strokeLinecap="round" fill="none"/>
                  <line x1="80" y1="395" x2="240" y2="395" stroke="rgba(248,240,229,0.05)" strokeWidth="1"/>
                  <circle cx="40" cy="80" r="1.5" fill="rgba(248,240,229,0.28)"/>
                  <circle cx="310" cy="160" r="1.5" fill="rgba(248,240,229,0.22)"/>
                  <circle cx="30" cy="180" r="1" fill="rgba(248,240,229,0.18)"/>
                  <circle cx="320" cy="260" r="1" fill="rgba(248,240,229,0.18)"/>
                </svg>
              </div>
            </div>
          </div>
          <div className={styles.heroScroll} aria-hidden="true">
            <span>scroll</span>
            <div className={styles.heroScrollLine} />
          </div>
        </section>

        {/* ══ PAIN POINT + TRANSFORMATION ══ */}
        <section className={styles.pain} id="pain" aria-label="Maybe this sounds like you">
          <div className={styles.container}>
            <div className={styles.painTop}>
              <span className={styles.sectionLabel} data-animate>we see you</span>
              <h2 data-animate data-delay="1">Maybe this sounds<br />like you.</h2>
              <p data-animate data-delay="2">Most people find nest when they&apos;re in one of these places.</p>
            </div>
            <div className={styles.painRows}>
              {[
                { now: '"It\'s 2am and my thoughts won\'t stop. I can\'t call anyone — I don\'t want to be a burden."', with: 'Nila, at 3am. No judgment. No questions you\'re not ready for. Just there.', delay: '1' },
                { now: '"The breakup wrecked me more than I expected. I keep replaying it. I don\'t even know who I am without them."', with: 'Slowly finding your footing. Beginning to trust your own choices again.', delay: '2' },
                { now: '"I have people around me but I\'ve never felt more alone. I can\'t explain it without sounding ungrateful."', with: 'People who actually get it — without you having to explain yourself first.', delay: '3' },
                { now: '"I\'m fine on paper. Good job, good life. But something feels off and I can\'t even name what it is."', with: 'A space to finally sit with it — and start making sense of what\'s actually going on.', delay: '4' },
              ].map((row, i) => (
                <div key={i} className={styles.painRow} data-animate data-delay={row.delay}>
                  <div className={styles.painNow}>
                    <div className={styles.painNowLabel}>right now</div>
                    <p>{row.now}</p>
                  </div>
                  <div className={styles.painArrow} aria-hidden="true">
                    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9h12M10 5l5 4-5 4"/>
                    </svg>
                  </div>
                  <div className={styles.painWith}>
                    <div className={styles.painWithLabel}>with nest</div>
                    <p>{row.with}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.painBridge} data-animate>
              <p>&ldquo;Whatever you&apos;re carrying right now — it makes complete sense that it feels this heavy. And it doesn&apos;t have to stay this way.&rdquo;</p>
            </div>
          </div>
        </section>

        {/* ══ FOUR STEPS ══ */}
        <section className={styles.stepsSection} id="features" aria-label="How nest helps you">
          <div className={styles.container}>
            <div className={styles.stepsSectionTop}>
              <span className={styles.sectionLabel} data-animate>how nest helps</span>
              <h2 data-animate data-delay="1">Four ways to start feeling<br />like yourself again.</h2>
              <p data-animate data-delay="2">You don&apos;t have to do all of them. You don&apos;t have to do them in order. Start with whatever feels least scary right now.</p>
            </div>
            <div className={styles.stepsGrid}>
              <article className={styles.stepCard} data-animate data-delay="1" id="nila">
                <div className={styles.stepCardNum}>1</div>
                <div className={styles.stepCardIcon} aria-hidden="true">
                  <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 13Q7 7 13 7h18Q37 7 37 13v13Q37 26 31 31H23l-7 6v-6H13Q7 31 7 25Z"/>
                    <path d="M14 21h5M21 21h9"/><path d="M14 26h8"/>
                  </svg>
                </div>
                <div className={styles.stepCardTag}>AI Companion</div>
                <h3>Talk to Nila, anytime.</h3>
                <p>Nila is there at 3am when everything feels loud. She listens without judgment, without unsolicited advice, without making you feel like a burden. Just there — whenever you need.</p>
                <a href="#how-it-works" className={styles.stepCardLink}>Meet Nila →</a>
              </article>
              <article className={styles.stepCard} data-animate data-delay="2" id="allies">
                <div className={styles.stepCardNum}>2</div>
                <div className={styles.stepCardIcon} aria-hidden="true">
                  <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <circle cx="15" cy="13" r="5"/><circle cx="29" cy="13" r="5"/>
                    <path d="M5 35c0-5.5 4.5-10 10-10"/>
                    <path d="M29 25c5.5 0 10 4.5 10 10"/>
                    <path d="M17 31c0-3.3 2.2-5 5-5s5 1.7 5 5v4H17v-4Z"/>
                  </svg>
                </div>
                <div className={styles.stepCardTag}>Human Allies</div>
                <h3>Find an Ally who gets it.</h3>
                <p>Browse Ally profiles and pick someone who feels right. These are warm, trained people who&apos;ve been through hard things too. You set the pace. No timeline, no agenda.</p>
                <a href="#features" className={styles.stepCardLink}>See Allies →</a>
              </article>
              <article className={styles.stepCard} data-animate data-delay="3">
                <div className={styles.stepCardNum}>3</div>
                <div className={styles.stepCardIcon} aria-hidden="true">
                  <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M22 7v30"/><path d="M22 7Q13 5 7 10v26Q13 33 22 37"/>
                    <path d="M22 7Q31 5 37 10v26Q31 33 22 37"/>
                    <path d="M30 9v13l3-2 3 2V9" fill="rgba(92,122,102,0.18)"/>
                  </svg>
                </div>
                <div className={styles.stepCardTag}>Resources</div>
                <h3>Something gentle to fall into.</h3>
                <p>Music, films, words, sounds — curated for the kind of evening you&apos;re actually having. Not a generic list. The right thing, for right now.</p>
              </article>
              <article className={styles.stepCard} data-animate data-delay="4" id="events">
                <div className={styles.stepCardNum}>4</div>
                <div className={styles.stepCardIcon} aria-hidden="true">
                  <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <circle cx="22" cy="12" r="5"/><circle cx="11" cy="20" r="4"/><circle cx="33" cy="20" r="4"/>
                    <path d="M14 38c0-4.4 3.6-8 8-8s8 3.6 8 8"/>
                    <path d="M5 36c0-3.3 2.7-5 6-5"/><path d="M39 36c0-3.3-2.7-5-6-5"/>
                  </svg>
                </div>
                <div className={styles.stepCardTag}>Weekend Events</div>
                <h3>Actual humans, in actual rooms.</h3>
                <p>Low-pressure weekend gatherings. No icebreakers. No performing wellness. Just people who showed up because they wanted to feel a little less alone — and usually did.</p>
                <a href="#signup" className={styles.stepCardLink}>View Events →</a>
              </article>
            </div>
          </div>
        </section>

        {/* ══ HOW NEST WORKS — pine + animated chat ══ */}
        <section className={styles.how} id="how-it-works" aria-label="How nest works">
          <div className={styles.containerWide}>
            <div className={styles.howInner}>
              <div data-animate>
                <p className={styles.howEyebrow}>how it works</p>
                <h2>Like texting a friend<br />who knows what to ask.</h2>
                <p className={styles.howSub}>No forms. No waitlists. You just start talking.</p>
                <div className={styles.howSteps}>
                  {[
                    { num: '01', h: 'You tell us how you\'re doing', p: 'Start wherever. That thing sitting on your chest. No structure needed — just honest words.' },
                    { num: '02', h: 'We actually listen', p: 'Not to label you. Just to understand what\'s really going on beneath the surface.' },
                    { num: '03', h: 'A path that\'s yours', p: 'An Ally, Nila, a gathering — whatever might help first. Nothing generic, nothing prescribed.' },
                    { num: '04', h: 'You move at your own pace', p: 'Come back when you need to. Step away when you want. No streaks, no nudges.' },
                  ].map((s) => (
                    <div key={s.num} className={styles.howStep}>
                      <div className={styles.howStepNum}>{s.num}</div>
                      <div>
                        <h3>{s.h}</h3>
                        <p>{s.p}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div data-animate data-delay="2">
                <div className={styles.chatUi} ref={chatContainerRef} aria-label="Example conversation with Nila">
                  <div className={styles.chatUiHeader}>
                    <div className={styles.chatUiAvatar} aria-hidden="true">
                      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M4 7Q4 4 7 4h4Q14 4 14 7v5Q14 14 11 16H9l-4 3v-3Q4 16 4 13Z"/>
                      </svg>
                    </div>
                    <div>
                      <div className={styles.chatUiName}>Nila</div>
                      <div className={styles.chatUiStatus}>here for you, always</div>
                    </div>
                  </div>
                  <div className={styles.chatUiMessages}>
                    {chatEntries.map((entry) =>
                      entry.typing ? (
                        <div
                          key={`t${entry.id}`}
                          className={[styles.chatTyping, entry.visible ? styles.chatTypingVisible : ''].filter(Boolean).join(' ')}
                        >
                          <span /><span /><span />
                        </div>
                      ) : (
                        <div
                          key={entry.id}
                          className={[
                            styles.chatMsg,
                            entry.type === 'ara' ? styles.chatMsgAra : styles.chatMsgUser,
                            entry.visible ? styles.chatMsgVisible : '',
                          ].filter(Boolean).join(' ')}
                        >
                          <div className={styles.chatMsgSender}>{entry.sender}</div>
                          <div className={styles.chatMsgBubble}>{entry.text}</div>
                        </div>
                      )
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ BREATHE ══ */}
        <section className={styles.breathe} id="breathe" aria-label="Breathing exercise">
          <div className={styles.breatheBgRings} aria-hidden="true">
            <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" fill="none">
              <circle cx="400" cy="300" r="280" stroke="rgba(248,240,229,0.05)" strokeWidth="1"/>
              <circle cx="400" cy="300" r="220" stroke="rgba(248,240,229,0.05)" strokeWidth="1"/>
              <circle cx="400" cy="300" r="160" stroke="rgba(248,240,229,0.06)" strokeWidth="1"/>
              <circle cx="400" cy="300" r="100" stroke="rgba(248,240,229,0.07)" strokeWidth="1"/>
            </svg>
          </div>
          <div className={`${styles.container} ${styles.breatheContent}`}>
            <p className={styles.breatheEyebrow} data-animate>just for right now</p>
            <h2 data-animate data-delay="1">You landed here<br />for a reason.</h2>
            <p className={styles.breatheContext} data-animate data-delay="2">
              Before we go anywhere — one breath. Just one.<br />Your body needs this more than your mind realises right now.
            </p>
            <div className={styles.breatheRingsWrap} data-animate data-delay="3">
              <div className={styles.breatheRingOuter1} aria-hidden="true" />
              <div className={styles.breatheRingOuter2} aria-hidden="true" />
              <div
                className={[
                  styles.breatheRing,
                  breathPhase === 'in' ? styles.breatheRingIn : '',
                  breathPhase === 'out' ? styles.breatheRingOut : '',
                ].filter(Boolean).join(' ')}
                role="button"
                aria-label={breathActiveRef.current ? 'Pause breathing exercise' : 'Start breathing exercise'}
                tabIndex={0}
                onClick={toggleBreathe}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleBreathe() } }}
              >
                <div className={styles.breatheRingText} style={{ opacity: breathTextVisible ? 0.8 : 0 }}>
                  {breathLines[0]}<br />{breathLines[1]}
                </div>
              </div>
            </div>
            <div data-animate data-delay="4">
              <button className={styles.breatheBtn} onClick={toggleBreathe}>
                {breathActiveRef.current ? 'pause' : 'begin'}
              </button>
              <span className={styles.breatheCount} aria-live="polite">
                {breathCount > 0 ? (breathCount === 1 ? '1 breath' : `${breathCount} breaths`) : ''}
              </span>
            </div>
            <p className={styles.breatheFooterLine} data-animate data-delay="5">
              4 in. 6 out. You just gave yourself something real.
            </p>
          </div>
        </section>

        {/* ══ DESTIGMATISE + SAFETY ══ */}
        <section className={styles.destig} id="safety" aria-label="What nest is and is not">
          <div className={styles.container}>
            <div className={styles.destigInner}>
              <div data-animate>
                <p className={styles.destigEyebrow}>this is not a hospital</p>
                <h2>We&apos;re building a lifestyle —<br />not a diagnosis.</h2>
                <p className={styles.destigBody}>No waiting rooms. No frameworks. No &ldquo;so, how does that make you feel?&rdquo; Just the right people in your corner — while you figure out the rest.</p>
                <div className={styles.destigPoints}>
                  <div className={styles.destigPoint}>
                    <div className={styles.destigPointIcon} aria-hidden="true">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M2 8a6 6 0 1012 0A6 6 0 002 8Z"/><path d="M5 8l2 2 4-4"/>
                      </svg>
                    </div>
                    <div>
                      <h3>Lifestyle, not treatment</h3>
                      <p>Like the gym, but for how you feel on the inside. You don&apos;t wait until you&apos;re sick to work out.</p>
                    </div>
                  </div>
                  <div className={styles.destigPoint}>
                    <div className={styles.destigPointIcon} aria-hidden="true">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/>
                      </svg>
                    </div>
                    <div>
                      <h3>No stigma, no labels</h3>
                      <p>You&apos;re a person, not a patient. That&apos;s enough to be here. No diagnosis required, ever.</p>
                    </div>
                  </div>
                  <div className={styles.destigPoint}>
                    <div className={styles.destigPointIcon} aria-hidden="true">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5l3.5-.5Z"/>
                      </svg>
                    </div>
                    <div>
                      <h3>You define &ldquo;better&rdquo;</h3>
                      <p>We don&apos;t have a template. You tell us what better looks like for you — and we help you get there.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.destigRight} data-animate data-delay="2">
                <div className={styles.destigPrivacyCard}>
                  <div className={styles.destigPrivacyCardIcon} aria-hidden="true">
                    <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                      <path d="M18 4L6 10v10c0 7 5.5 13.5 12 15 6.5-1.5 12-8 12-15V10L18 4Z"/>
                      <path d="M13 18l3.5 3.5 7-7"/>
                    </svg>
                  </div>
                  <h3>Your story stays yours.<br />Always.</h3>
                  <p className={styles.destigPrivacyCardSub}>What you share stays yours. Used only to help you — never to profile, advertise, or sell. Ever.</p>
                  <div className={styles.destigPrivacyPoints}>
                    {[
                      'We will never sell your data. Full stop.',
                      'End-to-end encrypted conversations',
                      'Delete your account and data anytime',
                      'Allies follow strict confidentiality',
                    ].map((pt) => (
                      <div key={pt} className={styles.destigPrivacyPt}>
                        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <path d="M2 7l3 3 7-6"/>
                        </svg>
                        {pt}
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles.destigQuoteCard} data-animate data-delay="3">
                  <p>&ldquo;We built nest because everyone deserves somewhere they can feel like themselves again.&rdquo;</p>
                  <cite>— The nest team</cite>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ FOUNDER NOTE — sticky note ══ */}
        <section className={styles.founder} id="about" aria-label="A note from the nest team">
          <div className={styles.container}>
            <div className={styles.founderInner}>
              <h2 data-animate>Why we built this.</h2>
              <div className={styles.stickyNote} data-animate data-delay="1">
                <p>
                  I&apos;ve watched people I love go through breakups alone at 3am, not because no one cared — but because reaching out felt like too much. <em>I&apos;ve been that person too.</em>
                </p>
                <p>
                  Nest started as a question: <em>what if support didn&apos;t feel like a big, scary step? What if it just felt like… talking to someone who gets it?</em>
                </p>
                <p>
                  We&apos;re still building. But we&apos;re building it with every person who&apos;s ever felt like their feelings were too much — because they&apos;re not. You&apos;re not.
                </p>
                <span className={styles.stickyNoteWith}>With love,</span>
                <span className={styles.stickyNoteSig}>— Sanjay Karthick &amp; the Nest team</span>
                <div className={styles.stickyNotePlant} aria-hidden="true">
                  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                    <line x1="26" y1="48" x2="26" y2="28" stroke="#5C7A66" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M26 38 Q16 32 14 24 Q20 26 26 34" fill="#5C7A66" opacity="0.7"/>
                    <path d="M26 34 Q36 28 38 20 Q32 22 26 30" fill="#5C7A66" opacity="0.85"/>
                    <path d="M26 28 Q22 18 26 12 Q30 18 26 28" fill="#2F4C3A" opacity="0.6"/>
                    <path d="M20 48 Q20 44 26 44 Q32 44 32 48 L30 52 H22 Z" fill="#9B6651" opacity="0.5"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ TAMIL QUOTE ══ */}
        <section className={styles.tamilQuote} id="tamil-quote" aria-label="A poem by Kaber Vasuki">
          <div className={styles.tamilQuoteBg} aria-hidden="true">
            <svg width="100%" height="100%" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice" fill="none">
              <circle cx="100" cy="80" r="2" fill="rgba(248,240,229,0.15)"/>
              <circle cx="200" cy="320" r="1.5" fill="rgba(248,240,229,0.1)"/>
              <circle cx="1100" cy="60" r="2" fill="rgba(248,240,229,0.12)"/>
              <circle cx="1050" cy="340" r="1.5" fill="rgba(248,240,229,0.1)"/>
              <circle cx="600" cy="30" r="1" fill="rgba(248,240,229,0.1)"/>
              <circle cx="580" cy="370" r="1" fill="rgba(248,240,229,0.08)"/>
            </svg>
          </div>
          <div className={styles.tamilQuoteLeaf} aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M40 8 Q44 24 32 36 Q20 44 8 40 Q12 24 24 16 Q32 10 40 8Z" fill="#F8F0E5" opacity="0.25"/>
              <path d="M40 8 Q24 28 8 40" stroke="#F8F0E5" strokeWidth="1" opacity="0.2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className={`${styles.container} ${styles.tamilQuoteContent}`}>
            <p className={styles.tamilQuoteMain} data-animate lang="ta">
              &ldquo;ஆனால் மிஞ்சி போனால் மரணம் என்ற போது,<br />வாழ்க்கை வாழ வெக்க படலாமா&rdquo;
            </p>
            <p className={styles.tamilQuoteEnglish} data-animate data-delay="1">
              &ldquo;When even death feels like what remains at the end —<br />
              should life itself be ashamed of wanting to be lived?&rdquo;
            </p>
            <p className={styles.tamilQuoteAttr} data-animate data-delay="2">— Kaber Vasuki</p>
          </div>
        </section>

        {/* ══ KANMANI CALLOUT ══ */}
        <section className={styles.kanmaniCallout} aria-label="Kanmani social fund">
          <div className={styles.container}>
            <p className={styles.kanmaniCalloutEyebrow}>Kanmani · A Nest Social Fund</p>
            <p className={styles.kanmaniCalloutText} data-animate>
              Some people had the booking page open last night, saw the price, and closed the tab.<br />
              The Kanmani fund pays for the hour they couldn&apos;t.
            </p>
            <Link href="/kanmani" className={styles.kanmaniCalloutLink} data-animate data-delay="1">
              Give to Kanmani →
            </Link>
          </div>
        </section>

        {/* ══ FINAL CTA ══ */}
        <section className={styles.finalSection} id="signup" aria-label="Start your nest journey">
          <div className={styles.container}>
            <svg className={styles.finalNestArt} width="64" height="40" viewBox="0 0 64 40" fill="none" aria-hidden="true">
              <path d="M4 32 Q32 6 60 32" stroke="#2F4C3A" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              <path d="M0 26 Q32 -2 64 26" stroke="#2F4C3A" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity=".6"/>
              <circle cx="24" cy="16" r="4" fill="#2F4C3A" opacity=".25"/>
              <circle cx="32" cy="12" r="4.5" fill="#2F4C3A" opacity=".3"/>
              <circle cx="40" cy="16" r="4" fill="#2F4C3A" opacity=".25"/>
            </svg>
            <h2 data-animate>No rush. Really.</h2>
            <p data-animate data-delay="1">Maybe tonight is the night. Maybe it&apos;s three months from now. Maybe you just needed to know that something like this exists. All of it is okay. When you&apos;re ready — we&apos;ll be here.</p>
            <div data-animate data-delay="2">
              <Link href={IS_WAITLIST ? '#' : '/assessment'} onClick={handleCta} className={styles.btnMain}>
                {IS_WAITLIST ? 'Join Waitlist' : 'Start Here'}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <span className={styles.finalGhost}>or hang out here a bit longer. that&apos;s fine too.</span>
            </div>
          </div>
        </section>
      </main>

      {/* ══ CRISIS STRIP ══ */}
      <div className={styles.crisisStrip} role="complementary" aria-label="Crisis support">
        <div className={`${styles.containerWide} ${styles.crisisStripInner}`}>
          <span className={styles.crisisStripLabel}>If tonight is really hard —</span>
          <div className={styles.crisisStripNumbers}>
            <span className={styles.crisisChip}>India: iCall 9152987821</span>
            <span className={styles.crisisChip}>India: Vandrevala 1860-2662-345</span>
            <span className={styles.crisisChip}>US: 988</span>
            <span className={styles.crisisChip}>UK: Samaritans 116 123</span>
            <span className={styles.crisisChip}>
              <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer">findahelpline.com ↗</a>
            </span>
          </div>
          <span className={styles.crisisStripEnd}>you matter.</span>
        </div>
      </div>

      {/* ══ FOOTER ══ */}
      <footer className={styles.footer} aria-label="nest footer">
        <div className={styles.containerWide}>
          <div className={styles.footerInner}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'rgba(248,240,229,0.7)' }} aria-label="nest" role="img">
              <svg width="22" height="20" viewBox="0 0 30 28" fill="none" aria-hidden="true">
                <path d="M 3,16 Q 15,26 27,16" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round"/>
                <circle cx="15" cy="8" r="3.2" fill="currentColor"/>
              </svg>
              <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '20px', fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1, color: 'currentColor' }}>nest</span>
            </div>
            <p className={styles.footerTagline}>made with a lot of care, for the in-between days.</p>
            <div className={styles.footerContact}>
              <a href="tel:7550096933" className={styles.footerContactLink}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.45 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 6.29 6.29l1.62-1.62a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                7550096933
              </a>
              <span className={styles.footerContactDot} aria-hidden="true">·</span>
              <a href="mailto:thenestsocialx@gmail.com" className={styles.footerContactLink}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                thenestsocialx@gmail.com
              </a>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span className={styles.footerCopy}>© 2026 Nest. All rights reserved.</span>
            <div className={styles.footerLegal}>
              <Link href="/kanmani">Kanmani Fund</Link>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {IS_WAITLIST && (
        <WaitlistModal isOpen={waitlistOpen} onClose={() => setWaitlistOpen(false)} />
      )}
    </>
  )
}
