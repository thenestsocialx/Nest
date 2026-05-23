const USERS = [
  {
    name: 'Aryan K.', email: 'aryan@gmail.com',
    plan: 'Core', planBadge: 'forest',
    joined: 'Jul 12, 2025', lastActive: '2h ago',
    nilaMessages: 841, credits: 128,
    status: 'Active', statusBadge: 'green',
    action: 'View', actionVariant: 'ghost',
  },
  {
    name: 'Kavitha S.', email: 'kavitha@mail.com',
    plan: 'Free', planBadge: 'gray',
    joined: 'Mar 3, 2026', lastActive: '1d ago',
    nilaMessages: 34, credits: 50,
    status: 'Payment failed', statusBadge: 'red',
    action: 'View', actionVariant: 'ghost',
  },
  {
    name: 'anon_7821', email: 'anonymous user',
    plan: 'Free', planBadge: 'gray',
    joined: 'May 18, 2026', lastActive: '14m ago',
    nilaMessages: 7, credits: 43,
    status: 'Safety flag', statusBadge: 'red',
    action: 'Assign', actionVariant: 'danger',
  },
  {
    name: 'Meera P.', email: 'meera@icloud.com',
    plan: 'Premium', planBadge: 'amber',
    joined: 'Jan 8, 2026', lastActive: '3h ago',
    nilaMessages: 2140, credits: 0,
    status: 'Active', statusBadge: 'green',
    action: 'View', actionVariant: 'ghost',
  },
];

export default function UsersPage() {
  return (
    <>
      {/* Flagged alert */}
      <div className="ns-flagged">
        <div className="ns-flagged__icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
            <path d="M8 3v5M8 10.5V11"/><path d="M3 13L8 3l5 10H3z"/>
          </svg>
        </div>
        <div className="ns-flagged__body">
          <div className="ns-flagged__title">2 users need attention</div>
          <div className="ns-flagged__desc">
            Nila triggered a safety flag for these users. Assign to a human Ally or review. Visible to super-admin only.
          </div>
        </div>
        <button className="ns-btn ns-btn--danger ns-btn--sm" style={{ flexShrink: 0 }}>Review flags</button>
      </div>

      {/* Search row */}
      <div className="ns-search-row">
        <div className="ns-search-input-wrap">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/>
          </svg>
          <input className="ns-search-input" placeholder="Search users…" />
        </div>
        <select className="ns-select" style={{ width: 140 }}>
          <option>All plans</option>
          <option>Free</option>
          <option>Core</option>
          <option>Premium</option>
        </select>
        <select className="ns-select" style={{ width: 160 }}>
          <option>All statuses</option>
          <option>Active</option>
          <option>Payment failed</option>
          <option>Safety flag</option>
        </select>
      </div>

      {/* Users table */}
      <div className="ns-card">
        <div className="ns-table-wrap">
          <table className="ns-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Plan</th>
                <th>Joined</th>
                <th>Last active</th>
                <th>Nila msgs</th>
                <th>Credits</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {USERS.map((u) => (
                <tr key={u.email}>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--ns-ink)' }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ns-ink-4)' }}>{u.email}</div>
                  </td>
                  <td>
                    <span className={`ns-badge ns-badge--${u.planBadge}`}>{u.plan}</span>
                  </td>
                  <td className="muted">{u.joined}</td>
                  <td className="muted">{u.lastActive}</td>
                  <td>{u.nilaMessages.toLocaleString()}</td>
                  <td>{u.credits}</td>
                  <td>
                    <span className={`ns-badge ns-badge--${u.statusBadge}`}>
                      <span className="ns-badge__dot" />{u.status}
                    </span>
                  </td>
                  <td>
                    <button className={`ns-btn ns-btn--${u.actionVariant} ns-btn--sm`}>{u.action}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info notice */}
      <div className="ns-notice">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--ns-forest)" strokeWidth="1.4" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
          <path d="M12 11V5a4 4 0 0 0-8 0v6"/><rect x="2" y="11" width="12" height="3" rx="1.5"/>
        </svg>
        <span>
          Nila conversation content is never visible here. Flagged users show only signal type and timestamp.
          Message content is stored encrypted and accessible only by the user.
        </span>
      </div>
    </>
  );
}
