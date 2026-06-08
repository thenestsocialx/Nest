'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactElement;
  badgeKey?: 'applications';
};

type NavGroup = {
  label: string;
  dividerBefore?: boolean;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        href: '/admin/dashboard',
        label: 'Dashboard',
        icon: (
          <svg className="ns-nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <rect x="2" y="2" width="5" height="5" rx="1.5"/>
            <rect x="9" y="2" width="5" height="5" rx="1.5"/>
            <rect x="2" y="9" width="5" height="5" rx="1.5"/>
            <rect x="9" y="9" width="5" height="5" rx="1.5"/>
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Configure',
    dividerBefore: false,
    items: [
      {
        href: '/admin/pricing',
        label: 'Pricing & limits',
        icon: (
          <svg className="ns-nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <path d="M2 8A6 6 0 1 0 14 8A6 6 0 0 0 2 8Z"/>
            <path d="M8 5v1.5M8 9.5V11M6.5 7.5C6.5 6.7 7.2 6 8 6c.8 0 1.5.7 1.5 1.5 0 1-1.5 1.5-1.5 1.5"/>
          </svg>
        ),
      },
      {
        href: '/admin/integrations',
        label: 'Integrations',
        icon: (
          <svg className="ns-nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <path d="M10 3l3 3-3 3M6 13l-3-3 3-3M9 6H6M10 10H7"/>
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Content',
    dividerBefore: true,
    items: [
      {
        href: '/admin/resources',
        label: 'Resources',
        icon: (
          <svg className="ns-nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <path d="M3 4h10M3 8h10M3 12h6"/>
          </svg>
        ),
      },
      {
        href: '/admin/events',
        label: 'Events',
        icon: (
          <svg className="ns-nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <rect x="2" y="3" width="12" height="11" rx="2"/>
            <path d="M5 2v2M11 2v2M2 7h12"/>
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Allies',
    dividerBefore: true,
    items: [
      {
        href: '/admin/allies',
        label: 'All Allies',
        icon: (
          <svg className="ns-nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <circle cx="6" cy="5" r="2.5"/>
            <path d="M1 13c0-2.8 2.2-5 5-5s5 2.2 5 5"/>
            <circle cx="12" cy="5" r="2"/>
            <path d="M11 13c0-1.4.5-2.6 1.3-3.5"/>
          </svg>
        ),
      },
      {
        href: '/admin/allies/onboard',
        label: 'Onboard Ally',
        icon: (
          <svg className="ns-nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <circle cx="8" cy="5" r="3"/>
            <path d="M2 14s1.5-4 6-4 6 4 6 4"/>
            <path d="M12 2l2 2-2 2"/>
          </svg>
        ),
      },
      {
        href: '/admin/allies/applications',
        label: 'Applications',
        badgeKey: 'applications',
        icon: (
          <svg className="ns-nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <path d="M3 4h10M3 8h10M3 12h6"/>
          </svg>
        ),
      },
    ],
  },
  {
    label: 'People',
    dividerBefore: true,
    items: [
      {
        href: '/admin/users',
        label: 'Clients',
        icon: (
          <svg className="ns-nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <circle cx="8" cy="5" r="3"/>
            <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
          </svg>
        ),
      },
    ],
  },
  {
    label: 'System',
    dividerBefore: false,
    items: [
      {
        href: '/admin/matching',
        label: 'Matching Engine',
        icon: (
          <svg className="ns-nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <circle cx="8" cy="8" r="2"/>
            <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M3.1 12.9l1.4-1.4M11.5 4.5l1.4-1.4"/>
          </svg>
        ),
      },
      {
        href: '/admin/audit',
        label: 'Audit Logs',
        icon: (
          <svg className="ns-nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <path d="M3 4h10M3 8h8M3 12h5"/>
          </svg>
        ),
      },
      {
        href: '/admin/config',
        label: 'App Config',
        icon: (
          <svg className="ns-nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <circle cx="8" cy="8" r="2"/>
            <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M3.1 12.9l1.4-1.4M11.5 4.5l1.4-1.4"/>
          </svg>
        ),
      },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [counts, setCounts] = useState<{ applications: number } | null>(null);

  // Fetch live badge counts — fire-and-forget, never blocks render
  useEffect(() => {
    fetch('/api/v1/dashboard/counts')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setCounts(data); })
      .catch(() => { /* silent — no badge is better than a broken UI */ });
  }, []);

  const isActive = (href: string) => {
    if (href === '/admin/allies') {
      return pathname === '/admin/allies';
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  const getBadge = (key: NavItem['badgeKey']): string | null => {
    if (!key || !counts) return null;
    const val = counts[key];
    return val > 0 ? String(val) : null;
  };

  return (
    <nav className="ns-admin-sidebar" role="navigation" aria-label="Admin navigation">
      {/* Brand */}
      <div className="ns-sidebar__brand">
        <div className="ns-sidebar__logo">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 2 Q12 3 13 7 Q13 11 9 13 Q8 13.5 8 13.5 Q8 13.5 7 13 Q3 11 3 7 Q4 3 8 2Z" stroke="#2F4C3A" strokeWidth="1.2" fill="none"/>
            <circle cx="8" cy="7.5" r="1.8" fill="#2F4C3A"/>
          </svg>
        </div>
        <div className="ns-sidebar__brand-text">
          <div className="ns-sidebar__name">Nest</div>
          <div className="ns-sidebar__label">Admin console</div>
        </div>
      </div>

      {/* Nav */}
      <div className="ns-sidebar__nav">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {group.dividerBefore && <div className="ns-sidebar__divider" />}
            <div className="ns-sidebar__section-label">{group.label}</div>
            {group.items.map((item) => {
              const badge = getBadge(item.badgeKey);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`ns-nav-item${isActive(item.href) ? ' ns-nav-item--active' : ''}`}
                >
                  {item.icon}
                  {item.label}
                  {badge && (
                    <span className="ns-nav-badge">{badge}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="ns-sidebar__footer">
        <div className="ns-sidebar__avatar">SK</div>
        <div className="ns-sidebar__user">
          <div className="ns-sidebar__user-name">Sanjay Karthick</div>
          <div className="ns-sidebar__user-role">Super admin</div>
        </div>
      </div>
    </nav>
  );
}
