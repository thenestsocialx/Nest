export default function DashboardPage() {
  return (
    <>
      {/* ── Metrics ── */}
      <div className="ns-metrics">
        <div className="ns-metric ns-metric--green">
          <div className="ns-metric__label">Total users</div>
          <div className="ns-metric__val">4,821</div>
          <div className="ns-metric__delta ns-metric__delta--up">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 7L5 3L8 7"/></svg>
            +14% this month
          </div>
        </div>
        <div className="ns-metric ns-metric--teal">
          <div className="ns-metric__label">Active subscriptions</div>
          <div className="ns-metric__val">1,204</div>
          <div className="ns-metric__delta ns-metric__delta--up">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 7L5 3L8 7"/></svg>
            +8% vs last month
          </div>
        </div>
        <div className="ns-metric ns-metric--amber">
          <div className="ns-metric__label">MRR</div>
          <div className="ns-metric__val">₹2.4L</div>
          <div className="ns-metric__delta ns-metric__delta--up">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 7L5 3L8 7"/></svg>
            +₹28k this month
          </div>
        </div>
        <div className="ns-metric">
          <div className="ns-metric__label">Nila messages today</div>
          <div className="ns-metric__val">9,341</div>
          <div className="ns-metric__sub">Avg 14ms response · 0.3% error</div>
        </div>
        <div className="ns-metric">
          <div className="ns-metric__label">Ally sessions this week</div>
          <div className="ns-metric__val">183</div>
          <div className="ns-metric__delta ns-metric__delta--dn">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 3L5 7L8 3"/></svg>
            −5 vs last week
          </div>
        </div>
        <div className="ns-metric ns-metric--red">
          <div className="ns-metric__label">Payment failures</div>
          <div className="ns-metric__val">12</div>
          <div className="ns-metric__sub">3 in grace period · 9 dunning</div>
        </div>
      </div>

      {/* ── 60/40 grid: chart + audit ── */}
      <div className="ns-60-40">
        {/* Chart card */}
        <div className="ns-card">
          <div className="ns-section-hd" style={{ marginBottom: 12 }}>
            <div className="ns-card__label">Weekly Nila activity</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <span className="ns-badge ns-badge--forest">Messages</span>
              <span className="ns-badge ns-badge--gray">Sessions</span>
            </div>
          </div>
          <div className="ns-bar-chart" style={{ height: 80, gap: 8 }}>
            {[
              { day: 'M', h: '58%' },
              { day: 'T', h: '72%', hi: true },
              { day: 'W', h: '49%' },
              { day: 'T', h: '88%', hi: true },
              { day: 'F', h: '95%', hi: true },
              { day: 'S', h: '64%' },
              { day: 'S', h: '38%' },
            ].map((b, i) => (
              <div key={i} className="ns-bar-chart__col">
                <div
                  className={`ns-bar-chart__bar${b.hi ? ' ns-bar-chart__bar--hi' : ''}`}
                  style={{ height: b.h }}
                />
                <div className="ns-bar-chart__day">{b.day}</div>
              </div>
            ))}
          </div>
          <div className="ns-divider" />
          <div className="ns-three-col" style={{ gap: 12, marginTop: 0 }}>
            <div>
              <div className="ns-card__label">Credit burn rate</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--ns-ink)', margin: '4px 0' }}>
                ₹1,840<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--ns-ink-4)' }}>/day</span>
              </div>
              <div className="ns-progress"><div className="ns-progress__fill ns-progress__fill--amber" style={{ width: '62%' }} /></div>
            </div>
            <div>
              <div className="ns-card__label">Churn rate</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--ns-ink)', margin: '4px 0' }}>3.2%</div>
              <div className="ns-progress"><div className="ns-progress__fill" style={{ width: '32%' }} /></div>
            </div>
            <div>
              <div className="ns-card__label">Avg session mood</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--ns-ink)', margin: '4px 0' }}>
                2.8<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--ns-ink-4)' }}>/5</span>
              </div>
              <div className="ns-progress"><div className="ns-progress__fill" style={{ width: '56%' }} /></div>
            </div>
          </div>
        </div>

        {/* Audit log */}
        <div className="ns-card">
          <div className="ns-card__label" style={{ marginBottom: 12 }}>Audit log · live</div>
          <div className="ns-audit">
            <div className="ns-audit-item">
              <div className="ns-audit__icon ns-audit__icon--green">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--ns-teal)" strokeWidth="1.4" strokeLinecap="round"><path d="M2 6l3 3 5-5"/></svg>
              </div>
              <div className="ns-audit__body">
                <div className="ns-audit__title">Subscription upgraded</div>
                <div className="ns-audit__sub">user:aryan@gmail.com · Free → Core</div>
              </div>
              <div className="ns-audit__time">2m ago</div>
            </div>
            <div className="ns-audit-item">
              <div className="ns-audit__icon ns-audit__icon--amber">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--ns-amber)" strokeWidth="1.4" strokeLinecap="round"><path d="M6 3v3M6 8.5V9"/><circle cx="6" cy="6" r="4.5"/></svg>
              </div>
              <div className="ns-audit__body">
                <div className="ns-audit__title">Nila safety flag triggered</div>
                <div className="ns-audit__sub">user:anon_7821 · assigned to Priya N.</div>
              </div>
              <div className="ns-audit__time">14m ago</div>
            </div>
            <div className="ns-audit-item">
              <div className="ns-audit__icon ns-audit__icon--forest">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--ns-forest)" strokeWidth="1.4" strokeLinecap="round"><rect x="2" y="2" width="8" height="8" rx="1.5"/><path d="M4 6h4M6 4v4"/></svg>
              </div>
              <div className="ns-audit__body">
                <div className="ns-audit__title">Ally profile activated</div>
                <div className="ns-audit__sub">ally:riya_menon · now visible to users</div>
              </div>
              <div className="ns-audit__time">32m ago</div>
            </div>
            <div className="ns-audit-item">
              <div className="ns-audit__icon ns-audit__icon--red">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--ns-red)" strokeWidth="1.4" strokeLinecap="round"><path d="M3 3l6 6M9 3l-6 6"/></svg>
              </div>
              <div className="ns-audit__body">
                <div className="ns-audit__title">Payment failed</div>
                <div className="ns-audit__sub">user:kavitha@mail.com · retry 2 of 3</div>
              </div>
              <div className="ns-audit__time">1h ago</div>
            </div>
            <div className="ns-audit-item">
              <div className="ns-audit__icon ns-audit__icon--green">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--ns-teal)" strokeWidth="1.4" strokeLinecap="round"><path d="M2 6l3 3 5-5"/></svg>
              </div>
              <div className="ns-audit__body">
                <div className="ns-audit__title">Zoho sync completed</div>
                <div className="ns-audit__sub">8 Ally profiles synced successfully</div>
              </div>
              <div className="ns-audit__time">2h ago</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Ally snapshot table ── */}
      <div className="ns-card">
        <div className="ns-section-hd">
          <div className="ns-card__label">Ally snapshot</div>
          <a href="/admin/allies" className="ns-btn ns-btn--ghost ns-btn--sm">View all allies</a>
        </div>
        <div className="ns-table-wrap">
          <table className="ns-table">
            <thead>
              <tr>
                <th>Ally</th>
                <th>Specialties</th>
                <th>Sessions this month</th>
                <th>Rating</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="ns-ally-avatar" style={{ width: 28, height: 28, fontSize: 10 }}>PN</div>
                    <span>Priya Nair</span>
                  </div>
                </td>
                <td className="muted">Anxiety · Relationships</td>
                <td>34</td>
                <td><span style={{ fontWeight: 500, color: 'var(--ns-gold)' }}>★ 4.9</span></td>
                <td><span className="ns-badge ns-badge--green"><span className="ns-badge__dot" />Active</span></td>
                <td><button className="ns-btn ns-btn--ghost ns-btn--sm">View</button></td>
              </tr>
              <tr>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="ns-ally-avatar ns-ally-avatar--v2" style={{ width: 28, height: 28, fontSize: 10 }}>RM</div>
                    <span>Riya Menon</span>
                  </div>
                </td>
                <td className="muted">Loneliness · Grief</td>
                <td>21</td>
                <td><span style={{ fontWeight: 500, color: 'var(--ns-gold)' }}>★ 4.7</span></td>
                <td><span className="ns-badge ns-badge--green"><span className="ns-badge__dot" />Active</span></td>
                <td><button className="ns-btn ns-btn--ghost ns-btn--sm">View</button></td>
              </tr>
              <tr>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="ns-ally-avatar ns-ally-avatar--v3" style={{ width: 28, height: 28, fontSize: 10 }}>KV</div>
                    <span>Kiran V.</span>
                  </div>
                </td>
                <td className="muted">Breakups · Trust</td>
                <td>9</td>
                <td><span style={{ fontWeight: 500, color: 'var(--ns-gold)' }}>★ 4.3</span></td>
                <td><span className="ns-badge ns-badge--amber"><span className="ns-badge__dot" />Pending</span></td>
                <td><button className="ns-btn ns-btn--ghost ns-btn--sm">View</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
