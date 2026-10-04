import PublicHeader from '@/components/layout/PublicHeader'
import LandingHelpline from '@/components/layout/LandingHelpline'
import LandingFooter from '@/components/layout/LandingFooter'
import styles from '@/components/layout/guestLanding.module.css'
import NilaFAQ from './NilaFAQ'
import type { PlanConfig } from '@/components/plans/PlanCard'

interface NilaLandingProps {
  plans: PlanConfig[]
}

// Shown only if the plans table is empty, so the section never disappears.
const FALLBACK_PLANS: PlanConfig[] = [
  { id: 'begin', name: 'Begin', price: '₹0', tag: '', cta: 'Talk to Nila →', features: ['10 conversations with Nila per day', 'Mood check-in and tracking'] },
  { id: 'moonlit', name: 'Moonlit', price: '₹99', tag: 'MOST CHOSEN', cta: 'Start Moonlit', isFeatured: true, features: ['Everything in Begin', 'Nila, with extended conversations', 'Access to resources'] },
]

/* ── Nila moon mark ── */
function NilaMark({ size = 18, color = '#E8C8A0' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 240 240" fill="none" aria-hidden="true">
      <path d="M150 62a66 66 0 1 0 0 116 82 82 0 0 1 0-116Z" fill={color} />
    </svg>
  )
}

