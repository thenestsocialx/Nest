'use client'

import { usePathname } from 'next/navigation'
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext'

const CORE_ITEMS = [
  { id: 'home',      label: 'Home',     href: '/home' },
  { id: 'companion', label: 'Nila',     href: '/nila' },
  { id: 'ally',      label: 'Allies',   href: '/allies' },
]

const FEATURE_ITEMS = [
  { id: 'resources', label: 'Resources', href: '/resources' },
  { id: 'events',    label: 'Events',   href: '/events' },
]

const PROFILE_ITEM = { id: 'profile', label: 'Profile', href: '/profile' }

function NavIcon({ id }: { id: string }) {
  const c = {
    stroke: 'currentColor' as const,
    strokeWidth: 1.4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  }
  if (id === 'home') return (
    <svg width="20" height="20" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M2 7 L8 2 L14 7 V13 Q14 14 13 14 H3 Q2 14 2 13 Z" {...c} />
    </svg>
  )
  if (id === 'companion') return (
    <svg width="20" height="20" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="6" {...c} />
      <path d="M8 5 Q10 6 9.5 8 Q9 9.5 7.5 9.5 Q6.5 9 7 8" {...c} />
      <circle cx="8" cy="8" r="0.8" fill="currentColor" />
    </svg>
  )
  if (id === 'ally') return (
    <svg width="20" height="20" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="5.5" cy="6" r="2" {...c} />
      <circle cx="10.5" cy="6" r="2" {...c} />
      <path d="M2.5 13 Q2.5 9.5 5.5 9.5 Q7 9.5 8 10.5 Q9 9.5 10.5 9.5 Q13.5 9.5 13.5 13" {...c} />
    </svg>
  )
  if (id === 'resources') return (
    <svg width="20" height="20" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 3 V13 M8 3 Q5 2 3 3 V12 Q5 11 8 12 M8 3 Q11 2 13 3 V12 Q11 11 8 12" {...c} />
    </svg>
  )
  if (id === 'events') return (
    <svg width="20" height="20" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="5" r="2" {...c} />
      <circle cx="3.5" cy="7" r="1.6" {...c} />
      <circle cx="12.5" cy="7" r="1.6" {...c} />
      <path d="M4 13.5 Q4 11 8 11 Q12 11 12 13.5" {...c} />
    </svg>
  )
  if (id === 'profile') return (
    <svg width="20" height="20" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="5.5" r="2.5" {...c} />
      <path d="M2.5 14 Q2.5 10 8 10 Q13.5 10 13.5 14" {...c} />
    </svg>
  )
  return null
}

export default function BottomNav() {
  const pathname = usePathname()
  const flags = useFeatureFlags()

  // Feature-flagged items that are enabled
  const enabledFeatures = FEATURE_ITEMS.filter((item) => {
    if (item.id === 'resources') return flags.resources
    if (item.id === 'events')    return flags.events
    return false
  })

  // Core + up to 1 feature item + Profile — never exceed 5 total
  const visibleItems = [...CORE_ITEMS, ...enabledFeatures.slice(0, 1), PROFILE_ITEM]

  return (
    <nav className="ns-bottom-nav" aria-label="Mobile navigation">
      {visibleItems.map((item) => (
        <a
          key={item.id}
          href={item.href}
          className={`ns-bottom-nav__item${pathname.startsWith(item.href) ? ' is-active' : ''}`}
        >
          <NavIcon id={item.id} />
          <span>{item.label}</span>
        </a>
      ))}
    </nav>
  )
}
