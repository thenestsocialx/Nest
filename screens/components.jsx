// NEST · Shared app shell components
// Sidebar (Deep Pine + Honey active), Top bar, Card primitives, Lock icon, etc.

const { useState, useEffect, useRef, useMemo } = React;

/* ── LOGO ──
   Compact "nest" wordmark with a small leaf glyph above the n. Uses currentColor. */
const Logo = ({ size = 20, color = '#F8F0E5' }) => (
  <svg width={size * 3.2} height={size * 1.4} viewBox="0 0 100 44" fill="none" aria-hidden="true">
    {/* leaf above n */}
    <path d="M14 8 Q10 14 12 20 Q18 18 18 12 Q18 8 14 8 Z" fill={color} opacity="0.8"/>
    <path d="M14 12 L14 18" stroke={color} strokeWidth="0.8" opacity="0.6" strokeLinecap="round"/>
    {/* nest wordmark */}
    <text x="0" y="38" fontFamily="DM Sans, sans-serif" fontSize="22" fontWeight="400" letterSpacing="0.01em" fill={color}>nest</text>
  </svg>
);

/* ── SIDEBAR ── */
const SIDEBAR_ITEMS = [
  { id: 'home',      label: 'Home' },
  { id: 'companion', label: 'Companion · Nila' },
  { id: 'ally',      label: 'Find an Ally' },
  { id: 'resources', label: 'Resources' },
  { id: 'events',    label: 'Events' },
];

const NavIcon = ({ id }) => {
  const stroke = 'currentColor';
  const c = { stroke, strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
  if (id === 'home') return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M2 7 L8 2 L14 7 V13 Q14 14 13 14 H3 Q2 14 2 13 Z" {...c}/>
    </svg>
  );
  if (id === 'companion') return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="6" {...c}/>
      <path d="M8 5 Q10 6 9.5 8 Q9 9.5 7.5 9.5 Q6.5 9 7 8" {...c}/>
      <circle cx="8" cy="8" r="0.8" fill={stroke}/>
    </svg>
  );
  if (id === 'ally') return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="5.5" cy="6" r="2" {...c}/>
      <circle cx="10.5" cy="6" r="2" {...c}/>
      <path d="M2.5 13 Q2.5 9.5 5.5 9.5 Q7 9.5 8 10.5 Q9 9.5 10.5 9.5 Q13.5 9.5 13.5 13" {...c}/>
    </svg>
  );
  if (id === 'resources') return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 3 V13 M8 3 Q5 2 3 3 V12 Q5 11 8 12 M8 3 Q11 2 13 3 V12 Q11 11 8 12" {...c}/>
    </svg>
  );
  if (id === 'events') return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="5" r="2" {...c}/>
      <circle cx="3.5" cy="7" r="1.6" {...c}/>
      <circle cx="12.5" cy="7" r="1.6" {...c}/>
      <path d="M4 13.5 Q4 11 8 11 Q12 11 12 13.5" {...c}/>
    </svg>
  );
  return null;
};

const Sidebar = ({ active, footer }) => (
  <aside className="ns-sidebar">
    <div className="ns-sidebar__brand">
      <Logo size={18} color="#F8F0E5"/>
      <div className="ns-sidebar__tagline">A space for you</div>
    </div>
    <nav className="ns-sidebar__nav">
      {SIDEBAR_ITEMS.map(it => (
        <a key={it.id} className={'ns-sidebar__item' + (it.id === active ? ' is-active' : '')} href="#">
          <NavIcon id={it.id}/>
          <span>{it.label}</span>
        </a>
      ))}
    </nav>
    <div className="ns-sidebar__foot">
      {footer}
    </div>
  </aside>
);

/* ── LOCK ICON ── */
const LockIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <rect x="2.5" y="5.5" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.1" fill="none"/>
    <path d="M4 5.5 V4 Q4 2 6 2 Q8 2 8 4 V5.5" stroke="currentColor" strokeWidth="1.1" fill="none"/>
    <circle cx="6" cy="8" r="0.7" fill="currentColor"/>
  </svg>
);

/* ── BELL ICON ── */
const BellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3.5 11 Q3.5 7 4.5 5.5 Q5.5 4 8 4 Q10.5 4 11.5 5.5 Q12.5 7 12.5 11 H3.5 Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    <path d="M3.5 11 H 12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M6.5 12.5 Q6.5 13.5 8 13.5 Q9.5 13.5 9.5 12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
    <path d="M8 4 V3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);

/* ── ARROW ── */
const Arrow = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M3 7 H 11 M8 4 L 11 7 L 8 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ── FOOTER PROFILE (for Sidebar) ── */
const SidebarProfile = ({ name, role, initial }) => (
  <div className="ns-profile">
    {initial ? (
      <div className="ns-profile__avatar">{initial}</div>
    ) : (
      <div className="ns-profile__avatar ns-profile__avatar--guest"/>
    )}
    <div className="ns-profile__info">
      <div className="ns-profile__name">{name}</div>
      <div className="ns-profile__role">{role}</div>
    </div>
  </div>
);

/* ── AMBIENT PATH ILLUSTRATION ──
   Wide, low-opacity strip used between top bar and content.
   Soft tree silhouettes, distant horizon glow, footpath leading away. */
