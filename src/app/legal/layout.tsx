import type { Metadata } from 'next'
import Link from 'next/link'
import NestLogo from '@/components/ui/NestLogo'
import styles from './legal.module.css'

export const metadata: Metadata = {
  title: {
    template: '%s | The Nest Social',
    default: 'The Nest Social',
  },
}

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* ── HEADER ── */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.headerLogo} aria-label="Nest home">
            <NestLogo size={18} color="#F8F0E5" />
          </Link>

          <Link href="/login" className={styles.headerCta}>
            go to your space →
          </Link>
        </div>
      </header>

      {/* ── PAGE CONTENT ── */}
      <main className={styles.main}>{children}</main>

      {/* ── FOOTER ── */}
      <footer className={styles.footer} aria-label="nest footer">
        <div className={styles.footerInner}>
          <div className={styles.footerLogoRow} aria-label="nest" role="img">
            <NestLogo size={18} color="rgba(248,240,229,0.75)" />
          </div>

          <p className={styles.footerTagline}>
            made with a lot of care, for the in-between days.
          </p>

          <div className={styles.footerContact}>
            <span>7550096933</span>
            <span className={styles.footerDot} aria-hidden="true">·</span>
            <span>care@thenestsocial.com</span>
          </div>

          <div className={styles.footerSep} aria-hidden="true" />

          <div className={styles.footerBottom}>
            <span className={styles.footerCopy}>© 2026 Nest. All rights reserved.</span>
            <nav className={styles.footerLinks} aria-label="legal links">
              <Link href="/legal/privacy" className={styles.footerLink}>
                Privacy Policy
              </Link>
              <Link href="/legal/terms" className={styles.footerLink}>
                Terms &amp; Conditions
              </Link>
              <Link href="/legal/cancellation-refund" className={styles.footerLink}>
                Cancellation &amp; Refund
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </>
  )
}
