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
