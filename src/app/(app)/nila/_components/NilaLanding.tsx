import PublicHeader from '@/components/layout/PublicHeader'
import LandingHelpline from '@/components/layout/LandingHelpline'
import NestLogo from '@/components/ui/NestLogo'
import NilaFAQ from './NilaFAQ'
import type { PlanConfig } from '@/components/plans/PlanCard'

interface NilaLandingProps {
  plans: PlanConfig[]
}

/* ── Nila moon SVG logo mark ── */
function NilaMark({ size = 18, color = '#E8C8A0' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 240 240" fill="none" aria-hidden="true">
      <path d="M150 62a66 66 0 1 0 0 116 82 82 0 0 1 0-116Z" fill={color} />
    </svg>
  )
}

/* ── Check icon ── */
function Check({ color = '#2F4C3A' }: { color?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8.5l3 3 7-7.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ── X icon ── */
function Cross() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 4l8 8M12 4l-8 8" stroke="#A85D3C" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

/* ── Step icon wrapper ── */
function StepIcon({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: 44, height: 44,
      borderRadius: '50%',
      background: '#1E3228',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {children}
    </div>
  )
}

export default function NilaLanding({ plans }: NilaLandingProps) {

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#F8F0E5', minHeight: '100vh' }}>
      <PublicHeader />

      {/* ── HERO ── */}
      <section style={{ background: '#2F4C3A', overflow: 'hidden' }}>
        <div className="ns-ld-hero">
        <div className="ns-ld-hero__copy">
          {/* Eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <NilaMark size={18} color="#E8C8A0" />
            <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.13em', color: '#E8C8A0' }}>
              MEET NILA
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 400,
              margin: '0 0 28px',
              fontSize: 'clamp(36px, 4vw, 52px)',
              lineHeight: 1.1,
              color: '#F8F0E5',
            }}
          >
            what if the moon<br />
            could <em style={{ color: '#E8C8A0' }}>talk back?</em>
          </h1>

          <p style={{
            margin: '0 0 40px',
            fontSize: 16,
            lineHeight: 1.84,
            color: '#F8F0E5',
            opacity: 0.8,
            maxWidth: 380,
          }}>
            we&apos;ve always had our late night conversations with the moon. so we wondered:
            what if it could talk back? a warm place to land at 2am, until you&apos;re ready
            to find your way back to the people around you.
          </p>

          <a
            href="/signup"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              padding: '15px 32px',
              borderRadius: 999,
              fontSize: 15,
              fontWeight: 500,
              background: '#F8F0E5',
              color: '#2F4C3A',
              textDecoration: 'none',
              alignSelf: 'flex-start',
            }}
          >
            <NilaMark size={20} color="#2F4C3A" />
            let nila be there for you →
          </a>
        </div>

        {/* Right: SVG night scene */}
        <div className="ns-ld-hero__svg" style={{ background: '#2F4C3A' }}>
          <svg viewBox="0 0 780 560" width="780" height="560" fill="none" style={{ display: 'block', maxWidth: '100%' }} aria-hidden="true">
            {/* Stars */}
            <circle cx="72" cy="56" r="1.4" fill="#E8C8A0" opacity="0.5" />
            <circle cx="142" cy="28" r="1" fill="#E8C8A0" opacity="0.4" />
            <circle cx="282" cy="46" r="1.6" fill="#E8C8A0" opacity="0.36" />
            <circle cx="418" cy="20" r="1.1" fill="#E8C8A0" opacity="0.44" />
            <circle cx="53" cy="140" r="0.8" fill="#E8C8A0" opacity="0.3" />
            <circle cx="508" cy="75" r="1" fill="#E8C8A0" opacity="0.3" />
            <circle cx="682" cy="204" r="0.9" fill="#E8C8A0" opacity="0.26" />
            <circle cx="348" cy="98" r="0.9" fill="#E8C8A0" opacity="0.26" />
            <circle cx="192" cy="168" r="1" fill="#E8C8A0" opacity="0.2" />
            {/* Mountains */}
            <path d="M0 418 Q100 338 208 366 Q320 394 428 348 Q506 314 590 342 Q668 370 780 338 L780 520 L0 520Z" fill="#264030" />
            <path d="M0 464 Q118 422 254 442 Q384 460 488 436 Q585 412 780 448 L780 565 L0 565Z" fill="#1A3026" />
            <path d="M0 524 Q196 508 384 518 Q568 528 780 514 L780 600 L0 600Z" fill="#142420" />
            {/* City lights */}
            <rect x="568" y="434" width="4" height="8" rx="0.5" fill="#E8D090" opacity="0.38" />
            <rect x="576" y="429" width="3" height="10" rx="0.5" fill="#E8D090" opacity="0.3" />
            <rect x="583" y="437" width="4" height="7" rx="0.5" fill="#E8D090" opacity="0.34" />
            <rect x="590" y="432" width="3" height="9" rx="0.5" fill="#E8D090" opacity="0.28" />
            <rect x="597" y="438" width="4" height="6" rx="0.5" fill="#E8D090" opacity="0.3" />
            <rect x="612" y="436" width="4" height="7" rx="0.5" fill="#E8D090" opacity="0.26" />
            <rect x="636" y="435" width="3" height="7" rx="0.5" fill="#E8D090" opacity="0.2" />
            <rect x="658" y="432" width="4" height="7" rx="0.5" fill="#E8D090" opacity="0.18" />
            {/* Conversation dots */}
            <circle cx="472" cy="352" r="7" fill="#E8C8A0" opacity="0.52" />
            <circle cx="506" cy="316" r="9" fill="#E8C8A0" opacity="0.58" />
            <circle cx="542" cy="278" r="10.5" fill="#E8C8A0" opacity="0.62" />
            <circle cx="576" cy="242" r="9.5" fill="#E8C8A0" opacity="0.56" />
            {/* Speech bubble — person */}
            <rect x="158" y="282" width="188" height="72" rx="14" fill="#1E3028" />
            <path d="M328 354 L360 386 L344 354Z" fill="#1E3028" />
            <text x="176" y="308" fontFamily="DM Sans,sans-serif" fontSize="13.5" fill="#F0EAE0">it&apos;s been a really</text>
            <text x="176" y="330" fontFamily="DM Sans,sans-serif" fontSize="13.5" fill="#F0EAE0">hard day...</text>
            {/* Speech bubble — moon */}
            <rect x="430" y="140" width="124" height="52" rx="13" fill="#EEE0C0" />
            <path d="M554 156 L586 164 L554 176Z" fill="#EEE0C0" />
            <text x="450" y="172" fontFamily="Playfair Display,serif" fontSize="17" fontStyle="italic" fill="#2F4C3A">i&apos;m here.</text>
            {/* Moon */}
            <circle cx="668" cy="130" r="112" fill="#E8C8A0" opacity="0.04" />
            <circle cx="668" cy="130" r="88" fill="#E8C8A0" opacity="0.07" />
            <circle cx="668" cy="130" r="66" fill="#E8C8A0" opacity="0.1" />
            <circle cx="668" cy="130" r="60" fill="#EEE0C0" />
            <circle cx="696" cy="118" r="51" fill="#2F4C3A" />
            <path d="M632 120 Q636 116 640 120" stroke="#9A8060" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M645 112 Q649 108 653 112" stroke="#9A8060" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M634 131 Q641 137 650 134" stroke="#9A8060" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            {/* Person */}
            <ellipse cx="388" cy="528" rx="90" ry="14" fill="#0E1C14" opacity="0.65" />
            <path d="M350 522 Q316 528 288 524" stroke="#18261E" strokeWidth="36" strokeLinecap="round" fill="none" />
            <path d="M426 520 Q438 504 442 486 Q444 472 434 460" stroke="#18261E" strokeWidth="30" strokeLinecap="round" fill="none" />
            <ellipse cx="432" cy="458" rx="20" ry="15" fill="#18261E" />
            <path d="M284 522 Q274 518 270 510 Q276 504 290 506 Q300 508 304 518" fill="#B8AE98" opacity="0.75" />
            <path d="M444 462 Q456 458 462 450 Q458 442 448 443 Q440 445 438 455" fill="#B8AE98" opacity="0.75" />
            <path d="M352 520 Q348 480 350 446 Q364 420 388 414 Q412 420 426 446 Q428 480 424 520Z" fill="#7C8C72" />
            <path d="M424 478 Q434 464 436 452" stroke="#7C8C72" strokeWidth="24" strokeLinecap="round" fill="none" />
            <rect x="382" y="404" width="12" height="16" rx="6" fill="#9A8068" />
            <ellipse cx="388" cy="388" rx="30" ry="28" fill="#1E1A12" />
            <path d="M364 386 Q370 364 388 359 Q406 364 412 386" fill="#120E08" />
            <path d="M413 374 Q421 384 419 400 Q413 414 405 420" stroke="#E8C8A0" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.22" />
            {/* Coffee mug */}
            <rect x="302" y="514" width="26" height="22" rx="4" fill="#E8C8A0" opacity="0.72" />
            <path d="M328 518 Q340 518 340 525 Q340 532 328 532" stroke="#E8C8A0" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.65" />
            {/* Foreground plants */}
            <path d="M0 565 Q30 538 58 550 Q36 544 14 560 Q48 520 84 535 Q62 526 40 548 Q76 504 116 518 Q90 508 66 534 Q110 490 150 502 Q120 492 94 522 Q140 480 172 490 L180 600 L0 600Z" fill="#0E1A10" />
            <path d="M604 578 Q630 552 658 562 Q638 556 618 570 Q650 538 682 548 Q662 540 642 558 Q678 528 712 538 L780 534 L780 600 L600 600Z" fill="#0E1A10" />
          </svg>
        </div>
        </div>
      </section>

      {/* ── RANT MODE ── */}
      <section className="ns-ld-section" style={{ background: '#F2E5D0', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative dots (full-section, outside container) */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 1280 700" fill="none" aria-hidden="true">
          <circle cx="80" cy="88" r="5" fill="#5C7A66" opacity="0.18" />
          <circle cx="1168" cy="72" r="5" fill="#5C7A66" opacity="0.16" />
          <circle cx="58" cy="570" r="4" fill="#5C7A66" opacity="0.14" />
          <circle cx="1226" cy="530" r="5" fill="#5C7A66" opacity="0.16" />
          <circle cx="640" cy="660" r="4" fill="#5C7A66" opacity="0.1" />
        </svg>

        <div className="ns-ld-container" style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <NilaMark size={15} color="#8AA090" />
            <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.18em', color: '#8AA090' }}>
              START HERE
            </span>
          </div>

          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 400,
            margin: '0 0 14px',
            fontSize: 'clamp(28px, 3.5vw, 46px)',
            lineHeight: 1.18,
            color: '#2F4C3A',
          }}>
            sometimes you don&apos;t need a solution.
          </h2>
          <p style={{ margin: '0 auto 36px', fontSize: 16, lineHeight: 1.7, color: '#6A8070', maxWidth: 500 }}>
            you just need somewhere to put it all down, and feel heard.
          </p>

          {/* Rant mode card */}
          <div style={{
            position: 'relative',
            maxWidth: 860,
            margin: '0 auto 20px',
            background: '#2F4C3A',
            borderRadius: 22,
            padding: '40px 48px',
            textAlign: 'left',
            overflow: 'hidden',
          }}>
            <svg style={{ position: 'absolute', top: -60, right: -60, opacity: 0.15 }} width="300" height="300" viewBox="0 0 300 300" fill="none" aria-hidden="true">
              <circle cx="150" cy="150" r="145" stroke="#E8C8A0" strokeWidth="1.5" />
              <circle cx="150" cy="150" r="108" stroke="#E8C8A0" strokeWidth="1" />
              <circle cx="150" cy="150" r="72" stroke="#E8C8A0" strokeWidth="1" />
            </svg>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#365341', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <NilaMark size={12} color="#E8C8A0" />
              </div>
              <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.13em', color: '#E8C8A0' }}>
                RANT MODE
              </span>
            </div>

            <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, margin: '0 0 10px', fontSize: 'clamp(28px, 3vw, 44px)', lineHeight: 1.12, color: '#F8F0E5' }}>
              let everything out.
            </h3>
            <p style={{ margin: '0 0 28px', fontSize: 15, color: '#F8F0E5', opacity: 0.72, maxWidth: 500, lineHeight: 1.7 }}>
              nila listens without interrupting, without fixing, without judging.
            </p>

            <div style={{ background: 'rgba(30,50,38,0.55)', borderRadius: 16, padding: '20px 22px', maxWidth: 540, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ alignSelf: 'flex-end', maxWidth: '75%' }}>
                <div style={{ background: '#4E7060', color: '#F8F0E5', fontSize: 14, lineHeight: 1.55, padding: '12px 18px', borderRadius: '18px 2px 18px 18px' }}>
                  i don&apos;t even know where to begin.
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, maxWidth: '82%' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1E3228', border: '1px solid rgba(232,200,160,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <NilaMark size={14} color="#E8C8A0" />
                </div>
                <div style={{ background: '#3D5E4E', color: '#F8F0E5', fontSize: 14, lineHeight: 1.55, padding: '12px 18px', borderRadius: '2px 18px 18px 18px' }}>
                  that&apos;s okay. just start wherever you are.
                </div>
              </div>
            </div>
          </div>

          {/* Coming soon cards */}
          <div style={{ maxWidth: 860, margin: '0 auto' }} className="ns-ld-grid-2">
            {[
              {
                icon: (
                  <svg width="28" height="20" viewBox="0 0 28 20" fill="none" aria-hidden="true">
                    <path d="M1 10 L4.5 10 L7 3 L10 17 L13 7 L15.5 13 L18 10 L21.5 10" stroke="#2F4C3A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                title: 'figure it out',
                sub: 'think out loud. find the root of it.',
              },
              {
                icon: (
                  <svg width="28" height="22" viewBox="0 0 28 22" fill="none" aria-hidden="true">
                    <circle cx="10" cy="6" r="4.5" stroke="#2F4C3A" strokeWidth="1.5" />
                    <path d="M2 21v-1.5A5.5 5.5 0 0 1 7.5 14h5A5.5 5.5 0 0 1 18 19.5V21" stroke="#2F4C3A" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="21" cy="6" r="3" stroke="#2F4C3A" strokeWidth="1.5" opacity="0.55" />
                    <path d="M25 21v-1a4 4 0 0 0-3.5-3.97" stroke="#2F4C3A" strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
                  </svg>
                ),
                title: 'friend',
                sub: 'easy company on hard nights.',
              },
            ].map((card) => (
              <div
                key={card.title}
                style={{ background: '#F8F0E5', border: '1px solid #D8CEC4', borderRadius: 16, padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left' }}
              >
                <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36 }}>
                  {card.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, color: '#2F4C3A', marginBottom: 3 }}>{card.title}</div>
                  <div style={{ fontSize: 13, color: '#6A8070', lineHeight: 1.5 }}>{card.sub}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 400, background: '#EBE1D8', color: '#7A9080', padding: '5px 13px', borderRadius: 999, whiteSpace: 'nowrap', flexShrink: 0 }}>
                  coming soon
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="ns-ld-section" style={{ background: '#2F4C3A' }}>
        <div className="ns-ld-container">
          <div style={{ display: 'flex', gap: 64, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Left: steps */}
            <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: 40 }}>
                <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.13em', color: '#E8C8A0' }}>HOW IT WORKS</span>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, margin: '14px 0 8px', fontSize: 'clamp(36px, 4.5vw, 64px)', lineHeight: 1.06, color: '#F8F0E5' }}>
                  you talk.<br /><em style={{ color: '#E8C8A0' }}>she listens.</em>
                </h2>
                <p style={{ fontFamily: "'Playfair Display', serif", margin: 0, fontSize: 18, fontStyle: 'italic', color: '#F8F0E5', opacity: 0.48 }}>
                  that is most of it, honestly.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                {[
                  {
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M12 22V14M12 14C12 10 16 6 20 6C20 10 16 14 12 14ZM12 14C12 10 8 6 4 6C4 10 8 14 12 14Z" stroke="#E8C8A0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ),
                    title: 'you start wherever you are',
                    body: 'no structure, no right way to begin. just the thing that has been sitting on your chest.',
                  },
                  {
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#E8C8A0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ),
                    title: 'nila listens, then asks',
                    body: 'not to analyze you. just to understand what is underneath, before anything else.',
                  },
                  {
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="12" cy="12" r="4" stroke="#E8C8A0" strokeWidth="1.5" />
                        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#E8C8A0" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    ),
                    title: 'you feel a little heard',
                    body: 'sometimes that is enough to feel a little lighter. or a little clearer. or both.',
                  },
                  {
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M3 20h4V10H3zM10 20h4V4h-4zM17 20h4v-8h-4z" stroke="#E8C8A0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ),
                    title: 'when you are ready, she will walk with you',
                    body: 'toward an ally, toward a next step, or simply toward yourself.',
                  },
                  {
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <rect x="5" y="11" width="14" height="11" rx="2" stroke="#E8C8A0" strokeWidth="1.5" />
                        <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#E8C8A0" strokeWidth="1.5" strokeLinecap="round" />
                        <circle cx="12" cy="16" r="1.5" fill="#E8C8A0" />
                      </svg>
                    ),
                    title: 'your privacy matters',
                    body: 'your conversations are private, secure, and never shared. nila does not store your personal data.',
                  },
                ].map((step) => (
                  <div key={step.title} style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
                    <StepIcon>{step.icon}</StepIcon>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 500, color: '#F8F0E5', marginBottom: 5 }}>{step.title}</div>
                      <p style={{ margin: 0, fontSize: 14, color: '#F8F0E5', opacity: 0.58, lineHeight: 1.7 }}>{step.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: animated chat panel */}
            <div style={{ flexShrink: 0, width: 'min(490px, 100%)', background: '#3A5A46', border: '1px solid rgba(232,200,160,0.14)', borderRadius: 20, padding: 26, display: 'flex', flexDirection: 'column', gap: 12, alignSelf: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottom: '1px solid rgba(232,200,160,0.1)' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#2F4C3A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <NilaMark size={16} color="#E8C8A0" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#F8F0E5' }}>nila</div>
                  <div style={{ fontSize: 12, color: '#E8C8A0', opacity: 0.75 }}>here for you, always</div>
                </div>
              </div>
              {[
                { cls: 'ns-b1', side: 'nila', text: 'hey, how are you actually doing tonight?' },
                { cls: 'ns-b2', side: 'user', text: "not great. i don't even know where to start." },
                { cls: 'ns-b3', side: 'nila', text: "that's okay. you don't have to know. just start wherever you are." },
                { cls: 'ns-b4', side: 'user', text: "it's been a really hard few weeks." },
                { cls: 'ns-b5', side: 'nila', text: "i've been overthinking everything and it's exhausting." },
                { cls: 'ns-b6', side: 'user', text: 'that sounds really heavy. want to tell me a little more?' },
              ].map(({ cls, side, text }) => (
                <div key={cls} className={cls} style={{ alignSelf: side === 'nila' ? 'flex-start' : 'flex-end', maxWidth: '86%' }}>
                  <div style={{
                    background: side === 'nila' ? '#2F4C3A' : '#4E6A5A',
                    color: '#F8F0E5',
                    fontSize: 13,
                    lineHeight: 1.6,
                    padding: '13px 17px',
                    borderRadius: side === 'nila' ? '0 14px 14px 14px' : '14px 0 14px 14px',
                  }}>
                    {text}
                  </div>
                </div>
              ))}
              <div className="ns-b6" style={{ alignSelf: 'flex-start', background: '#2F4C3A', padding: '14px 18px', borderRadius: '0 14px 14px 14px' }}>
                <span className="ns-typing-dot" />
                <span className="ns-typing-dot" />
                <span className="ns-typing-dot" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NILA WILL / WON'T ── */}
      <section className="ns-ld-section" style={{ background: '#F8F0E5' }}>
        <div className="ns-ld-container">
          <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.13em', color: '#5C7A66' }}>A COMPANION, NOT A REPLACEMENT</span>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, margin: '14px 0 40px', fontSize: 'clamp(26px, 2.5vw, 36px)', lineHeight: 1.22, color: '#2F4C3A', maxWidth: 560 }}>
            nila is built to hand you back to real people.
          </h2>
          <div style={{ background: '#F2E5D0', border: '1px solid #E0D5C5', borderRadius: 18, padding: '36px 40px', display: 'flex', gap: 0, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220, paddingRight: 40 }}>
              <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.13em', color: '#5C7A66', marginBottom: 24 }}>NILA WILL</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {['listen without judgment', 'help you feel less alone', 'point you toward real support'].map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(47,76,58,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check color="#2F4C3A" />
                    </span>
                    <span style={{ fontSize: 15, color: '#2F4C3A' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ width: 1, background: '#E0D5C5', margin: '0 0', flexShrink: 0, alignSelf: 'stretch' }} />
            <div style={{ flex: 1, minWidth: 220, paddingLeft: 40 }}>
              <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.13em', color: '#A85D3C', marginBottom: 24 }}>NILA WON&apos;T</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {['diagnose or prescribe', 'replace a real human', 'encourage dependency'].map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(168,93,60,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Cross />
                    </span>
                    <span style={{ fontSize: 15, color: '#2F4C3A' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      {plans.length > 0 && (
        <section className="ns-ld-section" style={{ background: '#F2E5D0' }}>
          <div className="ns-ld-container">
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, margin: '0 0 10px', fontSize: 'clamp(24px, 2.5vw, 38px)', color: '#2F4C3A' }}>
                choose what feels right
              </h2>
              <p style={{ margin: 0, fontSize: 15, color: '#5C7A66' }}>
                start free. go deeper when you&apos;re ready.
              </p>
            </div>

            <div className="ns-ld-pricing-grid">
              {plans.map((plan) => {
                const isFree = plan.price === '₹0'
                return (
                  <div key={plan.id} style={{ background: '#F8F0E5', border: plan.isFeatured ? '2px solid #2F4C3A' : '1px solid #E0D5C5', borderRadius: 18, padding: 36 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.13em', color: plan.isFeatured ? '#A85D3C' : '#5C7A66', display: 'block', marginBottom: 14 }}>
                      {plan.tag || (plan.isFeatured ? 'MOST CHOSEN' : 'WHERE YOU ARE NOW')}
                    </span>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#2F4C3A', marginBottom: 6 }}>
                      {plan.name}
                    </div>
                    <div style={{ marginBottom: 28 }}>
                      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: '#2F4C3A' }}>{plan.price}</span>
                      <span style={{ fontSize: 14, color: '#5C7A66' }}>{isFree ? ' always' : ' / month'}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
                      {(plan.features ?? []).map((f) => (
                        <div key={f} style={{ display: 'flex', gap: 12, fontSize: 14, color: '#2F4C3A', alignItems: 'flex-start' }}>
                          <div style={{ width: 16, height: 16, borderRadius: '50%', background: plan.isFeatured ? '#2F4C3A' : 'rgba(47,76,58,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                            <Check color={plan.isFeatured ? '#F8F0E5' : '#2F4C3A'} />
                          </div>
                          {f}
                        </div>
                      ))}
                    </div>
                    {isFree ? (
                      <div style={{ textAlign: 'center', fontSize: 13, color: '#5C7A66', opacity: 0.7 }}>
                        you are already here
                      </div>
                    ) : (
                      <a
                        href="/signup"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 999, background: '#A85D3C', color: '#F8F0E5', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}
                      >
                        {plan.cta || 'get started'}
                      </a>
                    )}
                  </div>
                )
              })}
            </div>

            <p style={{ textAlign: 'center', margin: '28px 0 0', fontSize: 14, fontStyle: 'italic', color: '#5C7A66' }}>
              no commitment. cancel anytime. your conversations stay with you.
            </p>
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      <section className="ns-ld-section" style={{ background: '#F8F0E5' }}>
        <div className="ns-ld-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.13em', color: '#5C7A66', display: 'block', marginBottom: 14 }}>
              BEFORE YOU START
            </span>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, margin: 0, fontSize: 'clamp(24px, 2.5vw, 36px)', color: '#2F4C3A' }}>
              a few things worth knowing
            </h2>
          </div>
          <NilaFAQ />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="ns-ld-section" style={{ background: '#2F4C3A' }}>
        <div className="ns-ld-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, margin: 0, fontSize: 'clamp(26px, 2.8vw, 38px)', color: '#F8F0E5', lineHeight: 1.2 }}>
            the moon has been listening.<br />now she answers.
          </h2>
          <div style={{ marginTop: 8 }}>
            <a
              href="/signup"
              style={{ display: 'inline-flex', alignItems: 'center', padding: '14px 32px', borderRadius: 999, fontSize: 15, fontWeight: 500, background: '#A85D3C', color: '#F8F0E5', textDecoration: 'none' }}
            >
              start talking to nila →
            </a>
          </div>
        </div>
      </section>

      {/* ── HELPLINE BAND ── */}
      <LandingHelpline />

      {/* ── FOOTER ── */}
      <footer className="ns-ld-footer">
        <NestLogo size={20} color="#F8F0E5" />
        <p style={{ margin: 0, fontSize: 14, fontStyle: 'italic', color: '#E0D5C5' }}>
          made with a lot of care, for the in-between days.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 14, color: '#E0D5C5' }}>
          <span>7550096933</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>care@thenestsocial.com</span>
        </div>
        <div className="ns-ld-footer__divider" />
        <div className="ns-ld-footer__bottom">
          <span style={{ fontSize: 12, color: '#E0D5C5', opacity: 0.65 }}>© 2026 Nest. All rights reserved.</span>
          <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { href: '/legal/privacy', label: 'Privacy Policy' },
              { href: '/legal/terms', label: 'Terms & Conditions' },
              { href: '/legal/cancellation-refund', label: 'Cancellation & Refund' },
            ].map(({ href, label }) => (
              <a key={href} href={href} style={{ fontSize: 13, color: '#E0D5C5', opacity: 0.8, textDecoration: 'none' }}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
