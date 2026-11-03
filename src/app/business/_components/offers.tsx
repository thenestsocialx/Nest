import type { ReactNode } from 'react'
import styles from '../business.module.css'

export interface Offer {
  title: string
  text: string
  who: string
  bg: string
  /** The matching choice in the "What are you looking for?" field of the contact form */
  interest: string
  art: ReactNode
}

export const INTERESTS = [
  'Individual Care (1:1 Therapy)',
  'Awareness Workshops',
  'Creative Wellbeing Sessions',
  'Animal-Assisted Therapy',
  'Team and Leadership Training',
  'POSH Training and Compliance',
  'A Mix of These',
  'Something Else',
]

const shadow = <ellipse cx="200" cy="178" rx="170" ry="10" fill="rgba(36,59,46,.10)" />

function Art({ children }: { children: ReactNode }) {
  return <svg width="400" height="190" viewBox="0 0 400 190" fill="none" aria-hidden="true">{shadow}{children}</svg>
}

export const OFFERS: Offer[] = [
  {
    title: 'Individual Care', bg: '#E8C8A0', who: 'Workplaces · Colleges', interest: INTERESTS[0],
    text: 'Confidential one-on-one therapy with licensed psychologists, matched to the person, not assigned by turn.',
    art: (
      <Art>
        <circle cx="200" cy="52" r="34" fill="#FBF6EE" opacity=".55" />
        <path d="M186 58 h28 l-6 -22 h-16 z" fill="#FBF6EE" /><rect x="198" y="58" width="4" height="104" fill="#243B2E" /><ellipse cx="200" cy="164" rx="16" ry="4" fill="#243B2E" />
        <path d="M70 176 V118 a22 22 0 0 1 22-22 h10 a18 18 0 0 1 18 18 v62" fill="#9B6651" /><path d="M81.1 152 C81.1 122.6 88.7 110.0 100.0 110.0 C111.3 110.0 118.9 122.6 118.9 152 Z" fill="#2F4C3A" /><circle cx="100.0" cy="97.4" r="10.5" fill="#FBF6EE" /><rect x="60" y="140" width="72" height="22" rx="10" fill="#B07A63" />
        <path d="M330 176 V118 a22 22 0 0 0-22-22 h-10 a18 18 0 0 0-18 18 v62" fill="#2F4C3A" /><path d="M281.1 152 C281.1 122.6 288.7 110.0 300.0 110.0 C311.3 110.0 318.9 122.6 318.9 152 Z" fill="#9B6651" /><circle cx="300.0" cy="97.4" r="10.5" fill="#FBF6EE" /><rect x="268" y="140" width="72" height="22" rx="10" fill="#243B2E" />
        <rect x="232" y="146" width="22" height="30" rx="4" fill="#C9B08A" />
        <path d="M243 146 C232 126 236 112 243 102 C250 112 254 126 243 146z M243 146 C226 136 222 124 226 116 C236 120 242 130 243 146z" fill="#7E9783" />
      </Art>
    ),
  },
  {
    title: 'Awareness Workshops', bg: '#C9D3C4', who: 'Workplaces · Schools · Colleges', interest: INTERESTS[1],
    text: 'Group sessions on stress, burnout, boundaries and the things teams rarely say out loud. Practical, warm and never preachy.',
    art: (
      <Art>
        <circle cx="330" cy="46" r="26" fill="#FBF6EE" opacity=".5" />
        <path d="M150 176 L168 120 M250 176 L232 120 M200 120 V176" stroke="#243B2E" strokeWidth="4" strokeLinecap="round" />
        <rect x="140" y="30" width="120" height="92" rx="8" fill="#FBF6EE" stroke="#243B2E" strokeWidth="3" />
        <path className={styles.draw} d="M156 102 L180 84 L200 92 L224 62 L244 54" stroke="#9B6651" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="152" y="40" width="22" height="16" rx="2" fill="#E8C8A0" /><rect x="178" y="40" width="22" height="16" rx="2" fill="#7E9783" opacity=".6" />
        <path d="M275.3 176 C275.3 143.8 283.6 130.0 296.0 130.0 C308.4 130.0 316.7 143.8 316.7 176 Z" fill="#2F4C3A" /><circle cx="296.0" cy="116.2" r="11.5" fill="#FBF6EE" />
        <path d="M282 132 L250 98" stroke="#2F4C3A" strokeWidth="6" strokeLinecap="round" />
        <path d="M60.0 176 C60.0 148.0 67.2 136.0 78.0 136.0 C88.8 136.0 96.0 148.0 96.0 176 Z" fill="#9B6651" /><circle cx="78.0" cy="124.0" r="10.0" fill="#FBF6EE" /><path d="M98.9 176 C98.9 149.4 105.7 138.0 116.0 138.0 C126.3 138.0 133.1 149.4 133.1 176 Z" fill="#243B2E" /><circle cx="116.0" cy="126.6" r="9.5" fill="#FBF6EE" />
      </Art>
    ),
  },
  {
    title: 'Creative Wellbeing', bg: '#E3B9A6', who: 'Workplaces · Schools · Colleges', interest: INTERESTS[2],
    text: 'Music and art therapy, musical journaling and music-based listening circles. Wellbeing that doesn’t feel like a seminar.',
    art: (
      <Art>
        <circle cx="200" cy="96" r="70" fill="#FBF6EE" opacity=".35" />
        <g className={styles.bob}>
          <path d="M172 74 V36 L210 28 V66" stroke="#243B2E" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <ellipse cx="164" cy="76" rx="10" ry="7.5" fill="#243B2E" transform="rotate(-18 164 76)" /><ellipse cx="202" cy="68" rx="10" ry="7.5" fill="#243B2E" transform="rotate(-18 202 68)" />
        </g>
        <g className={`${styles.bob} ${styles.bobLate}`}><path d="M246 64 V34" stroke="#9B6651" strokeWidth="4.5" strokeLinecap="round" /><path d="M246 34 q14 4 12 18" stroke="#9B6651" strokeWidth="4.5" strokeLinecap="round" /><ellipse cx="239" cy="66" rx="8.5" ry="6.5" fill="#9B6651" transform="rotate(-18 239 66)" /></g>
        <path d="M300 120 c-26 0 -40 16 -36 34 c3 14 22 18 34 12 c8 -4 6 -12 14 -12 c10 0 20 -6 18 -16 c-3 -12 -14 -18 -30 -18z" fill="#FBF6EE" />
        <circle cx="286" cy="134" r="5" fill="#9B6651" /><circle cx="302" cy="130" r="5" fill="#2F4C3A" /><circle cx="316" cy="140" r="5" fill="#E8C8A0" stroke="#C9B08A" strokeWidth="1.5" /><circle cx="282" cy="152" r="5" fill="#7E9783" />
        <path d="M100.9 176 C100.9 149.4 107.7 138.0 118.0 138.0 C128.3 138.0 135.1 149.4 135.1 176 Z" fill="#2F4C3A" /><circle cx="118.0" cy="126.6" r="9.5" fill="#FBF6EE" /><path d="M143.8 176 C143.8 150.8 150.3 140.0 160.0 140.0 C169.7 140.0 176.2 150.8 176.2 176 Z" fill="#9B6651" /><circle cx="160.0" cy="129.2" r="9.0" fill="#FBF6EE" /><path d="M184.0 176 C184.0 148.0 191.2 136.0 202.0 136.0 C212.8 136.0 220.0 148.0 220.0 176 Z" fill="#243B2E" /><circle cx="202.0" cy="124.0" r="10.0" fill="#FBF6EE" />
      </Art>
    ),
  },
  {
    title: 'Animal-Assisted Therapy', bg: '#E8C8A0', who: 'Workplaces · Schools · Colleges', interest: INTERESTS[3],
    text: 'Some breakthroughs happen with a dog who doesn’t need you to explain anything. Gentle, guided group sessions.',
    art: (
      <Art>
        <circle cx="320" cy="50" r="24" fill="#FBF6EE" opacity=".5" />
        <path d="M128.4 176 C128.4 142.4 137.0 128.0 150.0 128.0 C163.0 128.0 171.6 142.4 171.6 176 Z" fill="#2F4C3A" /><circle cx="150.0" cy="113.6" r="12.0" fill="#FBF6EE" />
        <path d="M170 150 q14 -6 26 2" stroke="#2F4C3A" strokeWidth="9" strokeLinecap="round" />
        <g>
          <path d="M206 176 V150 c0 -18 14 -28 34 -28 h22 c18 0 30 12 30 30 v24 z" fill="#9B6651" />
          <rect x="214" y="160" width="12" height="18" rx="5" fill="#7C4F3E" /><rect x="270" y="160" width="12" height="18" rx="5" fill="#7C4F3E" />
          <path d="M290 150 q22 -8 20 -30" stroke="#9B6651" strokeWidth="8" strokeLinecap="round" className={styles.wag} />
          <circle cx="222" cy="114" r="24" fill="#9B6651" />
          <path d="M204 100 q-12 10 -6 30 q10 -4 14 -18z" fill="#7C4F3E" /><path d="M238 96 q14 6 12 26 q-10 -2 -14 -16z" fill="#7C4F3E" />
          <circle cx="214" cy="112" r="3" fill="#243B2E" /><circle cx="230" cy="112" r="3" fill="#243B2E" /><ellipse cx="222" cy="124" rx="5" ry="3.5" fill="#243B2E" />
        </g>
        <path className={styles.bob} d="M186 86s-10-6-10-12.8a5.5 5.5 0 0 1 10-3 5.5 5.5 0 0 1 10 3c0 6.8-10 12.8-10 12.8z" fill="#FBF6EE" />
      </Art>
    ),
  },
  {
    title: 'Team and Leadership', bg: '#C9D3C4', who: 'Workplaces', interest: INTERESTS[4],
    text: 'Team building, leadership training and soft skills that turn teams who coexist into teams who actually work together.',
    art: (
      <Art>
        <path d="M87.5 176 C87.5 141.0 96.5 126.0 110.0 126.0 C123.5 126.0 132.5 141.0 132.5 176 Z" fill="#243B2E" /><circle cx="110.0" cy="111.0" r="12.5" fill="#E8C8A0" />
        <rect x="124" y="104" width="20" height="26" rx="3" fill="#FBF6EE" transform="rotate(-10 134 117)" />
        <g className={styles.bob}>
          <path d="M140 26 h104 a14 14 0 0 1 14 14 v28 a14 14 0 0 1 -14 14 h-78 l-16 14 v-14 h-10 a14 14 0 0 1 -14 -14 v-28 a14 14 0 0 1 14 -14z" fill="#FBF6EE" />
          <path d="M150 46 h80 M150 60 h56" stroke="#C9B08A" strokeWidth="5" strokeLinecap="round" />
        </g>
        <path d="M216.2 176 C216.2 151.4 222.5 140.8 232.0 140.8 C241.5 140.8 247.8 151.4 247.8 176 Z" fill="#C9B08A" /><circle cx="232.0" cy="130.2" r="8.8" fill="#FBF6EE" /><path d="M265.4 176 C265.4 150.2 272.1 139.2 282.0 139.2 C291.9 139.2 298.6 150.2 298.6 176 Z" fill="#9B6651" /><circle cx="282.0" cy="128.2" r="9.2" fill="#E8C8A0" /><path d="M316.5 176 C316.5 151.9 322.7 141.6 332.0 141.6 C341.3 141.6 347.5 151.9 347.5 176 Z" fill="#7E9783" /><circle cx="332.0" cy="131.3" r="8.6" fill="#FBF6EE" />
        <path className={`${styles.bob} ${styles.bobLate}`} d="M300 104s-9-5.3-9-11.4a4.9 4.9 0 0 1 9-2.7 4.9 4.9 0 0 1 9 2.7c0 6.1-9 11.4-9 11.4z" fill="#9B6651" />
      </Art>
    ),
  },
  {
    title: 'POSH, Done Right', bg: '#E3B9A6', who: 'Workplaces · Colleges', interest: INTERESTS[5],
    text: 'Expert-led training in a drama-skit format, policy drafting, Internal Committee setup and ongoing awareness. A culture practice, not a yearly checkbox.',
    art: (
      <Art>
        <rect x="262" y="42" width="66" height="84" rx="6" fill="#FBF6EE" transform="rotate(8 295 84)" />
        <g transform="rotate(8 295 84)"><path d="M274 62h42M274 74h42M274 86h30M274 98h36" stroke="#C9B08A" strokeWidth="4" strokeLinecap="round" /></g>
        <path className={styles.glowp} d="M200 22 L246 40 V82 C246 116 226 138 200 150 C174 138 154 116 154 82 V40 Z" fill="#2F4C3A" />
        <path d="M200 36 L234 49 V82 C234 108 219 126 200 135 C181 126 166 108 166 82 V49 Z" fill="#E8C8A0" opacity=".22" />
        <path className={styles.tickb} d="M182 86 L196 100 L222 72" stroke="#FBF6EE" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M77.1 176 C77.1 146.6 84.7 134.0 96.0 134.0 C107.3 134.0 114.9 146.6 114.9 176 Z" fill="#9B6651" /><circle cx="96.0" cy="121.4" r="10.5" fill="#E8C8A0" /><path d="M118.9 176 C118.9 149.4 125.7 138.0 136.0 138.0 C146.3 138.0 153.1 149.4 153.1 176 Z" fill="#C9B08A" /><circle cx="136.0" cy="126.6" r="9.5" fill="#FBF6EE" /><path d="M322.0 176 C322.0 148.0 329.2 136.0 340.0 136.0 C350.8 136.0 358.0 148.0 358.0 176 Z" fill="#243B2E" /><circle cx="340.0" cy="124.0" r="10.0" fill="#E8C8A0" />
      </Art>
    ),
  },
]