const AmbientPath = () => (
  <svg className="ns-ambient" viewBox="0 0 1100 80" preserveAspectRatio="none" aria-hidden="true">
    {/* horizon glow */}
    <ellipse cx="600" cy="80" rx="500" ry="50" fill="#E8C8A0" opacity="0.18"/>
    {/* path */}
    <path d="M460 78 Q540 60 600 50 Q660 60 740 78" stroke="#9B6651" strokeWidth="0.6" fill="none" opacity="0.5"/>
    <path d="M440 80 Q540 56 600 46 Q660 56 760 80 L 760 80 L 440 80 Z" fill="#9B6651" opacity="0.08"/>
    {/* trees - left */}
    {[80,160,260,360].map((x,i) => (
      <g key={'l'+i} opacity={0.25 + i*0.06}>
        <path d={`M${x} 80 L ${x} ${55 - i*3} Q ${x-10} ${55 - i*3} ${x-12} ${65 - i*3} Q ${x-6} ${70 - i*3} ${x} ${68 - i*3} Q ${x+6} ${70 - i*3} ${x+12} ${65 - i*3} Q ${x+10} ${55 - i*3} ${x} ${55 - i*3} Z`} fill="#2F4C3A"/>
      </g>
    ))}
    {/* trees - right */}
    {[1020,940,840,740].map((x,i) => (
      <g key={'r'+i} opacity={0.25 + i*0.06}>
        <path d={`M${x} 80 L ${x} ${55 - i*3} Q ${x-10} ${55 - i*3} ${x-12} ${65 - i*3} Q ${x-6} ${70 - i*3} ${x} ${68 - i*3} Q ${x+6} ${70 - i*3} ${x+12} ${65 - i*3} Q ${x+10} ${55 - i*3} ${x} ${55 - i*3} Z`} fill="#2F4C3A"/>
      </g>
    ))}
    {/* tiny light dots above horizon */}
    <circle cx="500" cy="32" r="1" fill="#E8C8A0" opacity="0.6"/>
    <circle cx="680" cy="22" r="1" fill="#E8C8A0" opacity="0.5"/>
    <circle cx="780" cy="34" r="1" fill="#E8C8A0" opacity="0.4"/>
  </svg>
);

/* ── DOOR ILLUSTRATION (Sign Up left column) ──
   A door ajar with warm light filtering through. Path leading to it. */
const DoorIllustration = () => (
  <svg viewBox="0 0 360 480" fill="none" aria-hidden="true" className="ns-door">
    {/* soft halo */}
    <ellipse cx="180" cy="240" rx="200" ry="220" fill="#E8C8A0" opacity="0.16"/>
    {/* path tiles leading up */}
    <path d="M120 460 L 240 460 L 220 430 L 140 430 Z" fill="#9B6651" opacity="0.18"/>
    <path d="M134 425 L 226 425 L 210 395 L 150 395 Z" fill="#9B6651" opacity="0.22"/>
    <path d="M148 390 L 212 390 L 200 360 L 160 360 Z" fill="#9B6651" opacity="0.28"/>
    <path d="M162 355 L 198 355 L 192 325 L 168 325 Z" fill="#9B6651" opacity="0.34"/>

    {/* door frame */}
    <rect x="118" y="100" width="124" height="230" rx="2" fill="#2F4C3A"/>
    <rect x="118" y="100" width="124" height="230" rx="2" fill="none" stroke="#1f3528" strokeWidth="1.5"/>

    {/* door (slightly ajar) — split into back-lit interior and door slab */}
    {/* interior glow */}
    <rect x="124" y="106" width="112" height="218" fill="#F8F0E5" opacity="0.9"/>
    <rect x="124" y="106" width="112" height="218" fill="#E8C8A0" opacity="0.5"/>
    {/* warm light pool spilling out */}
    <path d="M124 324 L 236 324 L 270 360 L 90 360 Z" fill="#E8C8A0" opacity="0.5"/>
    <path d="M124 324 L 236 324 L 295 380 L 65 380 Z" fill="#E8C8A0" opacity="0.25"/>

    {/* the actual door slab — opened inward, partial */}
    <path d="M124 106 L 200 116 L 200 324 L 124 324 Z" fill="#2F4C3A"/>
    <path d="M124 106 L 200 116 L 200 324 L 124 324 Z" fill="#1f3528" opacity="0.4"/>
    {/* door handle */}
    <circle cx="138" cy="218" r="2.4" fill="#E8C8A0"/>
    {/* door panels */}
    <rect x="138" y="130" width="50" height="80" rx="1" fill="none" stroke="#3d5f4b" strokeWidth="0.8" opacity="0.7"/>
    <rect x="138" y="220" width="50" height="92" rx="1" fill="none" stroke="#3d5f4b" strokeWidth="0.8" opacity="0.7"/>

    {/* light dots floating */}
    <circle cx="100" cy="160" r="1.6" fill="#E8C8A0" opacity="0.7"/>
    <circle cx="280" cy="140" r="1.6" fill="#E8C8A0" opacity="0.6"/>
    <circle cx="60" cy="240" r="1.4" fill="#E8C8A0" opacity="0.5"/>
    <circle cx="310" cy="220" r="1.4" fill="#E8C8A0" opacity="0.5"/>
    <circle cx="80"  cy="320" r="1.2" fill="#E8C8A0" opacity="0.4"/>
    <circle cx="290" cy="300" r="1.2" fill="#E8C8A0" opacity="0.4"/>

    {/* small leaves resting near the door */}
    <path d="M70 380 Q78 374 84 380 Q78 384 70 380 Z" fill="#5C7A66" opacity="0.8"/>
    <path d="M286 388 Q294 382 300 388 Q294 392 286 388 Z" fill="#5C7A66" opacity="0.7"/>
    <path d="M68 378 Q66 384 70 388" stroke="#2F4C3A" strokeWidth="0.6" fill="none" opacity="0.6"/>
  </svg>
);

/* Export to window */
Object.assign(window, {
  Logo, Sidebar, NavIcon, SidebarProfile,
  LockIcon, BellIcon, Arrow,
  AmbientPath, DoorIllustration,
});
