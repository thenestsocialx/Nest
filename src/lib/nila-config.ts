import { createAdminClient } from '@/lib/supabase/admin'

interface CacheEntry {
  value: string
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()
const TTL_MS = 5 * 60 * 1000

export async function getConfig(key: string, fallback: string): Promise<string> {
  const now = Date.now()
  const cached = cache.get(key)
  if (cached && now < cached.expiresAt) return cached.value

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('nest_config')
    .select('value')
    .eq('key', key)
    .maybeSingle()

  if (error || !data) return fallback

  cache.set(key, { value: data.value, expiresAt: now + TTL_MS })
  return data.value
}

export function invalidateConfig(key?: string): void {
  if (key) {
    cache.delete(key)
  } else {
    cache.clear()
  }
}

export async function getDefaultModeForPlan(plan: string): Promise<string> {
  const enabled = await getEnabledModesForPlan(plan)
  const raw = await getConfig(`plan.nila_default_mode.${plan}`, enabled[0] ?? 'normal')
  return enabled.includes(raw) ? raw : (enabled[0] ?? 'normal')
}

export async function getEnabledModesForPlan(plan: string): Promise<string[]> {
  const fallbacks: Record<string, string> = {
    free:    'normal',
    core:    'normal,rant',
    premium: 'normal,rant,figure_it_out',
  }
  const raw = await getConfig(`plan.nila_modes.${plan}`, fallbacks[plan] ?? 'normal')
  const modes = raw.split(',').map((m) => m.trim()).filter(Boolean)
  // Ultimate fallback: if config is empty/corrupt, normal is always available
  return modes.length > 0 ? modes : ['normal']
}

export function getPeriodStart(period: string): Date {
  const now = new Date()
  if (period === 'weekly') {
    const day = now.getDay() // 0=Sun … 6=Sat
    const daysBack = day === 0 ? 6 : day - 1 // days since last Monday
    const monday = new Date(now)
    monday.setDate(now.getDate() - daysBack)
    monday.setHours(0, 0, 0, 0)
    return monday
  }
  // daily: midnight today (local)
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  return today
}
