import type { Metadata } from 'next'
import { DM_Sans, Lora } from 'next/font/google'
import { SITE_URL } from '@/lib/site'
import BusinessPage from './_components/BusinessPage'

// The design uses heavier weights than the site-wide fonts load, so this page loads its own
const sans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], style: ['normal', 'italic'], variable: '--biz-sans', display: 'swap' })
const serif = Lora({ subsets: ['latin'], weight: ['400', '500', '600', '700'], style: ['normal', 'italic'], variable: '--biz-serif', display: 'swap' })

const TITLE = 'Nest for Business | Workplace Mental Health in India | The Nest Social'
const DESCRIPTION = 'Therapy, workshops, POSH and leadership training for workplaces, schools and colleges in India. Confidential, led by licensed psychologists, built around your people.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/business` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}/business`, siteName: 'The Nest Social', type: 'website' },
  twitter: { card: 'summary', title: TITLE, description: DESCRIPTION },
}

export default function Page() {
  return (
    <div className={`${sans.variable} ${serif.variable}`}>
      {/* Sets the canvas zoom before first paint so laptops don't see the full 1440px width flash */}
      <script dangerouslySetInnerHTML={{ __html: "(function(){var s=document.getElementById('biz-zoom')||document.head.appendChild(Object.assign(document.createElement('style'),{id:'biz-zoom'}));s.textContent=':root{--biz-zoom:'+Math.min(1,document.documentElement.clientWidth/1440)+'}'})()" }} />
      <BusinessPage />
    </div>
  )
}
