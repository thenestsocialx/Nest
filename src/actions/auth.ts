'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getFirebaseAdminAuth } from '@/lib/firebase/admin'
import { phoneAuthEmail } from '@/lib/phone-auth'
import { isPhoneAuthEnabled } from '@/lib/phone-auth-flag'
import { validatePasswordRules } from '@/lib/password'

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

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRegex.test(email)) {
    return { error: 'Please enter a valid email address.', field: 'email' }
  }

  const pwError = validatePasswordRules(password)
  if (pwError) return { error: pwError, field: 'password' }

  if (password !== confirm) {
    return { error: "Passwords don't match.", field: 'confirm' }
  }

  const supabase = await createClient()
  const origin = await getOrigin()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  })

  if (error) {
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

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
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

  const supabase = await createClient()
  const origin = await getOrigin()
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
  })

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

export async function resendVerification(email: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const origin = await getOrigin()
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  })
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

  const supabase = await createClient()
  const origin = await getOrigin()
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
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

// Firebase ID tokens older than this are rejected, so a leaked token can't be replayed later.
const PHONE_TOKEN_MAX_AGE_SECONDS = 5 * 60

/**
 * Sign in (or sign up) with a phone number verified by Firebase SMS OTP.
 * The browser verifies the OTP with Firebase and sends us the resulting ID token; we verify
 * it with firebase-admin, then create/find the matching Supabase user and start a Supabase
 * session via a server-generated magic link (no email is sent).
 */
export async function signInWithPhone(idToken: string): Promise<AuthActionState> {
  if (!(await isPhoneAuthEnabled())) {
    return { error: 'Phone sign-in is unavailable right now. Please use email or Google.' }
  }
  if (typeof idToken !== 'string' || !idToken) {
    return { error: 'Verification failed. Please try again.' }
  }

  let phone: string
  try {
    const decoded = await getFirebaseAdminAuth().verifyIdToken(idToken)
    if (decoded.firebase.sign_in_provider !== 'phone' || !decoded.phone_number) {
      return { error: 'Verification failed. Please try again.' }
    }
    if (Date.now() / 1000 - decoded.auth_time > PHONE_TOKEN_MAX_AGE_SECONDS) {
      return { error: 'Your code has expired. Please request a new one.' }
    }
    phone = decoded.phone_number
  } catch {
    return { error: 'We couldn’t verify your number. Please try again.' }
  }

  const email = phoneAuthEmail(phone)
  const admin = createAdminClient()

  const { error: createError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    phone: phone.replace(/\D/g, ''),
    phone_confirm: true,
    user_metadata: { signup_method: 'phone' },
  })
  // email_exists = returning phone user; anything else is a real failure
  if (createError && createError.code !== 'email_exists') {
    if (createError.code === 'phone_exists') {
      return { error: 'This number is already linked to another account. Try signing in with email.' }
    }
    return { error: 'Something went wrong. Please try again.' }
  }

  const { data: link, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  })
  if (linkError || !link.properties?.hashed_token) {
    return { error: 'Something went wrong. Please try again.' }
  }

  const supabase = await createClient()
  const { error: otpError } = await supabase.auth.verifyOtp({
    type: 'email',
    token_hash: link.properties.hashed_token,
  })
  if (otpError) {
    return { error: 'Something went wrong. Please try again.' }
  }

  return routeAfterAuth()
}
