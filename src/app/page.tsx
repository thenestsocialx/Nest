import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LandingPage from './_components/LandingPage'

export const metadata: Metadata = {
  title: 'nest — you don\'t have to carry this alone',
  description: 'nest is a warm, private space for people navigating loneliness, breakups, anxiety, relationship struggles and the heavy in-between days.',
  openGraph: {
    title: 'nest — you don\'t have to carry this alone',
    description: 'nest is a warm, private space for people navigating loneliness, breakups, anxiety, relationship struggles and the heavy in-between days.',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Nest',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'nest — you don\'t have to carry this alone',
    description: 'nest is a warm, private space for people navigating loneliness, breakups, anxiety, relationship struggles and the heavy in-between days.',
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
