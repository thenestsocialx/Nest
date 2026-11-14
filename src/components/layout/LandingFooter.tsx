import styles from '@/app/landing.module.css'
import NestLogo from '@/components/ui/NestLogo'

export default function LandingFooter() {
  return (
    <footer className={styles.footer} aria-label="The Nest Social footer">
      <div className={styles.containerWide}>
        <div className={styles.footerInner}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <NestLogo size={20} color="rgba(248,240,229,0.7)" />
          </div>
          <p className={styles.footerTagline}>Made with a lot of care, for the in-between days.</p>
          <div className={styles.footerContact}>
            <a href="tel:7550096933" className={styles.footerContactLink}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.45 2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 6.29 6.29l1.62-1.62a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              7550096933
            </a>
            <span className={styles.footerContactDot} aria-hidden="true">·</span>
            <a href="mailto:care@thenestsocial.com" className={styles.footerContactLink}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              care@thenestsocial.com
            </a>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span className={styles.footerCopy}>© 2026 The Nest Social. All rights reserved.</span>
          <div className={styles.footerLegal}>
            <a href="/business">Nest for Business</a>
            <a href="/legal/privacy">Privacy Policy</a>
            <a href="/legal/terms">Terms &amp; Conditions</a>
            <a href="/legal/cancellation-refund">Cancellation &amp; Refund</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
