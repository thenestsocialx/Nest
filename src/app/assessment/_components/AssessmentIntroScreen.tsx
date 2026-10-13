'use client'

import NestLogo from '@/components/ui/NestLogo'
import styles from './assessmentIntro.module.css'

interface Props {
  onStart: () => void
  onSkip: () => void
}

const ICON = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

const WHY = [
  {
    title: 'Know Yourself a Little Better',
    body: 'See the patterns in how you’ve been feeling.',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" {...ICON}>
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    title: 'Put Words to What You’re Carrying',
    body: 'Naming it often makes it feel a little lighter.',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" {...ICON}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><path d="M8 9h8M8 13h5" />
      </svg>
    ),
  },
  {
    title: 'A Quiet Moment for Yourself',
    body: 'A pause to notice how you really are.',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" {...ICON}>
        <path d="M12 20s-7-4.4-7-9.5A3.5 3.5 0 0 1 12 8a3.5 3.5 0 0 1 7 2.5C19 15.6 12 20 12 20z" /><path d="M4 14l3 2M20 14l-3 2" />
      </svg>
    ),
  },
]

const OPTIONS = [
  {
    title: 'Meet an Ally',
    body: 'Talk to a licensed psychologist matched to you.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" {...ICON}>
        <circle cx="9" cy="8" r="3.2" /><path d="M3 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
        <circle cx="17" cy="9" r="2.4" /><path d="M16.5 13.6c2.6.3 4.5 2.2 4.5 4.9" />
      </svg>
    ),
  },
  {
    title: 'Talk to Nila',
    body: 'Chat it through whenever something’s on your mind.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" {...ICON}>
        <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
      </svg>
    ),
  },
  {
    title: 'Explore Resources',
    body: 'Exercises, reads and playlists for where you are.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" {...ICON}>
        <path d="M12 6c-2-1.5-5-2-8-1.5V19c3-.5 6 0 8 1.5M12 6c2-1.5 5-2 8-1.5V19c-3-.5-6 0-8 1.5M12 6v14.5" />
      </svg>
    ),
  },
]

export default function AssessmentIntroScreen({ onStart, onSkip }: Props) {
  return (
    <div className={styles.page}>
      <aside className={styles.aside}>
        <div className={styles.intro}>
          <div className={styles.logo}>
            <NestLogo size={24} color="#F8F0E5" />
          </div>

          <div className={styles.bubbles}>
            <div className={styles.bubble}>Hi, we&rsquo;re really glad you&rsquo;re here.</div>
            <div className={styles.bubble}>Take your time. There are no wrong answers here.</div>
          </div>
          <div className={styles.team}>
            <span className={styles.teamAvatar} aria-hidden="true">
              <svg width="18" height="17" viewBox="0 0 30 28" fill="none">
                <path d="M 3,16 Q 15,26 27,16" stroke="#2F4C3A" strokeWidth="3.2" strokeLinecap="round" />
                <circle cx="15" cy="8" r="3.2" fill="#2F4C3A" />
              </svg>
            </span>
            The Nest care team
          </div>
        </div>

        <div className={styles.why}>
          <div className={styles.divider} />
          <p className={styles.whyLabel}>Why it&rsquo;s worth a few minutes</p>
          <ul className={styles.whyList}>
            {WHY.map((w) => (
              <li key={w.title} className={styles.whyItem}>
                <span className={styles.whyIcon}>{w.icon}</span>
                <div>
                  <p className={styles.whyTitle}>{w.title}</p>
                  <p className={styles.whyBody}>{w.body}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className={styles.helpline}>
            If tonight is really hard, call Tele-MANAS at <a href="tel:14416">14416</a>
          </p>
        </div>
      </aside>

      <div className={styles.main}>
        <svg className={styles.rings} viewBox="0 0 820 820" fill="none" aria-hidden="true">
          <circle cx="410" cy="410" r="300" stroke="#E8C8A0" strokeOpacity="0.28" />
          <circle cx="410" cy="410" r="405" stroke="#E8C8A0" strokeOpacity="0.18" />
        </svg>

        <span className={styles.privacy}>
          <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true" {...ICON} stroke="#9B6651" strokeWidth={2}>
            <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          Private and confidential
        </span>

        <div className={styles.inner}>
          <p className={styles.eyebrow}>Before you begin</p>
          <h1 className={styles.title}>Let&rsquo;s Take a Moment to See How You&rsquo;re Doing.</h1>

          <ol className={styles.steps}>
            <li className={styles.step}>
              <span className={styles.stepNum}>1</span>
              <div>
                <p className={styles.stepTitle}>Take the Check-In</p>
                <p className={styles.stepBody}>A few honest questions about how things have been for you lately.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNum}>2</span>
              <div>
                <p className={styles.stepTitle}>We&rsquo;ll Suggest Where to Start</p>
                <p className={styles.stepBody}>Based on your answers, we&rsquo;ll recommend the support that fits you best.</p>
              </div>
            </li>
          </ol>

          <div className={styles.branch} aria-hidden="true">
            <span className={styles.drop} style={{ left: 'calc((100% - 28px) / 6)' }} />
            <span className={styles.drop} style={{ left: '50%' }} />
            <span className={styles.drop} style={{ left: 'calc(100% - (100% - 28px) / 6)' }} />
          </div>

          <div className={styles.options}>
            {OPTIONS.map((o) => (
              <div key={o.title} className={styles.option}>
                <span className={styles.optionIcon}>{o.icon}</span>
                <p className={styles.optionTitle}>{o.title}</p>
                <p className={styles.optionBody}>{o.body}</p>
              </div>
            ))}
          </div>

          <div className={styles.ctas}>
            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={onStart}>
              Start the Check-In <span aria-hidden="true">→</span>
            </button>
            <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={onSkip}>
              Skip for Now
            </button>
          </div>
          <p className={styles.note}>You can take the check-in anytime from your dashboard.</p>
        </div>
      </div>
    </div>
  )
}
