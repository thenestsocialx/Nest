import { FeatureFlagsProvider } from '@/contexts/FeatureFlagsContext'
import { getFeatureFlags } from '@/lib/featureFlags'
import { createClient } from '@/lib/supabase/server'
import DunningBanner from '@/components/ui/DunningBanner'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [flags, supabase] = await Promise.all([
    getFeatureFlags(),
    createClient(),
  ])

  const { data: { user } } = await supabase.auth.getUser()

  let isPaymentHalted = false
  if (user) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .maybeSingle()
    isPaymentHalted = sub?.status === 'halted'
  }

  return (
    <FeatureFlagsProvider flags={flags}>
      {isPaymentHalted && <DunningBanner />}
      {children}
    </FeatureFlagsProvider>
  )
}
