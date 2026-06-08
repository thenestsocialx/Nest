'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { invalidateConfig } from '@/lib/nila-config'

export async function saveAdminConfig(
  key: string,
  value: string,
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== 'admin') {
    return { error: 'Unauthorized' }
  }

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
