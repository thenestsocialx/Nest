'use server'

import { getAdminUser } from '@/lib/auth-admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { PHONE_AUTH_FLAG_KEY } from '@/lib/phone-auth-flag'

/** Turns phone (SMS OTP) sign-in on or off for everyone. Upserts, so it works before the row exists. */
export async function setPhoneAuthEnabled(enabled: boolean): Promise<{ error?: string }> {
  const user = await getAdminUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await createAdminClient()
    .from('nest_config')
    .upsert({
      key: PHONE_AUTH_FLAG_KEY,
      value: enabled ? 'true' : 'false',
      description: 'Allow sign-in and sign-up with a phone number (Firebase SMS OTP)',
      updated_at: new Date().toISOString(),
    })

  if (error) {
    console.error('[setPhoneAuthEnabled]', error)
    return { error: 'Failed to save' }
  }
  return {}
}
