// Shared helpers for phone (Firebase OTP) sign-in. Safe to import on client and server.

// Supabase sessions are minted through an email magic link, so phone-only users get an
// internal placeholder address on this domain. It never receives mail and is hidden in the UI.
export const PHONE_AUTH_EMAIL_DOMAIN = 'phone.thenestsocial.com'

export function phoneAuthEmail(e164Phone: string): string {
  return `${e164Phone.replace(/\D/g, '')}@${PHONE_AUTH_EMAIL_DOMAIN}`
}

export function isPhoneAuthEmail(email: string | null | undefined): boolean {
  return !!email && email.toLowerCase().endsWith(`@${PHONE_AUTH_EMAIL_DOMAIN}`)
}

export const PHONE_COUNTRY_CODES = [
  { code: '+91', label: '🇮🇳 +91' },
  { code: '+1', label: '🇺🇸 +1' },
  { code: '+44', label: '🇬🇧 +44' },
  { code: '+61', label: '🇦🇺 +61' },
  { code: '+971', label: '🇦🇪 +971' },
] as const
