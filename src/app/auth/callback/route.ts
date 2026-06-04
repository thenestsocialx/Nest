import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/home'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  if (error) {
    const url = new URL('/login', origin)
    url.searchParams.set('error', errorDescription ?? 'Link expired. Please request a new one.')
    return NextResponse.redirect(url)
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // If returning from assessment, skip straight to save
        if (next === '/assessment/save') {
          return NextResponse.redirect(new URL('/assessment/save', origin))
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('profile_completed, nila_onboarded')
          .eq('id', user.id)
          .maybeSingle()

        // New user — profile form not yet completed
        if (!profile || !profile.profile_completed) {
          return NextResponse.redirect(new URL('/signup', origin))
        }

        // Profile done but NILA onboarding not yet completed
        if (!profile.nila_onboarded) {
          return NextResponse.redirect(new URL('/nila/onboarding', origin))
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  const url = new URL('/login', origin)
  url.searchParams.set('error', 'callback_failed')
  return NextResponse.redirect(url)
}
