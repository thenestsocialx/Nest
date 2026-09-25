import styles from '@/app/landing.module.css'

export default function LandingHelpline() {
  return (
    <div className={styles.crisisStrip} role="complementary" aria-label="Crisis support">
      <div className={`${styles.containerWide} ${styles.crisisStripInner}`}>
        <span className={styles.crisisStripLabel}>If tonight is really hard —</span>
        <div className={styles.crisisStripNumbers}>
          <span className={styles.crisisChip}>Tele-MANAS 14416</span>
          <span className={styles.crisisChip}>iCall 9152987821</span>
          <span className={styles.crisisChip}>Vandrevala 1860-2662-345</span>
          <span className={styles.crisisChip}>US: 988</span>
          <span className={styles.crisisChip}>UK: Samaritans 116 123</span>
          <span className={styles.crisisChip}>
            <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer">findahelpline.com ↗</a>
          </span>
          <span className={styles.crisisStripEnd}>you matter.</span>
        </div>
      </div>
    </div>
  )
}
