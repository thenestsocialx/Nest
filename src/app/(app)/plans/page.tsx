import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/layout/BottomNav'
import LandingHeader from '@/components/layout/LandingHeader'
import PlanCard from '@/components/plans/PlanCard'
import type { ActiveSub } from '@/components/plans/PlanCard'
import PlanFAQ from '@/components/plans/PlanFAQ'
import { getPlans } from '@/lib/plans'

export const metadata = {
  title: 'Plans — Nest',
  description: 'Choose a plan that gives you real, ongoing support. From regular ally sessions to AI-powered check-ins, Nest meets you where you are.',
  openGraph: {
    title: 'Plans — Nest',
    description: 'Choose a plan that gives you real, ongoing support. From regular ally sessions to AI-powered check-ins, Nest meets you where you are.',
  },
}

export default async function PlansPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const params = await searchParams
  const showSuccess = params.success === '1'

  const PLANS = await getPlans()

  // ── Guest view (unauthenticated) ────────────────────────────
  if (!user) {
    return (
      <main className="ns-main">
        <LandingHeader />
        <div className="ns-plans">
          <div className="ns-plans__header">
            <h1 className="ns-plans__headline">Choose what feels right</h1>
            <p className="ns-plans__sub">Start free. Go deeper when you&apos;re ready.</p>
          </div>

          <div className="ns-plans__grid">
            {PLANS.map((plan) => (
              <PlanCard
                key={plan.id}
                {...plan}
                currentPlan=""
                userEmail=""
                activeSub={null}
                guestMode
              />
            ))}
          </div>

          <p className="ns-trust-line">
            No commitment. Cancel anytime. Your data stays private.
          </p>

          <PlanFAQ />
        </div>
      </main>
    )
  }

  // ── Authenticated view ───────────────────────────────────────
  const [{ data: profile }, subResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('plan, display_name, full_name, subscription_status')
      .eq('id', user.id)
      .maybeSingle(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('subscriptions')
      .select('id, plan_id, status, current_period_end, cancel_at_period_end')
      .eq('user_id', user.id)
      .in('status', ['active', 'authenticated', 'paused', 'halted'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  if (subResult.error) console.error('[PlansPage] subscription fetch error:', subResult.error)

  const currentPlan = (profile?.plan as string | null) ?? 'free'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sub = subResult.data as any
  const activeSub: ActiveSub | null = sub
    ? {
        id: sub.id as string,
        status: sub.status as ActiveSub['status'],
        periodEnd: (sub.current_period_end as string | null) ?? null,
        cancelAtEnd: (sub.cancel_at_period_end as boolean) ?? false,
      }
    : null

  return (
    <main className="ns-main">
      <div className="ns-plans">
        {showSuccess && (
          <div className="ns-plans__success">
            Payment successful — welcome to your new plan!
          </div>
        )}

        <div className="ns-plans__header">
          <h1 className="ns-plans__headline">Choose what feels right</h1>
          <p className="ns-plans__sub">Start free. Go deeper when you&apos;re ready.</p>
        </div>

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

        <p className="ns-trust-line">
          No commitment. Cancel anytime. Your data stays private.
        </p>

        <PlanFAQ />
      </div>
      <BottomNav />
    </main>
  )
}
