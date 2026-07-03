'use client'

import { usePathname } from 'next/navigation'
import NestLogo from '@/components/ui/NestLogo'
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext'

const NAV_ITEMS = [
  { id: 'home',      label: 'Home',            href: '/home' },
  { id: 'companion', label: 'Companion · Nila', href: '/nila' },
  { id: 'ally',      label: 'Find an Ally',     href: '/allies' },
  { id: 'resources', label: 'Resources',        href: '/resources' },
  { id: 'events',    label: 'Events',           href: '/events' },
]

function NavIcon({ id }: { id: string }) {
  const c = {
    stroke: 'currentColor' as const,
    strokeWidth: 1.4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  }
  if (id === 'home') return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M2 7 L8 2 L14 7 V13 Q14 14 13 14 H3 Q2 14 2 13 Z" {...c} />
    </svg>
  )
  if (id === 'companion') return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="6" {...c} />
      <path d="M8 5 Q10 6 9.5 8 Q9 9.5 7.5 9.5 Q6.5 9 7 8" {...c} />
      <circle cx="8" cy="8" r="0.8" fill="currentColor" />
    </svg>
  )
  if (id === 'ally') return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="5.5" cy="6" r="2" {...c} />
      <circle cx="10.5" cy="6" r="2" {...c} />
      <path d="M2.5 13 Q2.5 9.5 5.5 9.5 Q7 9.5 8 10.5 Q9 9.5 10.5 9.5 Q13.5 9.5 13.5 13" {...c} />
    </svg>
  )
  if (id === 'resources') return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 3 V13 M8 3 Q5 2 3 3 V12 Q5 11 8 12 M8 3 Q11 2 13 3 V12 Q11 11 8 12" {...c} />
    </svg>
  )
  if (id === 'events') return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="5" r="2" {...c} />
      <circle cx="3.5" cy="7" r="1.6" {...c} />
      <circle cx="12.5" cy="7" r="1.6" {...c} />
      <path d="M4 13.5 Q4 11 8 11 Q12 11 12 13.5" {...c} />
    </svg>
  )
  if (id === 'plans') return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 2 L10 6 L14.5 6.5 L11 10 L12 14.5 L8 12 L4 14.5 L5 10 L1.5 6.5 L6 6 Z" {...c} />
    </svg>
  )
  return null
}

interface SidebarProps {
  userName?: string
  userInitial?: string
  avatarUrl?: string | null
}

export default function Sidebar({ userName = 'You', userInitial = 'Y', avatarUrl }: SidebarProps) {
  const pathname = usePathname()
  const flags = useFeatureFlags()

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.id === 'resources') return flags.resources
    if (item.id === 'events')    return flags.events
    return true
  })

  return (
    <aside className="ns-sidebar">
      <div className="ns-sidebar__brand">
        <NestLogo size={18} color="#F8F0E5" />
        <div className="ns-sidebar__tagline">A space for you</div>
      </div>

      <nav className="ns-sidebar__nav" aria-label="Main navigation">
        {visibleItems.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className={`ns-sidebar__item${pathname.startsWith(item.href) ? ' is-active' : ''}`}
          >
            <NavIcon id={item.id} />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="ns-sidebar__upgrade">
        <a
          href="/plans"
          className={`ns-sidebar__item${pathname.startsWith('/plans') ? ' is-active' : ''}`}
        >
          <NavIcon id="plans" />
          <span>Plans</span>
        </a>
      </div>

      <div className="ns-sidebar__foot">
        <a
          href="/profile"
          className="ns-sidebar__profile-link"
          aria-label={`View profile for ${userName}`}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={userName}
              className="ns-profile__avatar"
              style={{ objectFit: 'cover', padding: 0 }}
              aria-hidden="true"
            />
          ) : (
            <div className="ns-profile__avatar" aria-hidden="true">{userInitial}</div>
          )}
          <div style={{ minWidth: 0 }}>
            <div className="ns-profile__name">{userName}</div>
            <div className="ns-profile__role">Member</div>
          </div>
        </a>
      </div>
    </aside>
  )
}
