const ALLIES = [
  {
    initials: 'PN', avatarVariant: '',
    name: 'Priya Nair', specialties: 'Anxiety · Relationships',
    sessions: 86, rating: '4.9',
    status: 'Active', statusBadge: 'green',
    actions: ['Edit', 'Pause'],
  },
  {
    initials: 'RM', avatarVariant: '--v2',
    name: 'Riya Menon', specialties: 'Loneliness · Grief',
    sessions: 54, rating: '4.7',
    status: 'Active', statusBadge: 'green',
    actions: ['Edit', 'Pause'],
  },
  {
    initials: 'KV', avatarVariant: '--v3',
    name: 'Kiran V.', specialties: 'Breakups · Trust',
    sessions: 9, rating: '4.3',
    status: 'Pending', statusBadge: 'amber',
    actions: ['Activate', 'Edit'],
  },
  {
    initials: 'SA', avatarVariant: '--v3',
    name: 'Sneha A.', specialties: 'Depression · Self-worth',
    sessions: 31, rating: '4.8',
    status: 'Paused', statusBadge: 'gray',
    actions: ['Reactivate'],
  },
];

export default function AlliesPage() {
  return (
    <>
      {/* Header */}
      <div className="ns-search-row">
        <div className="ns-search-input-wrap">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/>
          </svg>
          <input className="ns-search-input" placeholder="Search allies…" />
        </div>
        <select className="ns-select" style={{ width: 160 }}>
          <option>All statuses</option>
          <option>Active</option>
          <option>Pending</option>
          <option>Paused</option>
        </select>
        <a href="/admin/allies/onboard" className="ns-btn ns-btn--primary">+ Add Ally</a>
      </div>

      <div className="ns-60-40">
        {/* Allies table */}
        <div className="ns-card">
          <div className="ns-card__head">
            <div className="ns-card__label">All allies</div>
            <span className="ns-badge ns-badge--gray">11 total</span>
          </div>
          <div className="ns-table-wrap">
            <table className="ns-table">
              <thead>
                <tr>
                  <th>Ally</th>
                  <th>Specialties</th>
                  <th>Sessions</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ALLIES.map((ally) => (
                  <tr key={ally.name}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className={`ns-ally-avatar${ally.avatarVariant}`} style={{ width: 32, height: 32 }}>
                          {ally.initials}
                        </div>
                        <span style={{ fontWeight: 500 }}>{ally.name}</span>
                      </div>
                    </td>
                    <td className="muted">{ally.specialties}</td>
                    <td>{ally.sessions}</td>
                    <td><span style={{ fontWeight: 500, color: 'var(--ns-gold)' }}>★ {ally.rating}</span></td>
                    <td>
                      <span className={`ns-badge ns-badge--${ally.statusBadge}`}>
                        <span className="ns-badge__dot" />{ally.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {ally.actions.map((action) => (
                          <button key={action} className="ns-btn ns-btn--ghost ns-btn--sm">{action}</button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Session stats */}
          <div className="ns-card">
            <div className="ns-card__label" style={{ marginBottom: 12 }}>This week's sessions</div>
            <div className="ns-two-col" style={{ gap: 12 }}>
              <div>
                <div className="ns-card__label">Completed</div>
                <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--ns-teal)' }}>61</div>
              </div>
              <div>
                <div className="ns-card__label">Cancelled</div>
                <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--ns-red)' }}>7</div>
              </div>
              <div>
                <div className="ns-card__label">Avg duration</div>
                <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--ns-ink)' }}>48<span style={{ fontSize: 12, color: 'var(--ns-ink-4)' }}>min</span></div>
              </div>
              <div>
                <div className="ns-card__label">Avg rating</div>
                <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--ns-gold)' }}>4.7</div>
              </div>
            </div>
          </div>

          {/* Payout summary */}
          <div className="ns-card">
            <div className="ns-card__head">
              <div className="ns-card__label">Payout summary</div>
              <button className="ns-btn ns-btn--ghost ns-btn--sm">Export CSV</button>
            </div>
            {[
              { name: 'Priya Nair', sessions: 34, amount: '₹8,500' },
              { name: 'Riya Menon', sessions: 21, amount: '₹5,250' },
            ].map((p) => (
              <div key={p.name} className="ns-ally-row">
                <div className="ns-ally__body">
                  <div className="ns-ally__name">{p.name}</div>
                  <div className="ns-ally__meta">{p.sessions} sessions</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ns-ink)' }}>{p.amount}</span>
                  <span className="ns-badge ns-badge--amber">Pending</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
