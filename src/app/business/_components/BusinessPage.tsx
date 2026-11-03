'use client'

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import Link from 'next/link'
import NestLogo from '@/components/ui/NestLogo'
import styles from '../business.module.css'
import { OFFERS } from './offers'
import ContactModal from './ContactModal'

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ')

const DESIGN_WIDTH = 1440
// Never scale the design up, so type matches the other pages on big monitors
const MAX_ZOOM = 1
// Below this width the page reflows into the phone/tablet layout instead of zooming the canvas
const REFLOW_BELOW = 1024

const CARD_W = 400
const GAP = 24
const MAX_INDEX = OFFERS.length - 3

const Arrow = () => <span aria-hidden="true">→</span>

const HERO_CARDS: { tag: string; tagBg: string; title: string; text: string; who: string; icon: ReactNode }[] = [
  {
    tag: 'Collective Wellbeing', tagBg: '#E8C8A0', title: 'Music and Art Therapy',
    text: 'Wellbeing that doesn’t feel like a seminar.', who: 'Every team',
    icon: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  },
  {
    tag: 'Compliance and Safety', tagBg: '#C9D3C4', title: 'POSH, Done Right',
    text: 'Policy, committee and training. Not a yearly checkbox.', who: 'Workplaces · Colleges',
    icon: <><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /><path d="M9 12l2 2 4-4" /></>,
  },
  {
    tag: 'Team and Leadership', tagBg: '#E3B9A6', title: 'Teams That Work Together',
    text: 'Team building, leadership and soft skills training.', who: 'Workplaces',
    icon: <><circle cx="12" cy="7" r="3" /><path d="M6 20c.8-3.5 3.2-5.5 6-5.5s5.2 2 6 5.5" /><path d="M17 4l2-1M7 4L5 3" /></>,
  },
]
// Starting positions of the three dealt cards (the animation takes over from here)
const DEAL_START: CSSProperties[] = [
  { transform: 'translate(0px, 0px) rotate(-3deg)', zIndex: 3 },
  { transform: 'translate(64px, -46px) rotate(5deg)', zIndex: 2 },
  { transform: 'translate(-58px, -84px) rotate(-11deg)', zIndex: 1 },
]

const SEEN = [
  { side: 'left', top: 84, text: 'Teams that don’t work together' },
  { side: 'left', top: 170, text: 'Engagement that rises, then slides back' },
  { side: 'right', top: 84, text: 'Counselling sessions nobody uses' },
  { side: 'right', top: 170, text: 'Performance issues that keep coming back' },
]
const UNSEEN = [
  { side: 'left', top: 392, text: 'Unspoken friction and low trust between people' },
  { side: 'left', top: 486, text: 'Stress that a one-off session can’t reach' },
  { side: 'left', top: 580, text: 'Nobody sure it’s really confidential' },
  { side: 'right', top: 392, text: 'Managers who don’t know how to start the conversation' },
  { side: 'right', top: 486, text: 'Burnout that passes for “just a busy quarter”' },
  { side: 'right', top: 580, text: 'Conflicts that get avoided, never resolved' },
]

const EAP_POINTS = [
  'One wellness module for every department, every level.',
  'Built in English for a Western context, localised after the fact.',
  'Assigned to you. No matching involved.',
  'A webinar and a helpline number.',
  'One number, once a quarter: percentage utilised.',
]
const NEST_POINTS = [
  'A plan built from your goals and a real read of your people, department by department.',
  'The language and register your teams actually use, in the room.',
  'Matched to fit, chosen for the person, not the roster order.',
  'Therapy, workshops, music and art, listening circles, animal-assisted sessions, drama-skit POSH training.',
  'Trend lines and a Bond Score twice a year, with what to do next.',
]

const STEPS: { title: string; text: string; icon: ReactNode }[] = [
  {
    title: 'Discovery Call',
    text: 'We start with leadership: the goal behind the ask, your constraints, and what success needs to look like.',
    icon: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />,
  },
  {
    title: 'Anonymous Landscape Read',
    text: 'A confidential pulse read of stress, relationships and team dynamics, so we see where people actually are.',
    icon: <><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></>,
  },
  {
    title: 'Personalised Proposal',
    text: 'One plan built from your goals and your people, department by department. Never off a shelf.',
    icon: <><path d="M7 3.5h7l4 4V20.5H7z" /><path d="M14 3.5v4h4M9.5 12h6M9.5 15.5h6" /></>,
  },
  {
    title: 'Rollout',
    text: 'We show up, in person or online, and follow up with half-yearly reports and clear next steps.',
    icon: <><path d="M12 3c4 2 6 6 6 10l-3 3H9l-3-3c0-4 2-8 6-10z" /><circle cx="12" cy="10" r="2" /><path d="M9 16l-2 5 3-2M15 16l2 5-3-2" /></>,
  },
]
const STEP_CLASS = [styles.step0, styles.step1, styles.step2, styles.step3]

