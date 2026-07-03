import { FeatureFlagsProvider } from '@/contexts/FeatureFlagsContext'
import { getFeatureFlags } from '@/lib/featureFlags'
import { createClient } from '@/lib/supabase/server'
import DunningBanner from '@/components/ui/DunningBanner'
import Sidebar from '@/components/layout/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [flags, supabase] = await Promise.all([
    getFeatureFlags(),
    createClient(),
  ])

  const { data: { user } } = await supabase.auth.getUser()

  let isPaymentHalted = false
  let firstName = 'You'
  let initial = 'Y'
  let avatarUrl: string | null = null

  if (user) {
    const [subsResult, profileResult] = await Promise.all([
      supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(5),
      supabase
        .from('profiles')
        .select('display_name, full_name, avatar_url')
        .eq('id', user.id)
        .maybeSingle(),
    ])
    isPaymentHalted = (subsResult.data ?? []).some((s: { status: string }) => s.status === 'halted')
    const profile = profileResult.data
    firstName = profile?.display_name ?? profile?.full_name?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'You'
    initial = firstName[0]?.toUpperCase() ?? 'Y'
    avatarUrl = profile?.avatar_url ?? null
  }

  return (
    <FeatureFlagsProvider flags={flags}>
      {isPaymentHalted && <DunningBanner />}
      <div className="ns-shell ns-shell--locked">
        <Sidebar userName={firstName} userInitial={initial} avatarUrl={avatarUrl} />
        {children}
      </div>
    </FeatureFlagsProvider>
  )
}
