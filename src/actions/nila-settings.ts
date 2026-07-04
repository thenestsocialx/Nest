'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

const ALLOWED_FIELDS = [
  'nila_default_mode',
  'nila_language',
  'nila_nudge_enabled',
  'nila_nudge_time',
] as const

type SettingField = (typeof ALLOWED_FIELDS)[number]

const VALID_VALUES: Record<SettingField, (v: string | boolean) => boolean> = {
  nila_default_mode:  (v) => typeof v === 'string' && ['normal', 'rant', 'figure_it_out'].includes(v),
  nila_language:      (v) => typeof v === 'string' && ['english', 'tamil', 'hindi'].includes(v),
  nila_nudge_enabled: (v) => typeof v === 'boolean',
  nila_nudge_time:    (v) => typeof v === 'string' && ['morning', 'evening'].includes(v),
}

export async function updateNilaSetting(
  field: string,
  value: string | boolean,
): Promise<{ success?: true; error?: string }> {
  if (!ALLOWED_FIELDS.includes(field as SettingField)) {
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
    .update({ [f]: value })
    .eq('id', user.id)

  if (error) {
    console.error('[updateNilaSetting]', error)
    return { error: 'Failed to save' }
  }
  return { success: true }
}

export async function savePushSubscription(
  subscription: Record<string, unknown>,
): Promise<{ success?: true; error?: string }> {
  if (typeof subscription?.endpoint !== 'string' || !subscription.endpoint.startsWith('https://')) {
    return { error: 'Invalid subscription' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({ nila_push_subscription: subscription })
    .eq('id', user.id)

  if (error) {
    console.error('[savePushSubscription]', error)
    return { error: 'Failed to save' }
  }
  return { success: true }
}

export async function deletePushSubscription(): Promise<{ success?: true; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({ nila_push_subscription: null })
    .eq('id', user.id)

  if (error) {
    console.error('[deletePushSubscription]', error)
    return { error: 'Failed to delete' }
  }
  return { success: true }
}
