import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
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

export default async function RootPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string; error_code?: string; error_description?: string }>
}) {
  const params = await searchParams

  // Supabase drops the auth code here when redirect_to isn't in its allowlist.
  // Forward it to the real callback handler so the session can be exchanged.
  if (params.code) {
    redirect(`/auth/callback?code=${params.code}`)
  }
  if (params.error) {
    // Supabase sends expired link errors to the Site URL (root), not to /auth/callback
    if (params.error_code === 'otp_expired' || params.error === 'access_denied') {
      redirect('/forgot-password?error=link_expired')
    }
    redirect('/login?error=callback_failed')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <LandingPage isAuthenticated={!!user} />
}
