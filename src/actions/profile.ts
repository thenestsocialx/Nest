'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type ProfileActionState = {
  error?: string
}

export async function saveSignupProfile(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const name = formData.get('name')
  const phoneCountryCode = formData.get('phone_country_code')
  const phone = formData.get('phone')
  const emergencyCountryCode = formData.get('emergency_country_code')
  const emergencyPhone = formData.get('emergency_phone')
  const whatsappOptIn = formData.get('whatsapp_opt_in') === 'true'
  const tcAccepted = formData.get('tc') === 'true'

  if (typeof name !== 'string' || !name.trim()) {
    return { error: 'Please enter your name.' }
  }
  if (typeof phone !== 'string' || !phone.trim()) {
    return { error: 'Please enter your phone number.' }
  }
  const phoneDigits = phone.replace(/[\s\-()]/g, '')
  if (!/^\d{7,15}$/.test(phoneDigits)) {
    return { error: 'Please enter a valid phone number (digits only, 7–15 characters).' }
  }
  if (!tcAccepted) {
    return { error: 'Please accept the Terms of Use and Privacy Policy.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Session expired. Please sign in again.' }
  }

  const emergencyRaw =
    typeof emergencyPhone === 'string' ? emergencyPhone.replace(/[\s\-()]/g, '') : ''
  const emergencyContact =
    emergencyRaw.length >= 7
      ? `${emergencyCountryCode ?? '+91'}${emergencyRaw}`
      : null

  const { error: dbError } = await supabase
    .from('profiles')
    .update({
      full_name: name.trim(),
      phone: `${phoneCountryCode ?? '+91'}${phoneDigits}`,
      phone_country_code: (phoneCountryCode as string) ?? '+91',
      emergency_contact_phone: emergencyContact,
      whatsapp_opt_in: whatsappOptIn,
      terms_accepted_at: new Date().toISOString(),
      profile_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (dbError) {
    return { error: 'Something went wrong saving your profile. Please try again.' }
  }

  redirect('/nila/onboarding')
}
