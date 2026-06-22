'use client'

import { createContext, useContext } from 'react'
import type { FeatureFlags } from '@/lib/featureFlags'

const FeatureFlagsContext = createContext<FeatureFlags>({ resources: true, events: true })

export function FeatureFlagsProvider({
  flags,
  children,
}: {
  flags: FeatureFlags
  children: React.ReactNode
}) {
  return (
    <FeatureFlagsContext.Provider value={flags}>
      {children}
    </FeatureFlagsContext.Provider>
  )
}

export function useFeatureFlags(): FeatureFlags {
  return useContext(FeatureFlagsContext)
}