function Check({ color = '#2F4C3A' }: { color?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8.5l3 3 7-7.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Cross() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 4l8 8M12 4l-8 8" stroke="#A85D3C" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

const ICON = { stroke: '#E8C8A0', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

const STEPS = [
  {
    icon: <path d="M12 22V14M12 14C12 10 16 6 20 6C20 10 16 14 12 14ZM12 14C12 10 8 6 4 6C4 10 8 14 12 14Z" {...ICON} />,
    title: 'You Start Wherever You Are',
    body: 'No structure, no right way to begin. Just the thing that has been sitting on your chest.',
  },
  {
    icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" {...ICON} />,
    title: 'Nila Listens, Then Asks',
    body: 'Not to analyse you. Just to understand what is underneath, before anything else.',
  },
  {
    icon: (
      <>
        <circle cx="12" cy="12" r="4" {...ICON} />
        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" {...ICON} />
      </>
    ),
    title: 'You Feel a Little Heard',
    body: 'Sometimes that is enough to feel a little lighter. Or a little clearer. Or both.',
  },
  {
    icon: <path d="M13 4a2 2 0 1 0 0-.01M10 21l2-6 3 3v3M8 12l3-4 4 3 3 1M11 8l-2 6" {...ICON} />,
    title: 'When You Are Ready, She Will Walk With You',
    body: 'Toward an ally, toward a next step, or simply toward yourself.',
  },
  {
    icon: (
      <>
        <rect x="5" y="11" width="14" height="11" rx="2" {...ICON} />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" {...ICON} />
      </>
    ),
    title: 'Your Privacy Matters',
    body: "Your conversations are private, secure, and never shared. Nila doesn't store your personal data or share it with anyone.",
  },
]

const PANEL = [
  { side: 'nila', text: 'Hey, how are you actually doing tonight?' },
  { side: 'user', text: "Not great. I don't even know where to start." },
  { side: 'nila', text: "That's okay. You don't have to know. Just start wherever you are." },
  { side: 'user', text: "It's been a really hard few weeks. I've been overthinking everything and it's exhausting." },
  { side: 'nila', text: 'That sounds really heavy. Want to tell me a little more?' },
] as const

export default function NilaLanding({ plans }: NilaLandingProps) {
  const planList = plans.length > 0 ? plans : FALLBACK_PLANS

  return (
    <div className={styles.page}>
      <PublicHeader dark />

      <main>
        {/* ── HERO ── */}
        <section className={`${styles.hero} ${styles.heroFlush}`} aria-label="Meet Nila">
          <div className={styles.container}>
            <div className={styles.heroInner}>
              <div>
                <p className={`${styles.eyebrow} ${styles.eyebrowLine}`}>Meet Nila</p>
                <h1 className={styles.heroTitle}>
                  What If the Moon Could <em>Talk Back?</em>
                </h1>
                <p className={styles.heroSub}>
                  We&apos;ve always had our late night conversations with the moon. So we wondered:
                  what if it could talk back? A warm place to land at 2am, until you&apos;re ready
                  to find your way back to the people around you.
                </p>
                <a href="/signup" className={`${styles.btn} ${styles.btnLight} ${styles.btnBlock}`}>
                  Let Nila Be There for You →
                </a>
              </div>

              <div className={`${styles.heroArt} ${styles.heroArtBleed}`}>
                <svg viewBox="0 0 760 520" fill="none" overflow="visible" aria-hidden="true">
                  <defs>
                    <mask id="nilaCrescent">
                      <rect width="760" height="520" fill="#fff" />
                      <circle cx="614" cy="116" r="56" fill="#000" />
                    </mask>
                    <linearGradient id="nilaHillFadeGrad" gradientUnits="userSpaceOnUse" x1="-420" y1="0" x2="140" y2="0">
                      <stop offset="0" stopColor="#fff" stopOpacity="0" />
                      <stop offset="1" stopColor="#fff" stopOpacity="1" />
                    </linearGradient>
                    <mask id="nilaHillFade" maskUnits="userSpaceOnUse" x="-800" y="0" width="2400" height="600">
                      <rect x="-800" y="0" width="2400" height="600" fill="url(#nilaHillFadeGrad)" />
                    </mask>
                  </defs>

                  {/* Stars */}
                  <g fill="#E8C8A0">
                    <circle cx="60" cy="40" r="1.4" opacity="0.6" />
                    <circle cx="250" cy="22" r="1.2" opacity="0.5" />
                    <circle cx="330" cy="110" r="1.3" opacity="0.5" />
                    <circle cx="455" cy="60" r="1.1" opacity="0.5" />
                    <circle cx="300" cy="210" r="1.2" opacity="0.45" />
                    <circle cx="730" cy="40" r="1.3" opacity="0.55" />
                    <circle cx="745" cy="290" r="1.2" opacity="0.45" />
                    <circle cx="170" cy="140" r="1" opacity="0.4" />
                    <path d="M410 238 l1.6 -4.6 l1.6 4.6 l4.6 1.6 l-4.6 1.6 l-1.6 4.6 l-1.6 -4.6 l-4.6 -1.6Z" opacity="0.8" />
                    <path d="M712 206 l1.4 -4 l1.4 4 l4 1.4 l-4 1.4 l-1.4 4 l-1.4 -4 l-4 -1.4Z" opacity="0.7" />
                  </g>

                  {/* Moon with glow and sleepy face */}
                  <circle cx="584" cy="150" r="140" fill="#E8C8A0" opacity="0.05" />
                  <circle cx="584" cy="150" r="104" fill="#E8C8A0" opacity="0.07" />
                  <circle cx="584" cy="150" r="80" fill="#E8C8A0" opacity="0.08" />
                  <circle cx="584" cy="150" r="64" fill="#EFDFBE" mask="url(#nilaCrescent)" />
                  <path d="M538 136 Q546 144 555 137" stroke="#8A6E50" strokeWidth="2" strokeLinecap="round" />
                  <path d="M556 176 Q566 184 578 178" stroke="#8A6E50" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="548" cy="160" r="5" fill="#E2A98C" opacity="0.35" />

                  {/* "I'm here." bubble */}
                  <rect x="396" y="128" width="104" height="42" rx="14" fill="#F2E6CF" />
                  <path d="M498 140 L516 149 L498 158Z" fill="#F2E6CF" />
                  <text x="448" y="155" textAnchor="middle" fontFamily="Lora,Georgia,serif" fontSize="17" fontStyle="italic" fill="#2F4C3A">I&apos;m here.</text>

                  {/* Distant hills */}
                  <g mask="url(#nilaHillFade)">
                    <path d="M-760 360 Q-380 330 0 352 Q170 312 340 338 Q520 366 760 318 Q1100 270 1500 320 V520 H-760Z" fill="#2C4637" opacity="0.85" />
                    <path d="M-760 400 Q-360 380 0 392 Q210 360 430 382 Q600 398 760 372 Q1100 340 1500 380 V520 H-760Z" fill="#26402F" />
                  </g>

                  {/* Town and its reflection */}
                  <rect x="540" y="404" width="900" height="40" fill="#30503D" opacity="0.6" />
                  <g fill="#18291F">
                    <path d="M556 404 V382 L568 370 L580 382 V404Z" />
                    <path d="M582 404 V388 H604 V404Z" />
                    <path d="M606 404 V376 L618 364 L630 376 V404Z" />
                    <path d="M632 404 V386 L646 374 L660 386 V404Z" />
                    <path d="M662 404 V380 H684 V404Z" />
                    <ellipse cx="700" cy="384" rx="11" ry="24" />
                    <path d="M714 404 V384 L728 372 L742 384 V404Z" />
                    <path d="M744 404 V390 H760 V404Z" />
                  </g>
                  <g fill="#E8D090">
                    <rect x="565" y="388" width="5" height="6" rx="1" />
                    <rect x="590" y="393" width="5" height="6" rx="1" />
                    <rect x="615" y="382" width="5" height="6" rx="1" />
                    <rect x="642" y="390" width="5" height="6" rx="1" />
                    <rect x="670" y="388" width="5" height="6" rx="1" />
                    <rect x="725" y="390" width="5" height="6" rx="1" />
                  </g>
                  <g stroke="#E8D090" strokeWidth="1.4" strokeLinecap="round" opacity="0.35">
                    <path d="M567 412 V424 M592 412 V420 M617 412 V428 M644 412 V422 M672 412 V426 M727 412 V420" />
                  </g>

                  {/* Foreground hill */}
                  <path d="M-200 540 Q0 500 130 448 Q200 426 320 418 Q470 404 570 438 Q680 474 760 462 Q1000 440 1500 470 V540Z" fill="#1C3025" />

                  {/* "It's been a really hard day..." bubble */}
                  <rect x="268" y="214" width="178" height="62" rx="12" fill="#1B2D23" stroke="#4F6A5A" strokeWidth="1" />
                  <path d="M362 275 L374 290 L386 275" fill="#1B2D23" stroke="#4F6A5A" strokeWidth="1" strokeLinejoin="round" />
                  <rect x="363" y="272" width="22" height="4" fill="#1B2D23" />
                  <text x="284" y="240" fontFamily="DM Sans,sans-serif" fontSize="13" fill="#F0EAE0">It&apos;s been a really hard</text>
                  <text x="284" y="260" fontFamily="DM Sans,sans-serif" fontSize="13" fill="#F0EAE0">day...</text>

                  {/* Cup with steam */}
                  <rect x="306" y="404" width="17" height="16" rx="2.5" fill="#E8C8A0" />
                  <path d="M323 408 Q330 408 330 412.5 Q330 417 323 417" stroke="#E8C8A0" strokeWidth="2" fill="none" />
                  <path d="M311 398 Q307 392 311 386 Q315 380 311 374 M318 398 Q315 393 318 388" stroke="#E8C8A0" strokeWidth="1.3" strokeLinecap="round" opacity="0.6" />

                  {/* Person sitting on the hill, facing the moon */}
                  <path d="M390 414 L424 386 L456 412" stroke="#121C16" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
                  <ellipse cx="462" cy="414" rx="10" ry="4.5" fill="#F2E6CF" />
                  <path d="M350 420 Q346 378 360 356 Q376 340 392 350 Q404 366 402 420Z" fill="#7C9A80" />
                  <path d="M392 362 Q408 380 422 390" stroke="#6E8C72" strokeWidth="10" strokeLinecap="round" />
                  <circle cx="376" cy="332" r="15" fill="#18140F" />
                  <path d="M362 330 Q364 314 378 316 Q390 318 391 330" fill="#0F0C08" />

                  {/* Foreground leaves */}
                  <g fill="#14251B">
                    <path d="M70 520 Q80 452 140 418 Q124 474 110 520Z" />
                    <path d="M118 520 Q150 470 210 452 Q176 492 160 520Z" />
                    <path d="M30 520 Q30 480 62 456 Q58 492 60 520Z" />
                    <path d="M716 520 Q722 478 752 452 Q748 492 746 520Z" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* ── START HERE / RANT MODE ── */}
        <section className={`${styles.sectionAlt} ${styles.center}`}>
          <div className={styles.container}>
            <p className={styles.eyebrow}>Start Here</p>
            <h2 className={styles.title}>Sometimes You Don&apos;t Need a Solution.</h2>
            <p className={styles.sub}>You just need somewhere to put it all down, and feel heard.</p>

            <div className={styles.rantCard}>
              <svg className={styles.rantRings} width="300" height="300" viewBox="0 0 300 300" fill="none" aria-hidden="true">
                <circle cx="150" cy="150" r="145" stroke="#E8C8A0" strokeWidth="1.5" />
                <circle cx="150" cy="150" r="108" stroke="#E8C8A0" strokeWidth="1" />
                <circle cx="150" cy="150" r="72" stroke="#E8C8A0" strokeWidth="1" />
              </svg>
              <div>
                <span className={styles.rantTag}>
                  <NilaMark size={14} />
                  RANT MODE
                </span>
                <h3 className={styles.rantTitle}>Let Everything Out.</h3>
                <p className={styles.rantBody}>Nila listens without interrupting, without fixing, without judging.</p>
              </div>
              <div className={styles.chat}>
                <div className={styles.bubbleUser}>I don&apos;t even know where to begin.</div>
                <div className={styles.bubbleNilaRow}>
                  <span className={styles.nilaAvatar}><NilaMark size={14} /></span>
                  <div className={styles.bubbleNila}>That&apos;s okay. Just start wherever you are.</div>
                </div>
              </div>
            </div>

            <div className={styles.soonGrid}>
              {[
                {
                  title: 'Figure It Out',
                  sub: 'Think out loud. Find the root of it.',
                  icon: (
                    <svg width="22" height="16" viewBox="0 0 28 20" fill="none" aria-hidden="true">
                      <path d="M1 10 L4.5 10 L7 3 L10 17 L13 7 L15.5 13 L18 10 L21.5 10" stroke="#2F4C3A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                },
                {
                  title: 'Friend',
                  sub: 'Easy company on hard nights.',
                  icon: (
                    <svg width="22" height="18" viewBox="0 0 28 22" fill="none" aria-hidden="true">
                      <circle cx="10" cy="6" r="4.5" stroke="#2F4C3A" strokeWidth="1.6" />
                      <path d="M2 21v-1.5A5.5 5.5 0 0 1 7.5 14h5A5.5 5.5 0 0 1 18 19.5V21" stroke="#2F4C3A" strokeWidth="1.6" strokeLinecap="round" />
                      <circle cx="21" cy="6" r="3" stroke="#2F4C3A" strokeWidth="1.6" opacity="0.55" />
                      <path d="M25 21v-1a4 4 0 0 0-3.5-3.97" stroke="#2F4C3A" strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />
                    </svg>
                  ),
                },
              ].map((card) => (
                <div key={card.title} className={styles.soonCard}>
                  <span className={styles.soonIcon}>{card.icon}</span>
                  <div>
                    <p className={styles.soonTitle}>{card.title}</p>
                    <p className={styles.soonSub}>{card.sub}</p>
                  </div>
                  <span className={styles.soonBadge}>Coming Soon</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className={styles.sectionDark}>
          <div className={styles.container}>
            <div className={styles.howGrid}>
              <div>
                <p className={styles.eyebrow}>How It Works</p>
                <h2 className={styles.howTitle}>You Talk. She <em>Listens.</em></h2>
                <p className={styles.howSub}>That is most of it, honestly.</p>
                <div className={styles.howSteps}>
                  {STEPS.map((step) => (
                    <div key={step.title} className={styles.howStep}>
                      <span className={styles.howIcon}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">{step.icon}</svg>
                      </span>
                      <div>
                        <p className={styles.howStepTitle}>{step.title}</p>
                        <p className={styles.howStepBody}>{step.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.panel} aria-label="Example conversation with Nila">
                <div className={styles.panelHead}>
                  <span className={styles.nilaAvatar} style={{ width: 38, height: 38 }}><NilaMark size={16} /></span>
                  <div>
                    <div className={styles.panelName}>Nila</div>
                    <div className={styles.panelStatus}>Here for you, always</div>
                  </div>
                </div>
                {PANEL.map((m, i) => (
                  <div
                    key={i}
                    className={`ns-b${i + 1} ${styles.panelMsg} ${m.side === 'nila' ? styles.panelMsgNila : styles.panelMsgUser}`}
                  >
                    {m.text}
                  </div>
                ))}
                <div className={`ns-b6 ${styles.panelMsg} ${styles.panelMsgNila}`}>
                  <span className="ns-typing-dot" />
                  <span className="ns-typing-dot" />
                  <span className="ns-typing-dot" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── COMPANION, NOT A REPLACEMENT ── */}
        <section className={styles.section}>
          <div className={styles.container}>
            <p className={styles.eyebrow}>A Companion, Not a Replacement</p>
            <h2 className={styles.title} style={{ maxWidth: '24ch', marginBottom: 36 }}>
              Nila Is Built to Hand You Back to Real People.
            </h2>
            <div className={styles.compare}>
              <div className={styles.compareCol}>
                <p className={styles.compareHead} style={{ color: '#5C7A66' }}>NILA WILL</p>
                <ul className={styles.compareList}>
                  {['Listen without judgment', 'Help you feel less alone', 'Point you toward real support'].map((item) => (
                    <li key={item} className={styles.compareItem}>
                      <span className={styles.compareMark} style={{ background: 'rgba(47,76,58,0.1)' }}><Check /></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={styles.compareCol}>
                <p className={styles.compareHead} style={{ color: '#A85D3C' }}>NILA WON&apos;T</p>
                <ul className={styles.compareList}>
                  {['Diagnose or prescribe', 'Replace a real human', 'Encourage dependency'].map((item) => (
                    <li key={item} className={styles.compareItem}>
                      <span className={styles.compareMark} style={{ background: 'rgba(168,93,60,0.1)' }}><Cross /></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── PLANS ── */}
        <section className={`${styles.sectionAlt} ${styles.center}`}>
          <div className={styles.container}>
            <h2 className={styles.title}>Choose What Feels Right</h2>
            <p className={styles.sub}>Start free. Go deeper when you&apos;re ready.</p>

            <div className={styles.plans}>
              {planList.map((plan) => {
                const isFree = plan.price === '₹0'
                const featured = !!plan.isFeatured
                return (
                  <div key={plan.id} className={`${styles.plan} ${featured ? styles.planFeatured : ''}`}>
                    {featured && <span className={styles.planTag}>{plan.tag || 'MOST CHOSEN'}</span>}
                    <p className={styles.planName}>{plan.name}</p>
                    <div>
                      <span className={styles.planPrice}>{plan.price}</span>
                      <span className={styles.planPer}>{isFree ? 'always' : '/month'}</span>
                    </div>
                    <ul className={styles.planList}>
                      {(plan.features ?? []).map((f) => (
                        <li key={f} className={styles.planItem}>
                          <span className={styles.planCheck}><Check color={featured ? '#E8C8A0' : '#2F4C3A'} /></span>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <a
                      href="/signup"
                      className={`${styles.btn} ${featured ? styles.btnTerra : styles.btnOutline}`}
                    >
                      {plan.cta || (isFree ? 'Talk to Nila →' : `Start ${plan.name}`)}
                    </a>
                  </div>
                )
              })}
            </div>

            <p className={styles.planNote}>No commitment. Cancel anytime. Your conversations stay with you.</p>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className={`${styles.section} ${styles.center}`}>
          <div className={styles.container}>
            <p className={styles.eyebrow}>Before You Start</p>
            <h2 className={styles.title} style={{ marginBottom: 40 }}>A Few Things Worth Knowing</h2>
            <NilaFAQ />
          </div>
        </section>

        {/* ── CTA ── */}
        <section className={`${styles.sectionDark} ${styles.cta}`}>
          <div className={styles.container}>
            <h2 className={styles.ctaTitle}>
              The Moon Has Been Listening. <em>Now She Answers.</em>
            </h2>
            <a href="/signup" className={`${styles.btn} ${styles.btnTerra} ${styles.btnBlock}`}>
              Start Talking to Nila →
            </a>
          </div>
        </section>
      </main>

      <LandingHelpline />
      <LandingFooter />
    </div>
  )
}
