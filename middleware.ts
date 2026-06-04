import { NextRequest, NextResponse } from 'next/server'

const PROTECTED = ['/app', '/assessment', '/onboarding', '/dashboard', '/signup']

export function middleware(req: NextRequest) {
  const mode = process.env.NEXT_PUBLIC_APP_MODE ?? 'live'
  if (mode === 'waitlist') {
    const { pathname } = req.nextUrl
    const isProtected = PROTECTED.some((p) => pathname.startsWith(p))
    if (isProtected) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/app/:path*',
    '/assessment/:path*',
    '/onboarding/:path*',
    '/dashboard/:path*',
    '/signup/:path*',
    '/signup',
  ],
}
