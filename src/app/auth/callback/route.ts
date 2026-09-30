import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/home'
  const error = searchParams.get('error')
  const errorCode = searchParams.get('error_code')

  if (error) {
    // OTP/magic link expired — send user to forgot-password so they can request a fresh link
    if (errorCode === 'otp_expired' || error === 'access_denied') {
      return NextResponse.redirect(new URL('/forgot-password?error=link_expired', origin))
    }
    // All other auth errors fall back to the login page
    return NextResponse.redirect(new URL('/login?error=callback_failed', origin))
  }

  if (code) {
    const supabase = await createClient()
    const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      // Detect password-recovery sessions via the JWT AMR claim.
      // This catches the case where Supabase ignores our ?next= redirectTo (allowlist
      // mismatch) and drops the code at the site root, losing the next param entirely.
      const accessToken = exchangeData.session?.access_token
      if (accessToken) {
        try {
          const payload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64url').toString())
          if (Array.isArray(payload.amr) && payload.amr.some((a: { method: string }) => a.method === 'recovery')) {
            return NextResponse.redirect(new URL('/auth/reset-password', origin))
          }
        } catch {}
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // If returning from assessment, skip straight to save
        if (next === '/assessment/save') {
          return NextResponse.redirect(new URL('/assessment/save', origin))
        }

        // Password recovery — session is live; go straight to the reset form
        if (next === '/auth/reset-password') {
          return NextResponse.redirect(new URL('/auth/reset-password', origin))
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
