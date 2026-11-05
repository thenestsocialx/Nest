import type { Metadata } from 'next'
import LandingPage from './_components/LandingPage'
import { SITE_URL } from '@/lib/site'

const HOME_TITLE = 'The Nest Social | Online Therapy & Relationship Support in India'
const HOME_DESCRIPTION = 'The Nest Social is a warm, credentialed space for online therapy and relationship support in India. Talk to Nila anytime, or book a verified psychologist. Start free.'

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: SITE_URL,
    siteName: 'The Nest Social',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
}

// Static: built once and served from the CDN. Auth links that land on /?code=...
// or /?error=... are redirected in src/proxy.ts, and the header checks sign-in
// in the browser, so nothing here depends on the request.
export default function RootPage() {
  return <LandingPage />
}