const WHY_NEST: { title: string; text: string; icon: ReactNode }[] = [
  {
    title: 'What Happens in the Session Stays There',
    text: 'We never share who attended or what was discussed. You receive one number: total sessions used across the organisation. This is policy, not a promise.',
    icon: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  },
  {
    title: 'RCI-Licensed Clinical Psychologists',
    text: 'A small, deliberately matched roster of practitioners. Not freelancers off a marketplace, and never assigned by turn.',
    icon: <><rect x="4" y="3" width="16" height="18" rx="2" /><circle cx="12" cy="10" r="3" /><path d="M9 17h6" /></>,
  },
  {
    title: 'Built for Indian Workplaces',
    text: 'Made for the language and culture your teams actually use, in the room. Not translated or localised after the fact.',
    icon: <><path d="M4 5h9M8.5 3v2M6 5c.5 3 2.5 5.5 5 7M11 5c-.5 3-3 6-6.5 7.5" /><path d="M13 20l4-9 4 9M14.5 17h5" /></>,
  },
  {
    title: 'Reports That Mean Something',
    text: 'Half-yearly and yearly reports with anonymised trend lines, our Bond Score for team cohesion, and clear do-more and do-less recommendations.',
    icon: <><path d="M4 20h16" /><rect x="6" y="12" width="3" height="6" rx="1" /><rect x="11" y="8" width="3" height="10" rx="1" /><rect x="16" y="4" width="3" height="14" rx="1" /></>,
  },
]

const HELPLINES = [
  { href: 'tel:14416', name: 'Tele-MANAS', num: '14416' },
  { href: 'tel:9152987821', name: 'iCall', num: '9152987821' },
  { href: 'tel:18602662345', name: 'Vandrevala', num: '1860-2662-345' },
  { href: 'tel:988', name: 'US', num: '988' },
  { href: 'tel:116123', name: 'UK Samaritans', num: '116 123' },
]

