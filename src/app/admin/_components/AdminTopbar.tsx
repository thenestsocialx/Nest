'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

// Routes whose subtitles are purely static
const PAGE_META: Record<string, { title: string; sub: string }> = {
  '/admin/dashboard':           { title: 'Dashboard',           sub: 'Platform overview · May 2026' },
  '/admin/pricing':             { title: 'Pricing & limits',    sub: 'Configure plans, message caps, credit wallet' },
  '/admin/integrations':        { title: 'Integrations',        sub: 'Connect and monitor third-party services' },
  '/admin/resources':           { title: 'Resources',           sub: 'Manage content library and mood tags' },
  '/admin/events':              { title: 'Weekend events',      sub: 'Create events, manage registrations' },
  '/admin/allies':              { title: 'Allies',              sub: 'Human listener network and payout tracking' },
  '/admin/allies/onboard':      { title: 'Onboard Ally',        sub: 'Allies · New application' },
  '/admin/allies/applications': { title: 'Applications',        sub: '' }, // subtitle is dynamic (see below)
  '/admin/users':               { title: 'Clients',             sub: 'User management · handle with care' },
  '/admin/matching':            { title: 'Matching Engine',     sub: 'Algorithm weights and configuration' },
  '/admin/audit':               { title: 'Audit Logs',          sub: 'System events and admin actions' },
};

export default function AdminTopbar() {
  const pathname = usePathname();
  const meta = PAGE_META[pathname] ?? { title: 'Admin', sub: '' };

  // Dynamic count — only fetched on routes that need it
  const [applicationCount, setApplicationCount] = useState<number | null>(null);
  const needsCount = pathname === '/admin/allies/applications';

  useEffect(() => {
    if (!needsCount) return;
    fetch('/api/v1/dashboard/counts')
      .then(r => r.ok ? r.json() : null)
      .then((data: { applications: number } | null) => {
        if (data != null) setApplicationCount(data.applications);
      })
      .catch(() => { /* silent */ });
  }, [needsCount]);

  // Build the subtitle, filling in live count for the applications route
  let subtitle = meta.sub;
  if (pathname === '/admin/allies/applications') {
    if (applicationCount === null) {
      subtitle = 'Review pending applications';
    } else if (applicationCount === 0) {
      subtitle = 'No pending applications';
    } else {
      subtitle = `${applicationCount} pending application${applicationCount !== 1 ? 's' : ''} to review`;
    }
  }

  return (
    <header className="ns-admin-topbar">
      <div className="ns-topbar__page">
        <div className="ns-topbar__page-title">{meta.title}</div>
        {subtitle && <div className="ns-topbar__page-sub">{subtitle}</div>}
      </div>
      <div className="ns-topbar__actions">
        <div className="ns-env-status">
          <div className="ns-env-dot" />
          All systems live
        </div>
        <button className="ns-topbar__icon-btn ns-bell-wrap" aria-label="Notifications">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <path d="M8 2a4 4 0 0 1 4 4v3l1.5 2H2.5L4 9V6a4 4 0 0 1 4-4z"/>
            <path d="M6.5 13a1.5 1.5 0 0 0 3 0"/>
          </svg>
          <span className="ns-bell-dot" />
        </button>
        <button className="ns-topbar__icon-btn" aria-label="Settings">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <circle cx="8" cy="8" r="2"/>
            <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M3.1 12.9l1.4-1.4M11.5 4.5l1.4-1.4"/>
          </svg>
        </button>
      </div>
    </header>
  );
}
