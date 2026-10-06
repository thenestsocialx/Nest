// SERVER ONLY — the admin on/off switch for phone (Firebase SMS OTP) sign-in.
import { createAdminClient } from '@/lib/supabase/admin'

export const PHONE_AUTH_FLAG_KEY = 'features.phone_auth.enabled'

/**
 * Phone sign-in is ON unless an admin has switched it off. A missing row or a failed read
 * also counts as on, so the switch can only ever turn the feature off on purpose.
 * Read fresh on every call (no cache) so flipping it takes effect on every server at once.
 */
export async function isPhoneAuthEnabled(): Promise<boolean> {
  try {
    const { data, error } = await createAdminClient()
      .from('nest_config')
      .select('value')
      .eq('key', PHONE_AUTH_FLAG_KEY)
      .maybeSingle()
    if (error) return true
    return data?.value !== 'false'
  } catch {
    return true
  }
}