function Icon({ children, size = 22, stroke = '#9B6651', width = 1.8 }: { children: ReactNode; size?: number; stroke?: string; width?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

export default function BusinessPage() {
  const [modal, setModal] = useState(false)
  const [interest, setInterest] = useState('')
  const [pick, setPick] = useState<'' | 'nest' | 'eap'>('')
  const [oi, setOi] = useState(0)
  const [drag, setDrag] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [reflow, setReflow] = useState(false)
  const x0 = useRef<number | null>(null)
  const dragRef = useRef(0)

  // Fit the 1440px canvas to the window on laptops and desktops; reflow on smaller screens
  useEffect(() => {
    // The page's inline script creates this <style> before first paint; keep it in step on resize
    let tag = document.getElementById('biz-zoom')
    if (!tag) { tag = document.createElement('style'); tag.id = 'biz-zoom'; document.head.appendChild(tag) }
    const zoomTag = tag
    const fit = () => {
      const w = document.documentElement.clientWidth
      const z = Math.min(MAX_ZOOM, w / DESIGN_WIDTH)
      // Width in unzoomed px, so that once zoomed the canvas spans exactly the window
      zoomTag.textContent = `:root{--biz-zoom:${z};--biz-width:${w / z}px}`
      setReflow(w < REFLOW_BELOW)
    }
    fit()
    window.addEventListener('resize', fit)
    return () => {
      window.removeEventListener('resize', fit)
      zoomTag.remove()
    }
  }, [])

  const open = useCallback((what = '') => {
    // A drag on the carousel ends with a click on the card under the pointer; ignore that one
    if (Math.abs(dragRef.current) > 6) return
    setInterest(what)
    setModal(true)
  }, [])

  const goTo = (i: number) => {
    dragRef.current = 0
    setOi(Math.max(0, Math.min(MAX_INDEX, i)))
    setDrag(0)
    setDragging(false)
  }

  const dragStart = (e: React.PointerEvent) => {
    if (reflow) return
    x0.current = e.clientX
    dragRef.current = 0
    setDragging(true)
    setDrag(0)
  }
  const dragMove = (e: React.PointerEvent) => {
    if (x0.current === null) return
    dragRef.current = e.clientX - x0.current
    setDrag(dragRef.current)
  }
  const dragEnd = () => {
    if (x0.current === null) return
    const d = dragRef.current
    x0.current = null
    const step = Math.abs(d) > 70 ? Math.max(1, Math.round(Math.abs(d) / (CARD_W + GAP))) : 0
    const next = d < 0 ? oi + step : oi - step
    setTimeout(() => goTo(next), 0)
  }

  // Resist dragging past either end
  let shown = drag
  if (oi === 0 && shown > 0) shown *= 0.35
  if (oi === MAX_INDEX && shown < 0) shown *= 0.35

  const togglePick = (side: 'nest' | 'eap') => setPick(p => (p === side ? '' : side))
  const onPickKey = (side: 'nest' | 'eap') => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); togglePick(side) }
  }

  const eapWrap: CSSProperties = { transformOrigin: 'right center', ...(pick === 'nest' ? { transform: 'scale(.92)', opacity: 0.5 } : pick === 'eap' ? { transform: 'scale(1.04)', opacity: 1 } : {}) }
  const nestWrap: CSSProperties = { position: 'relative', zIndex: 1, transformOrigin: 'left center', ...(pick === 'nest' ? { transform: 'scale(1.08)' } : pick === 'eap' ? { transform: 'scale(.94)', opacity: 0.6 } : {}) }

  return (
    <div className={styles.page}>
      <div className={styles.root}>
        <div id="top" className={styles.frame}>

          {/* ── Hero ── */}
          <section className={styles.hero}>
            <div style={{ position: 'absolute', right: -100, top: -140, width: 760, height: 760, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,200,160,.16) 0%, rgba(36,59,46,0) 62%)' }} />
            <svg style={{ position: 'absolute', right: 0, bottom: 0 }} width="760" height="640" viewBox="0 0 760 640" fill="none" aria-hidden="true"><circle cx="470" cy="420" r="250" stroke="rgba(232,200,160,.14)" /><circle cx="470" cy="420" r="330" stroke="rgba(232,200,160,.09)" /></svg>
            <nav className={styles.nav} aria-label="Main">
              {/* Same logo and size as the header on every other page */}
              <Link href="/" style={{ textDecoration: 'none' }} aria-label="The Nest Social home">
                <NestLogo size={22} color="#F8F0E5" />
              </Link>
              <div className={styles.navLinks}>
                <Link href="/nila">Nila</Link>
                <Link href="/allies">Allies</Link>
                <a href="#top" style={{ color: '#E8C8A0', fontWeight: 600 }} aria-current="page">For Business</a>
                <button type="button" className={cx(styles.btnLight, styles.navTalk)} onClick={() => open()}>Let’s Talk</button>
              </div>
              <button type="button" className={cx(styles.btnLight, styles.navTalk, styles.navTalkMobile)} onClick={() => open()}>Let’s Talk</button>
            </nav>
            <div className={styles.heroGrid}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div className={styles.eyebrow} style={{ display: 'flex', alignItems: 'center', gap: 14, color: '#E8C8A0' }}><span style={{ width: 28, height: 1, background: '#E8C8A0' }} />Nest for Business</div>
                <h1 className={cx(styles.serif, styles.heroTitle)}>Your People Bring<br />More to Work Than<br />Their Laptops.</h1>
                <p className={styles.heroText}>The argument at home. The manager they can’t talk to. We help workplaces, schools and colleges care for what people actually carry, with therapy, workshops and training built around them.</p>
                <div style={{ marginTop: 44, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <button type="button" className={cx(styles.btnLight, styles.heroCta)} onClick={() => open()}>Talk to Us, See How We Can Help <Arrow /></button>
                </div>
              </div>
              <div className={styles.deck} aria-hidden="true">
                {HERO_CARDS.map((c, i) => (
                  <div key={c.title} className={cx(styles.deal, styles.dealCard, i === 1 && styles.deal1, i === 2 && styles.deal2)} style={DEAL_START[i]}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: c.tagBg, color: '#243B2E', borderRadius: 999, padding: '6px 13px', fontSize: 12.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>{c.tag}</span>
                      <span style={{ width: 44, height: 44, borderRadius: 14, background: '#F0E6D8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon width={1.6}>{c.icon}</Icon></span>
                    </div>
                    <div className={styles.serif} style={{ marginTop: 18, fontSize: 25, fontWeight: 500, lineHeight: 1.2, color: '#243B2E' }}>{c.title}</div>
                    <p style={{ margin: '8px 0 0', fontSize: 14.5, lineHeight: 1.55, color: '#5A6B5F' }}>{c.text}</p>
                    <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #EDE0CD', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: '#5A6B5F' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ display: 'flex' }}>
                          {['#9B6651', '#E8C8A0', '#2F4C3A'].map((bg, j) => <span key={bg} style={{ marginLeft: j ? -8 : 0, width: 26, height: 26, borderRadius: '50%', background: bg, border: '2px solid #FBF6EE' }} />)}
                        </span>
                        Led by licensed psychologists
                      </span>
                      <span style={{ fontWeight: 600, color: '#243B2E' }}>{c.who}</span>
                    </div>
                  </div>
                ))}
                <span className={cx(styles.floaty, styles.chip)} style={{ left: 0, top: 34, background: '#9B6651', color: '#FBF6EE' }}>
                  <Icon size={16} stroke="#FBF6EE" width={2}><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.3" /></Icon>In person or online
                </span>
                <span className={cx(styles.floaty, styles.floatyLate, styles.chip)} style={{ right: 0, bottom: 30, background: '#E8C8A0', color: '#243B2E' }}>
                  <Icon size={16} stroke="#243B2E" width={2}><path d="M4 5h9M8.5 3v2M6 5c.5 3 2.5 5.5 5 7M11 5c-.5 3-3 6-6.5 7.5" /><path d="M13 20l4-9 4 9M14.5 17h5" /></Icon>In your team’s language
                </span>
              </div>
            </div>
          </section>

          {/* ── The real cost ── */}
          <section style={{ position: 'relative', overflow: 'hidden' }}>
            <div className={styles.costHead}>
              <div className={styles.eyebrow} style={{ color: '#9B6651' }}>The Real Cost</div>
              <h2 className={cx(styles.serif, styles.costTitle)}>What You See Is Only the Tip.</h2>
              <p style={{ margin: '20px auto 0', maxWidth: 640, fontSize: 18, lineHeight: 1.7, color: '#4A5A4F' }}>Most wellness programmes treat what’s visible. The real cost sits underneath, where a webinar can’t reach.</p>
            </div>
            <div className={styles.berg}>
              <div className={styles.bergAbove}>
                <div className={styles.bergLabel} style={{ top: 44, color: '#9B6651' }}>What You See</div>
                {SEEN.map(c => (
                  <div key={c.text} className={cx(styles.bergCard, styles.bergCardLight)} style={{ top: c.top, [c.side]: 'calc(120px + var(--edge))' }}>
                    <span style={{ flexShrink: 0, width: 8, height: 8, borderRadius: '50%', background: '#9B6651' }} /><span>{c.text}</span>
                  </div>
                ))}
              </div>
              <div className={styles.bergArt}>
                <svg className={styles.bergWave} width="1440" height="32" viewBox="0 0 1440 32" preserveAspectRatio="none" aria-hidden="true"><path className={styles.wave} d="M0 16 Q60 4 120 16 T240 16 T360 16 T480 16 T600 16 T720 16 T840 16 T960 16 T1080 16 T1200 16 T1320 16 T1440 16 T1560 16 V32 H0Z" fill="#243B2E" /></svg>
                <div className={cx(styles.bobIce, styles.bergIce)}>
                  <svg className={styles.bergSvg} width="560" height="600" viewBox="0 0 560 600" fill="none" aria-hidden="true">
                    <path d="M232 70 L262 30 L300 58 L330 96 L352 150 L210 150 L218 112 Z" fill="#FBF6EE" stroke="#D9C9B2" strokeWidth="2" />
                    <path d="M262 30 L300 58 L280 150 L246 150 Z" fill="#EFE6D8" />
                    <path d="M210 150 L352 150 L420 230 L470 330 L452 430 L388 520 L300 590 L210 560 L130 470 L96 360 L130 250 Z" fill="#2F4C3A" />
                    <path d="M352 150 L420 230 L470 330 L452 430 L388 520 L300 590 L330 430 L300 260 Z" fill="#26402F" />
                  </svg>
                </div>
              </div>
              <div className={styles.bergBelow}>
                <div className={styles.bergLabel} style={{ top: 352, color: '#E8C8A0' }}>What’s Actually Going On</div>
                {UNSEEN.map(c => (
                  <div key={c.text} className={cx(styles.bergCard, styles.bergCardDark)} style={{ top: c.top, [c.side]: 'calc(120px + var(--edge))' }}>
                    <span style={{ flexShrink: 0, width: 8, height: 8, borderRadius: '50%', background: '#E8C8A0' }} /><span>{c.text}</span>
                  </div>
                ))}
                <svg className={styles.bergArrow} width="24" height="84" viewBox="0 0 24 84" fill="none" aria-hidden="true"><path className={styles.nudge} d="M12 82 V6 M3 15 L12 4 L21 15" stroke="#E8C8A0" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <div className={styles.bergQuote}>
                  <p className={styles.serif} style={{ margin: 0, fontSize: 28, lineHeight: 1.4, color: '#FBF6EE' }}>We work below the waterline. <span style={{ color: '#E8C8A0', fontStyle: 'italic' }}>That’s where things actually change.</span></p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Why it matters ── */}
          <section className={styles.matters}>
            <div className={styles.mattersGrid}>
              <div>
                <div className={styles.eyebrow} style={{ color: '#9B6651' }}>Why It Matters</div>
                <h2 className={cx(styles.serif, styles.h2Big)}>Where We Spend Our Days <span style={{ color: '#9B6651', fontStyle: 'italic' }}>Comes Home With Us.</span></h2>
                <p style={{ margin: '26px 0 0', maxWidth: 560, fontSize: 18, lineHeight: 1.7, color: '#4A5A4F' }}>Most of our waking hours go to work, school or college. Around 90,000 hours over a working life. A hard day there doesn’t stay there. It follows us home, to the dinner table, into the night, and back again the next morning. That’s why care has to show up where those hours are spent.</p>
                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <div className={styles.serif} style={{ fontSize: 40, fontWeight: 500, lineHeight: 1, color: '#243B2E' }}>12 billion</div>
                    <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.55, color: '#4A5A4F' }}>working days are lost worldwide every year to depression and anxiety.</p>
                    <div style={{ marginTop: 14, fontSize: 12.5, color: '#8A8272' }}>WHO and ILO, 2022</div>
                  </div>
                  <div className={styles.stat}>
                    <div className={styles.serif} style={{ fontSize: 40, fontWeight: 500, lineHeight: 1, color: '#243B2E' }}>$14 billion</div>
                    <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.55, color: '#4A5A4F' }}>a year is what poor employee mental health costs employers in India.</p>
                    <div style={{ marginTop: 14, fontSize: 12.5, color: '#8A8272' }}>Deloitte India, 2022</div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className={styles.donut}>
                  <svg width="380" height="380" viewBox="0 0 380 380" fill="none" aria-hidden="true" style={{ overflow: 'visible' }}>
                    <circle cx="190" cy="190" r="150" stroke="#EDE0CD" strokeWidth="44" />
                    <path className={cx(styles.seg, styles.seg0)} d="M197.9 40.2 A150 150 0 0 1 323.7 258.1" stroke="#2F4C3A" strokeWidth="44" strokeLinecap="butt" fill="none" />
                    <path className={cx(styles.seg, styles.seg1)} d="M315.8 271.7 A150 150 0 0 1 47.3 236.4" stroke="#9B6651" strokeWidth="44" strokeLinecap="butt" fill="none" />
                    <path className={cx(styles.seg, styles.seg2)} d="M43.3 221.2 A150 150 0 0 1 182.1 40.2" stroke="#E8C8A0" strokeWidth="44" strokeLinecap="butt" fill="none" />
                    <text x="190" y="8" textAnchor="middle" fontSize="13" fill="#8A8272" fontFamily="DM Sans">12 am</text>
                    <text x="372" y="195" textAnchor="start" fontSize="13" fill="#8A8272" fontFamily="DM Sans">6 am</text>
                    <text x="190" y="384" textAnchor="middle" fontSize="13" fill="#8A8272" fontFamily="DM Sans">12 pm</text>
                    <text x="8" y="195" textAnchor="end" fontSize="13" fill="#8A8272" fontFamily="DM Sans">6 pm</text>
                    <g className={styles.hand} style={{ transformOrigin: '190px 190px', transform: 'rotate(195deg)' }}><circle cx="190" cy="40" r="15" fill="#FBF6EE" stroke="#243B2E" strokeWidth="3" /><circle cx="190" cy="40" r="5" fill="#9B6651" /></g>
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <div className={styles.eyebrow} style={{ fontSize: 11.5, color: '#8A8272' }}>A Working Day</div>
                    <div className={cx(styles.serif, styles.work, styles.donutNum)}>9 of 16</div>
                    <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.4, color: '#5A6B5F' }}>waking hours at work,<br />school or college</div>
                  </div>
                </div>
                <div style={{ marginTop: 40, width: 320, maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[['#2F4C3A', 'Sleep', '8 hrs'], ['#9B6651', 'Work, school or college', '9 hrs'], ['#E8C8A0', 'Everything else', '7 hrs']].map(([bg, label, hrs]) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, color: '#3E5446' }}>
                      <span style={{ width: 14, height: 14, borderRadius: 4, background: bg }} /><span style={{ flexGrow: 1 }}>{label}</span><span style={{ fontWeight: 600, color: '#243B2E' }}>{hrs}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Why we're not an EAP ── */}
          <section id="diff" className={styles.eap}>
            <div className={styles.splitHead}>
              <div>
                <div className={styles.eyebrow} style={{ color: '#9B6651' }}>Why We’re Not an EAP</div>
                <h2 className={cx(styles.serif, styles.nowrapTitle)} style={{ margin: '18px 0 0', fontWeight: 500, fontSize: 42, lineHeight: 1.14, color: '#243B2E' }}>You Don’t Need Another <span style={{ color: '#9B6651', fontStyle: 'italic' }}>EAP Line Item.</span></h2>
              </div>
              <p style={{ margin: '0 0 6px', maxWidth: 360, fontSize: 16, lineHeight: 1.7, color: '#4A5A4F' }}>Most employee assistance programmes are built to be offered. Ours is built to be used, and to change something you can see.</p>
            </div>
            <div className={styles.compare}>
              <div role="button" tabIndex={0} aria-pressed={pick === 'eap'} className={styles.compareSide} onClick={() => togglePick('eap')} onKeyDown={onPickKey('eap')} style={eapWrap}>
                <div style={{ height: '100%', boxSizing: 'border-box', background: '#1F2A22', borderRadius: 26, padding: '30px 34px 18px' }}>
                  <div className={styles.eyebrow} style={{ fontSize: 12, color: 'rgba(248,240,229,.45)' }}>The Familiar EAP</div>
                  <ul className={styles.compareList}>
                    {EAP_POINTS.map((t, i) => (
                      <li key={t} className={styles.compareItem} style={{ borderTop: i ? '1px solid rgba(248,240,229,.1)' : undefined, color: 'rgba(248,240,229,.6)' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: 3 }}><path d="M7 7l10 10M17 7L7 17" stroke="rgba(248,240,229,.4)" strokeWidth="2.4" strokeLinecap="round" /></svg><span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div role="button" tabIndex={0} aria-pressed={pick === 'nest'} className={styles.compareSide} onClick={() => togglePick('nest')} onKeyDown={onPickKey('nest')} style={nestWrap}>
                <div style={{ height: '100%', boxSizing: 'border-box', background: '#9B6651', borderRadius: 26, padding: '30px 34px 18px', boxShadow: pick === 'nest' ? '0 40px 80px rgba(155,102,81,.45)' : '0 30px 60px rgba(155,102,81,.28)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className={styles.eyebrow} style={{ fontSize: 12, color: '#E8C8A0' }}>The Nest at Work</span>
                    <span style={{ background: '#E8C8A0', color: '#243B2E', borderRadius: 999, padding: '5px 11px', fontSize: 11.5, fontWeight: 700 }}>Built to be used</span>
                  </div>
                  <ul className={styles.compareList}>
                    {NEST_POINTS.map((t, i) => (
                      <li key={t} className={styles.compareItem} style={{ borderTop: i ? '1px solid rgba(248,240,229,.1)' : undefined, color: '#FBF6EE' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: 3 }}><path d="M5 12.5l4.5 4.5L19 7.5" stroke="#E8C8A0" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg><span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <p style={{ margin: '22px 0 0', textAlign: 'center', fontSize: 14, color: '#8A8272' }}>Tap either side to compare.</p>
          </section>

          {/* ── What we offer ── */}
          <section id="offer" className={styles.offer}>
            <div className={styles.offerHead}>
              <div style={{ maxWidth: 760 }}>
                <div className={styles.eyebrow} style={{ color: '#E8C8A0' }}>What We Offer</div>
                <h2 className={styles.serif} style={{ margin: '20px 0 0', fontWeight: 500, fontSize: 46, lineHeight: 1.15 }}>One Programme, Many Ways We Show Up.</h2>
                <p style={{ margin: '22px 0 0', fontSize: 18, lineHeight: 1.7, color: 'rgba(248,240,229,.75)' }}>Individual care, collective wellbeing, team and leadership, compliance and safety. Pick what you need, or let us build the mix around your people.</p>
              </div>
              <div className={styles.offerArrows}>
                <button type="button" onClick={() => goTo(oi - 1)} aria-label="Previous" disabled={oi === 0} className={cx(styles.arrow, oi > 0 ? styles.arrowOn : styles.arrowOff)}>
                  <Icon size={20} stroke="currentColor" width={2}><path d="M15 5l-7 7 7 7" /></Icon>
                </button>
                <button type="button" onClick={() => goTo(oi + 1)} aria-label="Next" disabled={oi === MAX_INDEX} className={cx(styles.arrow, oi < MAX_INDEX ? styles.arrowOn : styles.arrowOff)}>
                  <Icon size={20} stroke="currentColor" width={2}><path d="M9 5l7 7-7 7" /></Icon>
                </button>
              </div>
            </div>
            <div
              className={styles.viewport}
              onPointerDown={dragStart} onPointerMove={dragMove} onPointerUp={dragEnd} onPointerCancel={dragEnd} onPointerLeave={dragEnd}
              style={{ cursor: reflow ? undefined : dragging ? 'grabbing' : 'grab' }}
            >
              <div
                className={styles.track}
                style={{ transform: `translateX(${-oi * (CARD_W + GAP) + shown}px)`, transition: dragging ? 'none' : 'transform .55s cubic-bezier(.2,.8,.2,1)' }}
              >
                {OFFERS.map(o => (
                  <article key={o.title} className={cx(styles.ocard, styles.offerCard)}>
                    <div className={styles.offerArt} style={{ background: o.bg }}>{o.art}</div>
                    <div style={{ padding: '26px 28px 28px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <h3 className={styles.serif} style={{ margin: 0, fontSize: 26, fontWeight: 500 }}>{o.title}</h3>
                      <p style={{ margin: '12px 0 0', fontSize: 15.5, lineHeight: 1.65, color: '#4A5A4F' }}>{o.text}</p>
                      <div style={{ marginTop: 'auto', paddingTop: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#8A8272' }}>{o.who}</span>
                        <button type="button" className={styles.ask} onClick={() => open(o.interest)} aria-label={`Ask about ${o.title}`} style={{ flexShrink: 0, width: 44, height: 44, borderRadius: '50%', border: 0, background: '#243B2E', color: '#F8F0E5', fontSize: 18, cursor: 'pointer' }}>→</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div className={styles.offerFoot}>
              <div className={styles.offerProgress} style={{ position: 'relative', flexGrow: 1, height: 3, borderRadius: 999, background: 'rgba(248,240,229,.14)' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 999, background: '#E8C8A0', transition: 'width .55s cubic-bezier(.2,.8,.2,1)', width: `${Math.round(((oi + 3) / OFFERS.length) * 100)}%` }} />
              </div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(248,240,229,.6)' }}>
                <Icon size={18} stroke="rgba(248,240,229,.6)" width={1.6}><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11M12 10V4a1.5 1.5 0 0 1 3 0v6M15 10V5.5a1.5 1.5 0 0 1 3 0V14a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7L3.5 13.5a1.5 1.5 0 0 1 2.4-1.8L9 14" /></Icon>
                {reflow ? 'Swipe to see more' : 'Drag or swipe to see more'}
              </span>
            </div>
            <div className={styles.notSure}>
              <div>
                <div className={styles.serif} style={{ fontSize: 24, fontWeight: 500 }}>Not Sure What Your Team Needs?</div>
                <p style={{ margin: '6px 0 0', fontSize: 15.5, color: 'rgba(248,240,229,.7)' }}>Tell us a little about your people. We’ll suggest the right mix after a short call.</p>
              </div>
              <button type="button" className={styles.btnLight} onClick={() => open()} style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 10, background: '#F8F0E5', color: '#243B2E', border: 0, cursor: 'pointer', fontSize: 16, fontWeight: 600, padding: '16px 28px', borderRadius: 999, whiteSpace: 'nowrap' }}>Talk to Us <Arrow /></button>
            </div>
          </section>

          {/* ── How it works ── */}
          <section className={styles.how}>
            <div className={styles.splitHead}>
              <div>
                <div className={styles.eyebrow} style={{ color: '#9B6651' }}>How It Works</div>
                <h2 className={styles.serif} style={{ margin: '18px 0 0', fontWeight: 500, fontSize: 44, lineHeight: 1.15, color: '#243B2E', whiteSpace: 'nowrap' }}>We Listen Before We Design Anything.</h2>
              </div>
              <p style={{ margin: '0 0 6px', maxWidth: 320, fontSize: 16.5, lineHeight: 1.7, color: '#4A5A4F' }}>Four steps from first call to a programme your people will actually use.</p>
            </div>
            <div className={styles.steps}>
              <svg className={styles.stepsLine} viewBox="0 0 900 2" preserveAspectRatio="none" aria-hidden="true"><path d="M0 1 H900" stroke="#E2D3BC" strokeWidth="2" strokeDasharray="5 6" /></svg>
              {STEPS.map((s, i) => (
                <div key={s.title} className={styles.stepCard}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className={cx(styles.serif, styles.stepNum, STEP_CLASS[i])}>{i + 1}</span>
                    <span style={{ width: 44, height: 44, borderRadius: 14, background: '#F0E6D8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon>{s.icon}</Icon></span>
                  </div>
                  <h3 className={styles.serif} style={{ margin: '26px 0 0', fontSize: 22, fontWeight: 500, lineHeight: 1.25, color: '#243B2E' }}>{s.title}</h3>
                  <p style={{ margin: '12px 0 0', fontSize: 15.5, lineHeight: 1.65, color: '#4A5A4F' }}>{s.text}</p>
                </div>
              ))}
            </div>
            <div className={styles.scoped}>
              <Icon stroke="#E8C8A0"><path d="M3 12h4l3-8 4 16 3-8h4" /></Icon>
              <p style={{ margin: 0, fontSize: 16.5, lineHeight: 1.6 }}>Every engagement is scoped and priced after the discovery call. <span style={{ color: '#E8C8A0' }}>No templated packages, no off-the-shelf pricing.</span></p>
            </div>
          </section>

          {/* ── Why Nest ── */}
          <section className={styles.whyNest}>
            <div>
              <div className={styles.eyebrow} style={{ color: '#9B6651' }}>Why Nest</div>
              <h2 className={styles.serif} style={{ margin: '20px 0 0', fontWeight: 500, fontSize: 46, lineHeight: 1.15, color: '#243B2E' }}>Built by People Who’ve Actually Sat in the Room.</h2>
              <p style={{ margin: '22px 0 0', fontSize: 18, lineHeight: 1.7, color: '#4A5A4F' }}>A founder-led team that has worked inside many workplace cultures, and knows people only open up when they feel safe.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
              {WHY_NEST.map(w => (
                <div key={w.title} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                  <span style={{ flexShrink: 0, width: 52, height: 52, borderRadius: 16, background: '#FBF6EE', border: '1px solid #E2D3BC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={24} width={1.6}>{w.icon}</Icon></span>
                  <div>
                    <h3 className={styles.serif} style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 500, color: '#243B2E' }}>{w.title}</h3>
                    <p style={{ margin: '8px 0 0', fontSize: 15.5, lineHeight: 1.65, color: '#4A5A4F' }}>{w.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Let's talk ── */}
          <section className={styles.cta}>
            <div className={styles.ctaCard}>
              <div style={{ position: 'absolute', left: -140, bottom: -200, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(92,122,102,.55) 0%, rgba(36,59,46,0) 65%)' }} />
              <div style={{ position: 'absolute', right: -140, top: -200, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(155,102,81,.35) 0%, rgba(36,59,46,0) 65%)' }} />
              <div className={styles.eyebrow} style={{ position: 'relative', color: '#E8C8A0' }}>Let’s Talk</div>
              <h2 className={cx(styles.serif, styles.ctaTitle)}>Good Workplaces Don’t Happen by Accident.</h2>
              <p style={{ position: 'relative', margin: '22px 0 0', maxWidth: 600, fontSize: 18, lineHeight: 1.7, color: 'rgba(248,240,229,.78)' }}>Let’s build yours on purpose. It starts with a discovery call, and we only propose what fits your people.</p>
              <button type="button" className={cx(styles.btnLight, styles.heroCta)} onClick={() => open()} style={{ position: 'relative', marginTop: 40, padding: '18px 36px' }}>Talk to Us, See How We Can Help <Arrow /></button>
            </div>
          </section>

          {/* ── Helplines ── */}
          <div className={styles.helplines}>
            <span className={styles.serif} style={{ fontStyle: 'italic', fontSize: 17, color: '#F8F0E5', marginRight: 6 }}>If tonight is really hard:</span>
            {HELPLINES.map(h => (
              <a key={h.href} href={h.href} className={styles.helpline}><strong style={{ fontWeight: 600, color: '#E8C8A0' }}>{h.name}</strong>&nbsp; {h.num}</a>
            ))}
            <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className={styles.helpline} style={{ color: '#E8C8A0' }}>findahelpline.com ↗</a>
            <span className={styles.serif} style={{ fontSize: 16, fontStyle: 'italic', color: '#E8C8A0', marginLeft: 'auto', paddingLeft: 12 }}>You matter.</span>
          </div>

          {/* ── Footer ── */}
          <footer className={styles.footer}>
            <Link href="/" style={{ textDecoration: 'none' }} aria-label="The Nest Social home">
              <NestLogo size={20} color="#F8F0E5" />
            </Link>
            <p className={styles.serif} style={{ margin: '14px 0 0', fontStyle: 'italic', fontSize: 16, color: 'rgba(248,240,229,.6)' }}>Made with a lot of care, for the in-between days.</p>
            <div className={styles.footerContact}>
              <a href="tel:7550096933">
                <Icon size={17} stroke="currentColor" width={1.7}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></Icon>7550096933
              </a>
              <span style={{ color: 'rgba(248,240,229,.3)' }}>·</span>
              <a href="mailto:care@thenestsocial.com">
                <Icon size={17} stroke="currentColor" width={1.7}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></Icon>care@thenestsocial.com
              </a>
            </div>
            <div style={{ width: '100%', height: 1, background: 'rgba(248,240,229,.12)', margin: '56px 0 28px' }} />
            <div className={styles.footerBottom}>
              <span>© 2026 The Nest Social. All rights reserved.</span>
              <div className={styles.footerLinks}>
                <Link href="/legal/privacy">Privacy Policy</Link>
                <Link href="/legal/terms">Terms &amp; Conditions</Link>
                <Link href="/legal/cancellation-refund">Cancellation &amp; Refund</Link>
              </div>
            </div>
          </footer>

          {modal && <ContactModal initialInterest={interest} onClose={() => setModal(false)} />}
        </div>
      </div>
    </div>
  )
}
