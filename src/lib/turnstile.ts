// Cloudflare Turnstile site key (public). When set, the auth forms show the bot check and the
// server actions require its token; Supabase then verifies it (Auth > Attack Protection > CAPTCHA).
// Leave unset to switch the check off.
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

/** The token the widget adds to a form, or undefined when there isn't one */
export function captchaTokenFrom(formData: FormData): string | undefined {
  const token = formData.get('cf-turnstile-response')
  return typeof token === 'string' && token ? token : undefined
}

export const CAPTCHA_MISSING = 'Please wait for the security check to finish, then try again.'
