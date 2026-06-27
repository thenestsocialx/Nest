'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { invalidateConfig } from '@/lib/nila-config'

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') {
    throw new Error('Unauthorized')
  }
}

export async function savePlan(
  id: string,
  data: {
    name: string
    price_inr: number
    tag: string
    features: string[]
    cta: string
    is_featured: boolean
    razorpay_plan_id: string | null
  },
): Promise<{ error?: string }> {
  try {
    await assertAdmin()
  } catch {
    return { error: 'Unauthorized' }
  }

  const admin = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('plans')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('[savePlan]', error)
    return { error: 'Failed to save plan' }
  }

  return {}
}

export async function saveNestConfig(
  key: string,
  value: string,
): Promise<{ error?: string }> {
  try {
    await assertAdmin()
  } catch {
    return { error: 'Unauthorized' }
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('nest_config')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', key)

  if (error) {
    console.error('[saveNestConfig]', error)
    return { error: 'Failed to save' }
  }

  invalidateConfig(key)
  return {}
}
