import { createClient } from '@/lib/supabase/server'

export type FeatureFlags = {
  resources: boolean
  events: boolean
}

export async function getFeatureFlags(): Promise<FeatureFlags> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('nest_config')
    .select('key, value')
    .in('key', ['features.resources.enabled', 'features.events.enabled'])

  const map: Record<string, string> = {}
  data?.forEach((row) => { map[row.key] = row.value })

  return {
    resources: map['features.resources.enabled'] === 'true',
    events:    map['features.events.enabled']    === 'true',
  }
}
