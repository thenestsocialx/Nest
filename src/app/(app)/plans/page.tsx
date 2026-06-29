import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Sidebar from '@/components/layout/Sidebar'
import PlanCard from '@/components/plans/PlanCard'
import type { PlanConfig, ActiveSub } from '@/components/plans/PlanCard'
import PlanFAQ from '@/components/plans/PlanFAQ'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Plans — Nest',
}

export default async function PlansPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const showSuccess = params.success === '1'

  // Fetch profile, plans, and active subscription in parallel.
  // Plans and subscriptions use the admin client so we can query
  // even if Supabase types don't yet include these tables locally.
  const admin = createAdminClient()

  const [{ data: profile }, { data: planRows }] = await Promise.all([
    supabase
      .from('profiles')
      .select('plan, display_name, full_name, subscription_status')
      .eq('id', user.id)
      .maybeSingle(),

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any)
      .from('plans')
      .select('id, name, price_inr, tag, features, cta, is_featured')
      .order('display_order'),
  ])

  // Use user client — RLS allows authenticated users to read their own subscriptions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subRow, error: subError } = await (supabase as any)
    .from('subscriptions')
    .select('id, plan_id, status, current_period_end, cancel_at_period_end')
    .eq('user_id', user.id)
    .in('status', ['active', 'authenticated', 'paused', 'halted'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (subError) console.error('[PlansPage] subscription fetch error:', subError)

  const currentPlan = (profile?.plan as string | null) ?? 'free'
  const displayName = profile?.display_name ?? (profile?.full_name as string | null)?.split(' ')[0] ?? 'You'
  const initial = displayName[0]?.toUpperCase() ?? 'Y'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const PLANS: PlanConfig[] = ((planRows ?? []) as any[]).map((p) => ({
    id: p.id as string,
    name: p.name as string,
    price: p.price_inr === 0 ? '₹0' : `₹${p.price_inr}`,
    tag: p.tag as string,
    features: p.features as string[],
    cta: p.cta as string,
    isFeatured: p.is_featured as boolean,
  }))

  // Build the ActiveSub object for the card matching the user's current plan
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sub = subRow as any
  const activeSub: ActiveSub | null = sub
    ? {
        id: sub.id as string,
        status: sub.status as ActiveSub['status'],
        periodEnd: (sub.current_period_end as string | null) ?? null,
        cancelAtEnd: (sub.cancel_at_period_end as boolean) ?? false,
      }
    : null

  return (
    <div className="ns-shell">
      <Sidebar userName={displayName} userInitial={initial} />

      <main className="ns-main">
        <div className="ns-plans">
          {/* ── Success banner after payment ── */}
          {showSuccess && (
            <div className="ns-plans__success">
              Payment successful — welcome to your new plan!
            </div>
          )}

          {/* ── Header ── */}
          <div className="ns-plans__header">
            <h1 className="ns-plans__headline">Choose what feels right</h1>
            <p className="ns-plans__sub">Start free. Go deeper when you&apos;re ready.</p>
          </div>

          {/* ── Plan cards ── */}
          <div className="ns-plans__grid">
            {PLANS.map((plan) => (
              <PlanCard
                key={plan.id}
                {...plan}
                currentPlan={currentPlan}
                userEmail={user.email ?? ''}
                activeSub={activeSub?.id && sub?.plan_id === plan.id ? activeSub : null}
              />
            ))}
          </div>

          {/* ── Trust line ── */}
          <p className="ns-trust-line">
            No commitment. Cancel anytime. Your data stays private.
          </p>

          {/* ── FAQ ── */}
          <PlanFAQ />
        </div>
      </main>
    </div>
  )
}
