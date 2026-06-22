import { FeatureFlagsProvider } from '@/contexts/FeatureFlagsContext'
import { getFeatureFlags } from '@/lib/featureFlags'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const flags = await getFeatureFlags()
  return (
    <FeatureFlagsProvider flags={flags}>
      {children}
    </FeatureFlagsProvider>
  )
}
