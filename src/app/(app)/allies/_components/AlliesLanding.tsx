import Image from 'next/image'
import PublicHeader from '@/components/layout/PublicHeader'
import LandingHelpline from '@/components/layout/LandingHelpline'
import LandingFooter from '@/components/layout/LandingFooter'
import styles from '@/components/layout/guestLanding.module.css'
import type { AllyPublicProfile } from '@/types/findAllies'

interface AlliesLandingProps {
  featuredAllies: AllyPublicProfile[]
}

const ICON = { strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

const WAYS = [
  {
    title: 'A Short Check-In',
    body: 'Answer a few honest questions and we suggest allies who actually fit. No diagnosis needed.',
    icon: (
      <>
        <rect x="6" y="4" width="12" height="17" rx="2" stroke="#E8C8A0" {...ICON} />
        <path d="M9 4.5V3h6v1.5M9 11l2 2 4-4M9 17h6" stroke="#E8C8A0" {...ICON} />
      </>
    ),
  },
  {
    title: 'Browse Yourself',
    body: 'Prefer to look first? Read profiles in their own words and pick who feels right.',
    icon: (
      <>
        <circle cx="11" cy="11" r="6.5" stroke="#E8C8A0" {...ICON} />
        <path d="M16 16l4.5 4.5" stroke="#E8C8A0" {...ICON} />
      </>
    ),
  },
  {
    title: 'Talk to a Person',
    body: 'Message a healing buddy on WhatsApp and a human helps you decide. No bots, no queue.',
    icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#E8C8A0" {...ICON} />,
  },
]

const EXPECT = [
  {
    text: '55-minute sessions, online',
    icon: (
      <>
        <circle cx="12" cy="12" r="8.5" stroke="#E8C8A0" {...ICON} />
        <path d="M12 7.5V12l3 2" stroke="#E8C8A0" {...ICON} />
      </>
    ),
  },
  {
    text: 'Licensed, verified practitioners only',
    icon: <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3zM9 12l2 2 4-4" stroke="#E8C8A0" {...ICON} />,
  },
  {
    text: 'Free rematching, whenever you need it',
    icon: <path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4" stroke="#E8C8A0" {...ICON} />,
  },
  {
    text: 'Sessions in Tamil, English, Hindi, Telugu, and more',
    icon: (
      <>
        <circle cx="12" cy="12" r="8.5" stroke="#E8C8A0" {...ICON} />
        <path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.5 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.5-3.5-8.5s1-6 3.5-8.5z" stroke="#E8C8A0" {...ICON} />
      </>
    ),
  },
]

export default function AlliesLanding({ featuredAllies }: AlliesLandingProps) {
  return (
    <div className={styles.page}>
      <PublicHeader dark />

      <main>
        {/* ── HERO ── */}
        <section className={`${styles.hero} ${styles.heroGlow}`} aria-label="The ally programme">
          <div className={styles.container}>
            <div className={styles.heroInner}>
              <div>
                <p className={`${styles.eyebrow} ${styles.eyebrowLine}`}>The Ally Programme</p>
                <h1 className={styles.heroTitle}>
                  A Real Person, <em>Matched</em> to You.
                </h1>
                <p className={styles.heroSub}>
                  Every ally is a licensed, credentialed psychologist or counsellor, RCI, NMC or IACP
                  registered. No self-declared coaches, no guesswork. Just warm, trained people who fit
                  the shape of what you&apos;re carrying.
                </p>
                <a href="/signup" className={`${styles.btn} ${styles.btnLight} ${styles.btnBlock}`}>
                  Find an Ally →
                </a>
              </div>

              <div className={styles.heroArt}>
                <svg viewBox="0 0 620 450" fill="none" aria-hidden="true">
                  <g stroke="#C9A97C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {/* Floor shadow */}
                    <ellipse cx="305" cy="434" rx="300" ry="11" fill="#17291F" stroke="none" />

                    {/* Arch with moon and hill */}
                    <path d="M208 422 V115 A107.5 107.5 0 0 1 423 115 V422" fill="#1A2E24" />
                    <path d="M210 362 Q262 344 316 352 Q372 360 421 344 V420 H210Z" fill="#284234" stroke="none" />
                    <circle className={styles.glowMoon} cx="316" cy="93" r="38" fill="#E8C8A0" stroke="none" />

                    {/* Thought line joining the two bubbles */}
                    <path className={styles.flowLine} d="M164 160 C204 188 240 176 280 166 S356 190 420 178 S496 156 516 148" strokeWidth="1.2" opacity="0.55" />

                    {/* You: tangled thoughts */}
                    <text x="126" y="70" textAnchor="middle" stroke="none" fill="#E8C8A0" fontFamily="DM Sans,sans-serif" fontSize="13" fontWeight="600" letterSpacing="2.5">YOU</text>
                    <circle cx="126" cy="133" r="46" />
                    <path d="M140 176 L160 198 L150 177" />
                    <path className={styles.wobble} d="M132.6 151.7 L133.7 152.4 L134.4 152.6 L134.6 152.4 L134.2 151.9 L133.2 151.1 L131.8 150.3 L130.1 149.5 L128.4 148.8 L126.9 148.2 L125.8 147.8 L125.3 147.5 L125.6 147.2 L126.6 146.8 L128.3 146.1 L130.6 145.0 L133.1 143.4 L135.8 141.4 L138.3 138.9 L140.6 135.9 L142.4 132.7 L143.8 129.3 L144.9 126.0 L145.6 123.0 L146.2 120.3 L146.8 118.2 L147.5 116.8 L148.4 115.9 L149.5 115.6 L150.7 115.8 L151.9 116.3 L152.9 117.0 L153.5 117.7 L153.6 118.3 L153.0 118.7 L151.7 118.9 L149.7 118.8 L147.2 118.6 L144.3 118.3 L141.3 118.1 L138.5 118.0 L136.0 118.2 L134.1 118.7 L132.9 119.6 L132.4 120.7 L132.5 122.0 L133.1 123.4 L134.0 124.7 L134.9 125.7 L135.8 126.3 L136.4 126.5 L136.7 126.1 L136.6 125.1 L136.4 123.7 L135.9 122.0 L135.5 120.1 L135.2 118.2 L135.1 116.6 L135.4 115.2 L135.9 114.4 L136.5 114.1 L137.2 114.3 L137.7 115.0 L137.7 116.1 L137.2 117.5 L136.0 119.0 L134.1 120.4 L131.5 121.8 L128.3 123.0 L124.8 124.1 L121.2 125.0 L117.7 125.8 L114.6 126.7 L112.1 127.8 L110.2 129.2 L109.0 130.9 L108.4 133.1 L108.3 135.6 L108.5 138.5 L108.8 141.5 L109.0 144.6 L109.1 147.5 L109.0 150.2 L108.7 152.3 L108.3 153.8 L108.0 154.7 L107.9 154.9 L108.1 154.5 L108.7 153.6 L109.7 152.4 L111.1 151.1 L112.8 149.8 L114.5 148.6 L116.0 147.7 L117.2 147.0 L117.9 146.7 L117.8 146.6 L117.0 146.6 L115.5 146.7 L113.5 146.7 L111.1 146.4 L108.6 146.0 L106.2 145.2 L104.2 144.2 L102.8 143.1 L101.9 141.9 L101.7 140.7 L102.0 139.9 L102.6 139.4 L103.6 139.3 L104.5 139.8 L105.4 140.7 L106.2 142.1 L106.8 143.7 L107.3 145.4 L107.8 147.1 L108.5 148.4 L109.5 149.4 L110.9 149.8 L112.8 149.7 L115.3 148.9 L118.1 147.6 L121.3 145.9 L124.5 144.0 L127.6 141.9 L130.2 139.8 L132.2 137.8 L133.5 136.1 L134.0 134.6 L133.8 133.3 L133.0 132.2 L131.7 131.0 L130.3 129.8 L129.0 128.4 L127.9 126.8 L127.2 124.8 L127.0 122.5 L127.2 120.0 L127.8 117.5 L128.6 114.9 L129.5 112.5 L130.3 110.6 L131.0 109.1 L131.4 108.3 L131.6 108.2 L131.7 108.7 L131.8 109.7 L132.1 111.3 L132.8 113.1 L134.0 115.1 L135.8 116.9 L138.1 118.6 L140.8 119.9 L143.8 120.9 L146.9 121.5 L149.7 121.7 L152.1 121.8 L153.9 121.7 L154.9 121.7 L155.1 121.8 L154.5 122.2 L153.3 122.7 L151.6 123.5 L149.7 124.5 L147.8 125.5 L146.1 126.5 L144.7 127.2 L143.6 127.6 L142.8 127.7 L142.3 127.2 L141.8 126.4 L141.2 125.2 L140.4 123.8 L139.3 122.4 L138.0 121.1 L136.5 120.1 L134.8 119.6 L133.2 119.6 L131.9 120.3 L131.1 121.6 L130.8 123.4 L131.2 125.6 L132.2 128.1 L133.8 130.7 L135.7 133.2 L137.6 135.5 L139.5 137.6 L140.9 139.3 L141.8 140.8 L141.9 142.0 L141.3 143.1 L140.0 144.1 L138.2 145.2 L136.0 146.5 L133.7 148.0 L131.4 149.8 L129.2 151.7 L127.4 153.6 L125.8 155.4 L124.4 157.1 L123.2 158.3 L121.9 159.0 L120.6 159.0 L118.9 158.5 L116.9 157.3 L114.7 155.5 L112.3 153.4 L109.8 151.0 L107.5 148.6 L105.6 146.4 L104.3 144.4 L103.6 142.8 L103.8 141.7 L104.6 141.0 L106.2 140.8 L108.1 140.8 L110.3 140.9 L112.4 141.1 L114.3 141.2 L115.6 141.1 L116.4 140.8 L116.6 140.2 L116.2 139.4 L115.4 138.6 L114.3 137.7 L113.2 137.0 L112.2 136.6 L111.4 136.6 L110.8 136.9 L110.5 137.5 L110.4 138.4 L110.3 139.5 L110.1 140.6 L109.6 141.5 L108.8 142.1 L107.7 142.1 L106.1 141.6 L104.4 140.5 L102.7 138.8 L101.1 136.5 L100.0 133.9 L99.5 131.0 L99.7 128.1 L100.8 125.4 L102.7 122.9 L105.2 120.8 L108.2 119.1 L111.4 117.7 L114.6 116.8 L117.5 116.0 L120.1 115.4 L122.1 114.8 L123.6 114.1 L124.7 113.2 L125.3 112.2 L125.8 111.1 L126.3 109.9 L126.9 108.9 L127.6 108.0 L128.6 107.6 L129.7 107.6 L130.8 108.3 L131.8 109.5 L132.6 111.3 L132.9 113.5 L132.7 116.1 L132.0 118.8 L130.9 121.5 L129.4 124.0 L127.8 126.1 L126.4 127.7 L125.2 128.8 L124.7 129.3 L124.9 129.5 L125.8 129.3 L127.5 128.9 L129.8 128.4 L132.5 128.1 L135.4 127.9 L138.2 128.0 L140.8 128.4 L143.0 129.0 L144.7 129.7 L145.9 130.5 L146.8 131.2 L147.3 131.7 L147.7 131.9 L148.1 131.8 L148.6 131.4 L149.3 130.8 L150.2 130.1 L151.0 129.4 L151.9 128.9 L152.4 128.7 L152.5 129.1 L152.1 130.0 L151.0 131.5 L149.3 133.5 L147.0 136.0 L144.3 138.9 L141.4 141.9 L138.6 144.9 L136.0 147.6 L134.0 150.0 L132.7 151.9 L132.1 153.4 L132.2 154.3 L132.9 154.8 L133.9 155.0 L135.2 155.0 L136.4 154.9 L137.4 154.8 L138.1 154.9 L138.4 155.1 L138.3 155.4 L137.9 155.7 L137.4 156.0 L137.0 156.1 L136.6 155.8 L136.5 155.1 L136.6 154.0 L136.9 152.3 L137.3 150.1 L137.6 147.5 L137.6 144.7 L137.1 141.9 L136.0 139.1 L134.2 136.6 L131.8 134.6 L128.7 133.1 L125.2 132.2 L121.6 131.9 L118.0 132.0 L114.8 132.5 L112.0 133.2 L110.0 134.0 L108.7 134.6 L108.1 135.0 L108.0 135.2 L108.4 134.9 L109.0 134.5 L109.6 133.8 L110.0 133.0 L110.3 132.2 L110.3 131.5 L110.1 131.1 L109.8 130.9 L109.6 131.0 L109.6 131.3 L109.9 131.7 L110.6 132.0 L111.6 132.2 L112.9 132.0 L114.4 131.3 L115.8 130.2 L116.9 128.5 L117.5 126.3 L117.5 123.7 L116.8 120.9 L115.4 117.9 L113.4 115.1 L110.9 112.7 L108.3 110.6 L105.8 109.1 L103.6 108.2 L101.9 107.9 L100.8 108.0 L100.4 108.6 L100.6 109.3 L101.3 110.2 L102.4 111.1 L103.7 111.9 L104.9 112.5 L106.1 113.0 L107.1 113.4 L107.9 113.8 L108.6 114.4 L109.4 115.1 L110.3 116.3 L111.6 117.8 L113.2 119.7 L115.4 122.1 L118.0 124.7 L120.8 127.5 L123.8 130.3 L126.8 132.9 L129.4 135.2 L131.4 137.0 L132.8 138.2 L133.4 138.7 L133.3 138.7 L132.5 138.2 L131.2 137.4 L129.6 136.4 L128.1 135.3 L126.7 134.4 L125.7 133.8 L125.3 133.5 L125.4 133.6 L125.9 134.0 L126.8 134.8 L127.9 135.7 L129.1 136.6 L130.1 137.5 L130.9 138.1 L131.6 138.6 L132.0 138.8 L132.4 138.9 L132.9 138.8 L133.6 138.7 L134.7 138.8 L136.3 139.2 L138.3 140.0 L140.9 141.2 L143.7 142.9 L146.7 145.1 L149.5 147.5 L151.9 150.1 L153.8 152.7 L154.9 155.1 L155.3 157.1" strokeWidth="0.9" />

                    {/* Your ally: steady spiral */}
                    <text x="556" y="70" textAnchor="middle" stroke="none" fill="#E8C8A0" fontFamily="DM Sans,sans-serif" fontSize="13" fontWeight="600" letterSpacing="2.5">YOUR ALLY</text>
                    <circle cx="556" cy="133" r="46" />
                    <path d="M538 175 L528 196 L548 179" />
                    <g className={styles.breatheRings}>
                      <circle cx="556" cy="133" r="25" strokeWidth="1.1" />
                      <circle cx="557" cy="133" r="21" strokeWidth="1.1" />
                      <circle cx="556" cy="134" r="17" strokeWidth="1.1" />
                      <circle cx="557" cy="134" r="13" strokeWidth="1.1" />
                      <circle cx="556" cy="133" r="9" strokeWidth="1.1" />
                      <circle cx="557" cy="133" r="29" strokeWidth="1.1" />
                    </g>

                    {/* Plant */}
                    <path d="M56 394 H90 L95 426 H51Z" fill="#1A2E24" />
                    <path d="M72 394 L36 244 M72 394 L56 236 M72 394 L74 230 M72 394 L92 240 M72 394 L114 272 M72 394 L28 276 M72 394 L66 300 M58 330 L42 312 M86 320 L104 302" strokeWidth="1.4" />

                    {/* You: armchair and figure */}
                    <path d="M128 370 V300 Q128 267 160 267 H202 Q234 267 234 300 V370Z" fill="#22392D" />
                    <path d="M136 370 L130 416 M160 370 V416 M206 370 V416 M228 370 L234 416" />
                    <rect x="146" y="330" width="74" height="20" fill="#2F5E3E" stroke="none" />
                    <path d="M150 312 V286 Q150 250 182 248 Q214 250 214 286 V312Z" fill="#132219" />
                    <circle cx="182" cy="221" r="22" fill="#1A2E24" />

                    {/* Table with tea */}
                    <ellipse cx="316" cy="334" rx="42" ry="9" fill="#1A2E24" />
                    <path d="M316 343 V406 M294 407 H338" />
                    <rect x="294" y="312" width="18" height="16" rx="3" fill="#1A2E24" />
                    <path d="M312 316 Q320 316 320 321 Q320 326 312 326" strokeWidth="1.4" />
                    <path className={styles.steam} d="M300 304 Q296 296 301 289 Q306 282 301 274 M307 302 Q304 296 308 291" strokeWidth="1.1" opacity="0.7" />
                    <path d="M326 332 Q330 312 345 300 M328 320 Q322 312 318 312" strokeWidth="1.3" />

                    {/* Your ally: armchair and figure with notes */}
                    <path d="M458 370 V300 Q458 267 490 267 H532 Q564 267 564 300 V370Z" fill="#22392D" />
                    <path d="M466 370 L460 416 M490 370 V416 M536 370 V416 M558 370 L564 416" />
                    <rect x="476" y="330" width="74" height="20" fill="#2F5E3E" stroke="none" />
                    <path d="M478 312 V286 Q478 250 510 248 Q542 250 542 286 V312Z" fill="#132219" />
                    <circle cx="509" cy="221" r="22" fill="#1A2E24" />
                    <circle cx="527" cy="201" r="8" fill="#1A2E24" />
                    <g transform="rotate(14 536 290)">
                      <rect x="523" y="272" width="26" height="36" rx="3" fill="#22392D" />
                      <path d="M529 282 H543 M529 289 H543 M529 296 H539" strokeWidth="1.1" />
                    </g>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURED ALLIES ── */}
        {featuredAllies.length > 0 && (
          <section className={`${styles.section} ${styles.center}`}>
            <div className={styles.container}>
              <p className={styles.eyebrow}>A Few of the People Here</p>
              <h2 className={styles.title}>Warm, Trained, and Genuinely Yours.</h2>

              <div className={styles.allyGrid}>
                {featuredAllies.map((ally) => {
                  const quote = ally.quote ?? ally.tagline ?? (ally.bio ? ally.bio.slice(0, 120) + '…' : null)
                  return (
                    <div key={ally.id} className={styles.allyCard}>
                      <div className={styles.allyPhoto}>
                        {ally.photo_url ? (
                          <Image
                            src={ally.photo_url}
                            alt={ally.display_name}
                            fill
                            sizes="160px"
                            style={{ objectFit: 'cover', objectPosition: 'top center' }}
                          />
                        ) : (
                          <div className={styles.allyPhotoFallback}>{ally.display_name?.[0]?.toUpperCase() ?? '?'}</div>
                        )}
                      </div>
                      <p className={styles.allyName}>{ally.display_name}</p>
                      <p className={styles.allyRole}>{ally.primary_role ?? 'Counsellor'}</p>
                      {quote && <p className={styles.allyQuote}>&ldquo;{quote}&rdquo;</p>}
                    </div>
                  )
                })}
              </div>

              <a href="/signup" className={`${styles.btn} ${styles.btnDark} ${styles.btnBlock}`}>
                Meet All Allies →
              </a>
            </div>
          </section>
        )}

        {/* ── HOW MATCHING WORKS ── */}
        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <p className={styles.eyebrow}>How Matching Works</p>
            <h2 className={styles.title} style={{ marginBottom: 36 }}>Three Honest Ways to Find Yours.</h2>

            <div className={styles.stepGrid}>
              {WAYS.map((way, i) => (
                <div key={way.title} className={styles.stepCard}>
                  <span className={styles.stepNum}>0{i + 1}</span>
                  <span className={styles.stepIcon}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">{way.icon}</svg>
                  </span>
                  <h3 className={styles.stepTitle}>{way.title}</h3>
                  <p className={styles.stepBody}>{way.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHAT TO EXPECT ── */}
        <section className={styles.sectionDark}>
          <div className={styles.container}>
            <div className={styles.split}>
              <div>
                <p className={styles.eyebrow}>What to Expect</p>
                <h2 className={styles.title} style={{ marginBottom: 24 }}>Chosen for You, and Easy to Change.</h2>
                <p className={styles.bodyLight}>
                  55-minute sessions, online, in the language you think in. If the fit isn&apos;t right,
                  we rematch you ourselves. You never have to go looking on your own. And between
                  sessions, Nila is still there.
                </p>
              </div>
              <div className={styles.pillList}>
                {EXPECT.map((item) => (
                  <div key={item.text} className={styles.pill}>
                    <span className={styles.pillIcon}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">{item.icon}</svg>
                    </span>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className={`${styles.section} ${styles.cta}`}>
          <div className={styles.container}>
            <svg className={styles.ctaArc} width="72" height="28" viewBox="0 0 72 28" fill="none" aria-hidden="true">
              <path d="M4 26 Q36 -6 68 26" stroke="#A85D3C" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <h2 className={styles.ctaTitle}>Find Someone Who Fits the Shape of What You&apos;re Carrying.</h2>
            <a href="/signup" className={`${styles.btn} ${styles.btnTerra} ${styles.btnBlock}`}>
              Find an Ally →
            </a>
          </div>
        </section>
      </main>

      <LandingHelpline />
      <LandingFooter />
    </div>
  )
}
