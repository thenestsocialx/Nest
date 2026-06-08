'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export type SaveProfileResult = {
  error?: string
  success?: boolean
}

export async function saveProfile(data: {
  full_name: string
  display_name: string
  phone: string
  phone_country_code: string
  preferred_language: string
  city: string
}): Promise<SaveProfileResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Session expired. Please sign in again.' }

  if (!data.full_name.trim()) return { error: 'Your full name is required.' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({
      full_name: data.full_name.trim(),
      display_name: data.display_name.trim() || null,
      phone: data.phone.trim() || null,
      phone_country_code: data.phone_country_code || null,
      preferred_language: data.preferred_language || null,
      city: data.city.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    console.error('[saveProfile]', error)
    return { error: 'Something went wrong. Please try again.' }
  }

  return { success: true }
}

const ALLOWED_SETTINGS = [
  'nila_tone',
  'nila_memory_enabled',
  'nila_limit_reminder',
  'notify_email_updates',
  'notify_event_reminders',
  'notify_ally_reminders',
  'anonymous_mode',
] as const

type SettingField = (typeof ALLOWED_SETTINGS)[number]

const VALID_VALUES: Record<SettingField, (v: string | boolean) => boolean> = {
  nila_tone:              (v) => typeof v === 'string' && ['gentle','direct','balanced'].includes(v),
  nila_memory_enabled:    (v) => typeof v === 'boolean',
  nila_limit_reminder:    (v) => typeof v === 'boolean',
  notify_email_updates:   (v) => typeof v === 'boolean',
  notify_event_reminders: (v) => typeof v === 'boolean',
  notify_ally_reminders:  (v) => typeof v === 'boolean',
  anonymous_mode:         (v) => typeof v === 'boolean',
}

export async function saveProfileSetting(
  field: string,
  value: string | boolean,
): Promise<SaveProfileResult> {
  if (!ALLOWED_SETTINGS.includes(field as SettingField)) {
    return { error: 'Invalid field' }
  }
  const f = field as SettingField
  if (!VALID_VALUES[f](value)) {
    return { error: 'Invalid value' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({ [f]: value, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) {
    console.error('[saveProfileSetting]', error)
    return { error: 'Failed to save' }
  }
  return { success: true }
}
