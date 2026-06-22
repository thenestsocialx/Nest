import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import PlanCard from '@/components/plans/PlanCard'
import type { PlanConfig } from '@/components/plans/PlanCard'
import PlanFAQ from '@/components/plans/PlanFAQ'

export const metadata = {
  title: 'Plans — Nest',
}

export default async function PlansPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: profile }, { data: planRows }] = await Promise.all([
    supabase
      .from('profiles')
      .select('plan, display_name, full_name')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('plans')
      .select('id, name, price_inr, tag, features, cta, is_featured')
      .order('display_order'),
  ])

  const currentPlan = (profile?.plan as string | null) ?? 'free'

  const PLANS: PlanConfig[] = (planRows ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price_inr === 0 ? '₹0' : `₹${p.price_inr}`,
    tag: p.tag,
    features: p.features as string[],
    cta: p.cta,
    isFeatured: p.is_featured,
  }))
  const displayName = profile?.display_name ?? profile?.full_name?.split(' ')[0] ?? 'You'
  const initial = displayName[0]?.toUpperCase() ?? 'Y'

  return (
    <div className="ns-shell">
      <Sidebar userName={displayName} userInitial={initial} />

      <main className="ns-main">
        <div className="ns-plans">
          {/* Header */}
          <div className="ns-plans__header">
            <h1 className="ns-plans__headline">Choose what feels right</h1>
            <p className="ns-plans__sub">Start free. Go deeper when you&apos;re ready.</p>
          </div>

          {/* Plan cards */}
          <div className="ns-plans__grid">
            {PLANS.map((plan) => (
              <PlanCard
                key={plan.id}
                {...plan}
                currentPlan={currentPlan}
              />
            ))}
          </div>

          {/* Trust line */}
          <p className="ns-trust-line">
            No commitment. Cancel anytime. Your data stays private.
          </p>

          {/* FAQ */}
          <PlanFAQ />
        </div>
      </main>
    </div>
  )
}
