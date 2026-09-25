import Link from 'next/link'
import type { Metadata } from 'next'
import NestLogo from '@/components/ui/NestLogo'
import PublicHeader from '@/components/layout/PublicHeader'
import styles from './not-found.module.css'

export const metadata: Metadata = {
  title: 'A quiet detour | The Nest Social',
  description: "The page you were looking for isn't here, but the rest of Nest is.",
}

const destinations = [
  {
    href: '/',
    label: 'Come home',
    description: 'Back to where it all begins.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M3 9.5L10 3L17 9.5V17.5H13V13H7V17.5H3V9.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: '/nila',
    label: 'Talk to Nila',
    description: 'She’s here, whenever you need.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M3 10C3 6.134 6.134 3 10 3C13.866 3 17 6.134 17 10C17 13.866 13.866 17 10 17C8.786 17 7.65 16.666 6.682 16.084L3 17L4.016 13.518C3.375 12.46 3 11.273 3 10Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="7.5" cy="10" r="1" fill="currentColor" />
        <circle cx="10" cy="10" r="1" fill="currentColor" />
        <circle cx="12.5" cy="10" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: '/allies',
    label: 'Find an Ally',
    description: 'Someone to walk alongside you.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="7.5" cy="7" r="2.75" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M2 17C2 14.239 4.462 12 7.5 12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="13.5" cy="11" r="2.75" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M10.5 17.5C10.5 15.567 11.843 14 13.5 14C15.157 14 17 15.567 17 17.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
]

export default function NotFound() {
  return (
    <>
      <PublicHeader />

      <main className={styles.shell}>
        <div className={styles.hero}>

          {/* Decorative background nest illustration */}
          <div className={styles.nestArt} aria-hidden="true">
            <svg width="320" height="296" viewBox="0 0 30 28" fill="none">
              <path d="M 3,16 Q 15,26 27,16" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
              <circle cx="15" cy="8" r="3.2" fill="currentColor" />
            </svg>
          </div>

          <div className={styles.content}>
            <span className={styles.eyebrow}>a quiet detour</span>
            <h1 className={styles.heading}>You seem a little lost.</h1>
            <p className={styles.body}>
              That&rsquo;s alright. The page you were looking for isn&rsquo;t here,
              but the rest of Nest is&nbsp;&mdash; right where you left it.
            </p>

            <div className={styles.cards}>
              {destinations.map(({ href, label, description, icon }) => (
                <Link key={href} href={href} className={styles.card}>
                  <span className={styles.cardIcon}>{icon}</span>
                  <span className={styles.cardBody}>
                    <span className={styles.cardLabel}>{label}</span>
                    <span className={styles.cardDesc}>{description}</span>
                  </span>
                  <span className={styles.cardArrow} aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <NestLogo size={15} color="rgba(248,240,229,0.42)" />
            <div className={styles.footerRight}>
              <span className={styles.footerCopy}>© 2026 Nest. All rights reserved.</span>
              <nav className={styles.footerLinks} aria-label="legal links">
                <Link href="/legal/privacy" className={styles.footerLink}>Privacy</Link>
                <Link href="/legal/terms" className={styles.footerLink}>Terms</Link>
              </nav>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
