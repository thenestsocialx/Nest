import Image from 'next/image'
import PublicHeader from '@/components/layout/PublicHeader'
import LandingHelpline from '@/components/layout/LandingHelpline'
import NestLogo from '@/components/ui/NestLogo'
import type { AllyPublicProfile } from '@/types/findAllies'

interface AlliesLandingProps {
  featuredAllies: AllyPublicProfile[]
}

function AllyPlaceholderPhoto({ name }: { name: string }) {
  const initial = name?.[0]?.toUpperCase() ?? '?'
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#3A5A46',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Playfair Display', serif",
        fontSize: 48,
        color: '#E8C8A0',
      }}
    >
      {initial}
    </div>
  )
}

export default function AlliesLanding({ featuredAllies }: AlliesLandingProps) {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#F8F0E5', minHeight: '100vh' }}>
      <PublicHeader />

      {/* ── HERO ── */}
      <section style={{ background: '#2F4C3A', overflow: 'hidden' }}>
        <div className="ns-ld-hero">
        <div className="ns-ld-hero__copy">
          <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.13em', color: '#8AAA94', display: 'block', marginBottom: 20 }}>
            THE ALLY PROGRAMME
          </span>

          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 400,
              margin: '0 0 32px',
              fontSize: 'clamp(36px, 4vw, 52px)',
              lineHeight: 1.1,
              color: '#F8F0E5',
            }}
          >
            a real person,<br />
            <em style={{ color: '#E8C8A0' }}>matched</em> to you.
          </h1>

          <p style={{
            margin: '0 0 44px',
            fontSize: 16,
            lineHeight: 1.85,
            color: '#F8F0E5',
            opacity: 0.8,
            maxWidth: 370,
          }}>
            every ally is a licensed, credentialed psychologist or counsellor, RCI, NMC or IACP
            registered. no self-declared coaches, no guesswork. just warm, trained people who fit
            the shape of what you&apos;re carrying.
          </p>

          <a
            href="/signup"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '15px 34px',
              borderRadius: 999,
              fontSize: 15,
              fontWeight: 500,
              background: '#F8F0E5',
              color: '#2F4C3A',
              textDecoration: 'none',
              alignSelf: 'flex-start',
            }}
          >
            find an ally →
          </a>
        </div>

        {/* Right: Therapy room SVG */}
        <div className="ns-ld-hero__svg" style={{ background: '#2F4C3A' }}>
          <svg viewBox="0 0 780 600" width="780" height="600" fill="none" style={{ display: 'block', maxWidth: '100%' }} aria-hidden="true">
            {/* Arched window */}
            <path d="M296 560 L296 218 Q296 106 422 106 Q548 106 548 218 L548 560Z" fill="#243E30" />
            <path d="M296 560 L296 218 Q296 106 422 106 Q548 106 548 218 L548 560" stroke="#C4B48A" strokeWidth="1.8" fill="none" />
            {/* Moon inside arch */}
            <circle cx="422" cy="192" r="42" fill="#E8C8A0" />
            {/* Landscape inside arch */}
            <path d="M296 496 Q332 462 370 476 Q396 486 422 474 Q450 462 482 478 Q516 494 548 472 L548 560 L296 560Z" fill="#1A2C22" />
            <path d="M296 538 Q342 518 384 528 Q404 534 422 524 Q444 514 482 526 Q512 538 548 520 L548 560 L296 560Z" fill="#162420" />
            {/* Floor shadow */}
            <ellipse cx="404" cy="554" rx="290" ry="20" fill="#243E30" opacity="0.6" />
            {/* Left armchair */}
            <path d="M118 498 Q116 466 144 454 Q186 440 228 454 Q256 466 254 498 Q254 520 190 522 Q120 520 118 498Z" fill="#2A4A38" stroke="#C4B48A" strokeWidth="1.5" />
            <path d="M136 458 Q134 418 158 404 Q190 392 224 404 Q246 418 244 458" fill="#2A4A38" stroke="#C4B48A" strokeWidth="1.5" />
            <path d="M112 476 Q108 452 114 442 Q120 434 132 438 Q140 446 138 470" fill="#2A4A38" stroke="#C4B48A" strokeWidth="1.5" />
            <path d="M252 476 Q256 452 250 442 Q244 434 232 438 Q224 446 226 470" fill="#2A4A38" stroke="#C4B48A" strokeWidth="1.5" />
            <line x1="146" y1="520" x2="142" y2="550" stroke="#C4B48A" strokeWidth="2" strokeLinecap="round" />
            <line x1="178" y1="524" x2="176" y2="554" stroke="#C4B48A" strokeWidth="2" strokeLinecap="round" />
            <line x1="208" y1="524" x2="210" y2="554" stroke="#C4B48A" strokeWidth="2" strokeLinecap="round" />
            <line x1="236" y1="520" x2="240" y2="550" stroke="#C4B48A" strokeWidth="2" strokeLinecap="round" />
            {/* Left figure (patient) */}
            <path d="M152 460 Q148 428 162 408 Q178 392 190 390 Q204 392 216 408 Q230 428 226 460" fill="#1E3028" stroke="#C4B48A" strokeWidth="1.5" />
            <circle cx="190" cy="374" r="22" fill="#1E3028" stroke="#C4B48A" strokeWidth="1.5" />
            <path d="M170 372 Q157 396 155 432" stroke="#C4B48A" strokeWidth="1.5" fill="none" />
            <path d="M154 460 Q148 476 142 492 Q154 498 168 494" stroke="#C4B48A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M218 460 Q222 476 218 490 Q206 498 192 492" stroke="#C4B48A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Centre table */}
            <ellipse cx="404" cy="476" rx="46" ry="16" fill="#243E30" stroke="#C4B48A" strokeWidth="1.5" />
            <line x1="404" y1="490" x2="404" y2="528" stroke="#C4B48A" strokeWidth="5.5" strokeLinecap="round" />
            <ellipse cx="404" cy="532" rx="26" ry="8" fill="#243E30" stroke="#C4B48A" strokeWidth="1.5" />
            {/* Coffee mug */}
            <rect x="374" y="460" width="18" height="14" rx="2.5" fill="#1E3028" stroke="#C4B48A" strokeWidth="1.2" />
            <path d="M392 463 Q398 463 398 468 Q398 473 392 473" stroke="#C4B48A" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            {/* Right armchair */}
            <path d="M554 498 Q552 466 580 454 Q622 440 664 454 Q692 466 690 498 Q690 520 626 522 Q556 520 554 498Z" fill="#2A4A38" stroke="#C4B48A" strokeWidth="1.5" />
            <path d="M572 458 Q570 418 594 404 Q626 392 660 404 Q682 418 680 458" fill="#2A4A38" stroke="#C4B48A" strokeWidth="1.5" />
            <path d="M548 476 Q544 452 550 442 Q556 434 568 438 Q576 446 574 470" fill="#2A4A38" stroke="#C4B48A" strokeWidth="1.5" />
            <path d="M688 476 Q692 452 686 442 Q680 434 668 438 Q660 446 662 470" fill="#2A4A38" stroke="#C4B48A" strokeWidth="1.5" />
            <line x1="582" y1="520" x2="578" y2="550" stroke="#C4B48A" strokeWidth="2" strokeLinecap="round" />
            <line x1="614" y1="524" x2="612" y2="554" stroke="#C4B48A" strokeWidth="2" strokeLinecap="round" />
            {/* Right figure (therapist with notepad) */}
            <path d="M588 460 Q584 428 596 408 Q612 392 626 390 Q640 392 652 408 Q666 428 662 460" fill="#1E3028" stroke="#C4B48A" strokeWidth="1.5" />
            <circle cx="624" cy="374" r="21" fill="#1E3028" stroke="#C4B48A" strokeWidth="1.5" />
            <rect x="632" y="412" width="32" height="40" rx="3" fill="#243E30" stroke="#C4B48A" strokeWidth="1.3" />
            <line x1="638" y1="421" x2="657" y2="421" stroke="#C4B48A" strokeWidth="0.9" opacity="0.6" />
            <line x1="638" y1="429" x2="657" y2="429" stroke="#C4B48A" strokeWidth="0.9" opacity="0.6" />
            <line x1="638" y1="437" x2="655" y2="437" stroke="#C4B48A" strokeWidth="0.9" opacity="0.55" />
            <path d="M590 460 Q583 476 576 492" stroke="#C4B48A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M656 460 Q660 476 656 490 Q644 498 630 492" stroke="#C4B48A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Floor plant left */}
            <path d="M58 564 L66 530 L94 530 L102 564Z" fill="#243E30" stroke="#C4B48A" strokeWidth="1.5" />
            <line x1="80" y1="530" x2="80" y2="460" stroke="#C4B48A" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M80 460 Q52 438 32 402 Q58 426 80 450" stroke="#C4B48A" strokeWidth="1.5" fill="none" />
            <path d="M80 460 Q110 434 134 398 Q106 426 80 450" stroke="#C4B48A" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
        </div>
      </section>

      {/* ── FEATURED ALLY CARDS ── */}
      {featuredAllies.length > 0 && (
        <section className="ns-ld-section" style={{ background: '#F8F0E5' }}>
          <div className="ns-ld-container">
            <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.13em', color: '#5C7A66', display: 'block', marginBottom: 14 }}>
              A FEW OF THE PEOPLE HERE
            </span>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 400,
              margin: '0 0 72px',
              fontSize: 'clamp(24px, 2.5vw, 34px)',
              color: '#2F4C3A',
              lineHeight: 1.25,
            }}>
              warm, trained, and genuinely yours.
            </h2>

            <div className="ns-ld-ally-cards">
              {featuredAllies.map((ally) => {
                const quote = ally.quote ?? ally.tagline ?? (ally.bio ? ally.bio.slice(0, 120) + '…' : null)
                return (
                  <div key={ally.id} className="ns-ld-ally-card">
                    <div className="ns-ld-ally-card__photo">
                      {ally.photo_url ? (
                        <Image
                          src={ally.photo_url}
                          alt={ally.display_name}
                          fill
                          sizes="148px"
                          style={{ objectFit: 'cover', objectPosition: 'top center' }}
                        />
                      ) : (
                        <AllyPlaceholderPhoto name={ally.display_name} />
                      )}
                    </div>
                    <div className="ns-ld-ally-card__body">
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: '#2F4C3A' }}>
                        {ally.display_name}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.1em', color: '#5C7A66' }}>
                        {ally.primary_role ?? 'counsellor'}
                      </div>
                      {quote && (
                        <p style={{ margin: '14px 0 0', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 15, color: '#5C7A66', lineHeight: 1.65 }}>
                          &ldquo;{quote}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── HOW MATCHING WORKS ── */}
      <section className="ns-ld-section" style={{ background: '#F2E5D0' }}>
        <div className="ns-ld-container">
          <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.13em', color: '#5C7A66', display: 'block', marginBottom: 14 }}>
            HOW MATCHING WORKS
          </span>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, margin: '0 0 48px', fontSize: 'clamp(24px, 2.5vw, 34px)', color: '#2F4C3A', maxWidth: 640, lineHeight: 1.25 }}>
            three honest ways to find yours.
          </h2>

          <div className="ns-ld-grid-3">
            {[
              {
                title: 'a short check-in',
                body: 'answer a few honest questions and we suggest allies who actually fit. no diagnosis needed.',
              },
              {
                title: 'browse yourself',
                body: 'prefer to look first? read profiles in their own words and pick who feels right.',
              },
              {
                title: 'talk to a person',
                body: 'message a healing buddy on whatsapp and a human helps you decide. no bots, no queue.',
              },
            ].map((card) => (
              <div key={card.title} style={{ background: '#F8F0E5', border: '1px solid #E0D5C5', borderRadius: 16, padding: 28 }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#2F4C3A', marginBottom: 12 }}>
                  {card.title}
                </div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: '#5C7A66' }}>{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT TO EXPECT ── */}
      <section className="ns-ld-section" style={{ background: '#2F4C3A' }}>
        <div className="ns-ld-container" style={{ display: 'flex', gap: 64, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.13em', color: '#E8C8A0', display: 'block', marginBottom: 16 }}>
              WHAT TO EXPECT
            </span>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, margin: '0 0 28px', fontSize: 'clamp(24px, 2.5vw, 36px)', lineHeight: 1.22, color: '#F8F0E5' }}>
              chosen for you,<br />and easy to change.
            </h2>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.8, color: '#F8F0E5', opacity: 0.8, maxWidth: 460 }}>
              55-minute sessions, online, in the language you think in. if the fit isn&apos;t right,
              we rematch you ourselves. you never have to go looking on your own. and between
              sessions, nila is still there.
            </p>
          </div>
          <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              '55-minute sessions, online',
              'licensed, verified practitioners only',
              'free rematching, whenever you need it',
              'sessions in tamil, thanglish, english and more',
            ].map((item) => (
              <div key={item} style={{ background: '#3A5A46', border: '1px solid rgba(232,200,160,0.18)', borderRadius: 14, padding: '18px 24px', fontSize: 14, color: '#F8F0E5' }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="ns-ld-section" style={{ background: '#F8F0E5' }}>
        <div className="ns-ld-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 24 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, margin: 0, fontSize: 'clamp(24px, 2.5vw, 36px)', color: '#2F4C3A', maxWidth: 560, lineHeight: 1.22 }}>
            find someone who fits the shape of what you&apos;re carrying.
          </h2>
          <a
            href="/signup"
            style={{ display: 'inline-flex', alignItems: 'center', padding: '15px 40px', borderRadius: 999, fontSize: 15, fontWeight: 500, background: '#A85D3C', color: '#F8F0E5', marginTop: 8, textDecoration: 'none' }}
          >
            find an ally →
          </a>
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
