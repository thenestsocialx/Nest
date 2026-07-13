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
    url: 'https://thenest.social',
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
  searchParams: Promise<{ code?: string; error?: string; error_description?: string }>
}) {
  const params = await searchParams

  // Supabase drops the auth code here when redirect_to isn't in its allowlist.
  // Forward it to the real callback handler so the session can be exchanged.
  if (params.code) {
    redirect(`/auth/callback?code=${params.code}`)
  }
  if (params.error) {
    redirect(`/login?error=${encodeURIComponent(params.error_description ?? params.error)}`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <LandingPage isAuthenticated={!!user} />
}
