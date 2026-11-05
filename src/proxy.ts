import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED = ['/home', '/nila', '/allies', '/resources', '/events', '/settings', '/assessment/save']

// These pages show a public landing page to guests and the app to signed-in users,
// so only their sub-pages (e.g. /nila/history) need a login.
const PUBLIC_LANDINGS = ['/nila', '/allies']

function isProtected(pathname: string): boolean {
  if (PUBLIC_LANDINGS.includes(pathname)) return false
  return PROTECTED.some(prefix => pathname === prefix || pathname.startsWith(prefix + '/'))
}

// Supabase sends some auth links to the Site URL (/) instead of /auth/callback.
// Handled here (not in app/page.tsx) so the homepage itself can stay static.
function homeAuthRedirect(request: NextRequest): NextResponse | null {
  if (request.nextUrl.pathname !== '/') return null
  const params = request.nextUrl.searchParams
  const code = params.get('code')
  const error = params.get('error')
  if (!code && !error) return null

  const to = request.nextUrl.clone()
  to.search = ''
  if (code) {
    // Supabase drops the auth code here when redirect_to isn't in its allowlist.
    // Forward it to the real callback handler so the session can be exchanged.
    to.pathname = '/auth/callback'
    to.searchParams.set('code', code)
  } else if (params.get('error_code') === 'otp_expired' || error === 'access_denied') {
    // Expired link errors land on the Site URL (root), not on /auth/callback
    to.pathname = '/forgot-password'
    to.searchParams.set('error', 'link_expired')
  } else {
    to.pathname = '/login'
    to.searchParams.set('error', 'callback_failed')
  }
  return NextResponse.redirect(to, 307)
}

export async function proxy(request: NextRequest) {
  const authRedirect = homeAuthRedirect(request)
  if (authRedirect) return authRedirect

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (isProtected(request.nextUrl.pathname) && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
