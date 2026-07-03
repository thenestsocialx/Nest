'use server'

import { getAdminUser } from '@/lib/auth-admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { invalidateConfig } from '@/lib/nila-config'

export async function saveAdminConfig(
  key: string,
  value: string,
): Promise<{ error?: string }> {
  const user = await getAdminUser()
  if (!user) return { error: 'Unauthorized' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('nest_config')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', key)

  if (error) {
    console.error('[saveAdminConfig]', error)
    return { error: 'Failed to save' }
  }

  invalidateConfig(key)
  return {}
}
