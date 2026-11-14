'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { validatePasswordRules } from '@/lib/password'
import { TURNSTILE_SITE_KEY, captchaTokenFrom, CAPTCHA_MISSING } from '@/lib/turnstile'

const CAPTCHA_FAILED = 'The security check didn’t go through. Please try again.'
const isCaptchaError = (message: string) => message.toLowerCase().includes('captcha')

async function getOrigin(): Promise<string> {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  const h = await headers()
  const host = h.get('host') ?? 'localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? 'http'
  return `${proto}://${host}`
}

export type AuthActionState = {
  error?: string
  field?: 'email' | 'password' | 'confirm'
  success?: boolean
  email?: string
}

async function routeAfterAuth(): Promise<never> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('profile_completed, nila_onboarded')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || !profile.profile_completed) redirect('/signup')
  if (!profile.nila_onboarded) redirect('/nila/onboarding')
  redirect('/home')
}

export async function signUpWithEmail(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = ((formData.get('email') as string) ?? '').trim()
  const password = (formData.get('password') as string) ?? ''
  const confirm = (formData.get('confirm') as string) ?? ''

  // Hidden field people never see. Bots that fill it get the normal success screen, but no account
  if (((formData.get('website') as string) ?? '').trim()) {
    return { success: true, email }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRegex.test(email)) {
    return { error: 'Please enter a valid email address.', field: 'email' }
  }

  const pwError = validatePasswordRules(password)
  if (pwError) return { error: pwError, field: 'password' }

  if (password !== confirm) {
    return { error: "Passwords don't match.", field: 'confirm' }
  }

  const captchaToken = captchaTokenFrom(formData)
  if (TURNSTILE_SITE_KEY && !captchaToken) return { error: CAPTCHA_MISSING }

  const supabase = await createClient()
  const origin = await getOrigin()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback`, captchaToken },
  })

  if (error) {
    if (isCaptchaError(error.message)) return { error: CAPTCHA_FAILED }
    const msg = error.message.toLowerCase()
    if (msg.includes('already registered') || msg.includes('user already exists')) {
      return { error: 'An account with this email already exists. Try signing in.', field: 'email' }
    }
    if (msg.includes('password') || msg.includes('weak')) {
      return { error: error.message, field: 'password' }
    }
    return { error: error.message }
  }

  return { success: true, email }
}

export async function signInWithEmail(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = ((formData.get('email') as string) ?? '').trim()
  const password = (formData.get('password') as string) ?? ''

  if (!email) {
    return { error: 'Please enter your email address.', field: 'email' }
  }

  const loginEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!loginEmailRegex.test(email)) {
    return { error: 'Please enter a valid email address.', field: 'email' }
  }

  if (!password) {
    return { error: 'Please enter your password.', field: 'password' }
  }

  const captchaToken = captchaTokenFrom(formData)
  if (TURNSTILE_SITE_KEY && !captchaToken) return { error: CAPTCHA_MISSING }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password, options: { captchaToken } })

  if (error) {
    if (isCaptchaError(error.message)) return { error: CAPTCHA_FAILED }
    const msg = error.message.toLowerCase()
    if (msg.includes('email not confirmed')) {
      return {
        error: 'Please verify your email before signing in. Check your inbox.',
        field: 'email',
      }
    }
    return { error: 'Incorrect email or password.', field: 'password' }
  }

  return routeAfterAuth()
}

export async function sendPasswordReset(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = ((formData.get('email') as string) ?? '').trim()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRegex.test(email)) {
    return { error: 'Please enter a valid email address.', field: 'email' }
  }

  const captchaToken = captchaTokenFrom(formData)
  if (TURNSTILE_SITE_KEY && !captchaToken) return { error: CAPTCHA_MISSING, email }

  const supabase = await createClient()
  const origin = await getOrigin()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
    captchaToken,
  })
  // Other errors stay hidden so the form never reveals whether an account exists
  if (error && isCaptchaError(error.message)) return { error: CAPTCHA_FAILED, email }

  return { success: true, email }
}

export async function updatePassword(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = (formData.get('password') as string) ?? ''
  const confirm = (formData.get('confirm') as string) ?? ''

  const pwError = validatePasswordRules(password)
  if (pwError) return { error: pwError, field: 'password' }

  if (password !== confirm) {
    return { error: "Passwords don't match.", field: 'confirm' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) return { error: error.message, field: 'password' }

  redirect('/home')
}

export async function resendVerification(email: string, captchaToken?: string): Promise<{ error?: string }> {
  if (TURNSTILE_SITE_KEY && !captchaToken) return { error: CAPTCHA_MISSING }
  const supabase = await createClient()
  const origin = await getOrigin()
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: `${origin}/auth/callback`, captchaToken },
  })
  if (error && isCaptchaError(error.message)) return { error: CAPTCHA_FAILED }
  return error ? { error: error.message } : {}
}

export async function signInWithMagicLink(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = formData.get('email')

  if (typeof email !== 'string' || !email.trim()) {
    return { error: 'Please enter your email address.' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { error: 'Please enter a valid email address.' }
  }

  const captchaToken = captchaTokenFrom(formData)
  if (TURNSTILE_SITE_KEY && !captchaToken) return { error: CAPTCHA_MISSING }

  const supabase = await createClient()
  const origin = await getOrigin()
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      captchaToken,
    },
  })

  if (error) {
    if (isCaptchaError(error.message)) return { error: CAPTCHA_FAILED }
    return { error: error.message }
  }

  return { success: true, email: email.trim() }
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const origin = await getOrigin()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
      skipBrowserRedirect: true,
    },
  })

  if (error || !data.url) {
    redirect('/login?error=oauth_failed')
  }

  redirect(data.url)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
