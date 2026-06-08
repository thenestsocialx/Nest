import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import PlanCard from '@/components/plans/PlanCard'
import type { PlanConfig } from '@/components/plans/PlanCard'
import PlanFAQ from '@/components/plans/PlanFAQ'

export const metadata = {
  title: 'Plans — Nest',
}

const PLANS: PlanConfig[] = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    tag: 'Where you are now',
    features: [
      '10 conversations with Nila per day',
      'Access to Resources',
      'Weekend event discovery',
    ],
    cta: "You're on this plan",
  },
  {
    id: 'core',
    name: 'Core',
    price: '₹299',
    tag: 'Most chosen',
    features: [
      'Unlimited Nila conversations',
      '1 Ally session per month',
      'Full Resources library',
      'Priority support',
    ],
    cta: 'Start Core',
    isFeatured: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '₹599',
    tag: "For when you’re ready to go deeper",
    features: [
      'Everything in Core',
      'Unlimited Ally sessions',
      'Early access to events',
      'Priority Ally matching',
    ],
    cta: 'Start Premium',
  },
]

export default async function PlansPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, display_name, full_name')
    .eq('id', user.id)
    .maybeSingle()

  const currentPlan = (profile?.plan as string | null) ?? 'free'
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
