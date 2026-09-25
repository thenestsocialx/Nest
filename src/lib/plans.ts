import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { PlanConfig } from '@/components/plans/PlanCard'

export const getPlans = unstable_cache(
  async (): Promise<PlanConfig[]> => {
    const admin = createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (admin as any)
      .from('plans')
      .select('id, name, price_inr, tag, features, cta, is_featured')
      .eq('is_active', true)
      .order('display_order')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((data ?? []) as any[]).map((p) => ({
      id: p.id as string,
      name: p.name as string,
      price: p.price_inr === 0 ? '₹0' : `₹${p.price_inr}`,
      tag: p.tag as string,
      features: p.features as string[],
      cta: p.cta as string,
      isFeatured: p.is_featured as boolean,
    }))
  },
  ['plans-list'],
  { revalidate: 3600, tags: ['plans'] },
)
