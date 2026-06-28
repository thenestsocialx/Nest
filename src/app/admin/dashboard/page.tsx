'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// ── Types ─────────────────────────────────────────────────────────────────────

interface RecentLog {
  id: string;
  event_type: string;
  actor_email: string | null;
  target_label: string | null;
  action: string;
  created_at: string;
}

interface AllySnap {
  id: string;
  full_name: string | null;
  email: string | null;
  specialties: string[];
  is_active: boolean;
  onboarding_status: string;
}

interface WeekDay {
  day: string;
  cnt: number;
}

interface DashStats {
  totalUsers: number;
  activeSubscriptions: number;
  paymentFailures: number;
  totalAllies: number;
  activeAllies: number;
  pendingApplications: number;
  recentAuditLogs: RecentLog[];
  allySnapshot: AllySnap[];
  nilaMessagesToday: number;
  weeklyActivity: WeekDay[];
  sessionsTotal: number;
  sessionsCompleted: number;
  sessionsPending: number;
  safetyFlagCount: number;
  mrrInr: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function initials(name: string | null): string {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function auditCategory(eventType: string): 'ally' | 'client' | 'system' | 'other' {
  if (eventType.startsWith('ally.'))   return 'ally';
  if (eventType.startsWith('client.')) return 'client';
  if (eventType.startsWith('system.')) return 'system';
  return 'other';
}

function fmtInr(amount: number): string {
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(1)}L`;
  if (amount >= 1_000)   return `₹${(amount / 1_000).toFixed(1)}K`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

const AUDIT_ICON_CLASS: Record<string, string> = {
  ally:   'ns-audit__icon--green',
  client: 'ns-audit__icon--amber',
  system: 'ns-audit__icon--forest',
  other:  'ns-audit__icon--green',
};

// ── Skeleton pieces ───────────────────────────────────────────────────────────

function MetricSkeleton() {
  return (
    <div className="ns-metric">
      <div className="ns-skeleton" style={{ width: 32, height: 32, borderRadius: 8, marginBottom: 14 }} />
      <div className="ns-skeleton" style={{ width: '55%', height: 9, borderRadius: 3, marginBottom: 10 }} />
      <div className="ns-skeleton" style={{ width: '72%', height: 26, borderRadius: 4, marginBottom: 8 }} />
      <div className="ns-skeleton" style={{ width: '48%', height: 9, borderRadius: 3 }} />
    </div>
  );
}

function AuditRowSkeleton() {
  return (
    <div className="ns-audit-item">
      <div className="ns-skeleton" style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="ns-skeleton" style={{ width: '65%', height: 10, borderRadius: 3, marginBottom: 6 }} />
        <div className="ns-skeleton" style={{ width: '45%', height: 9, borderRadius: 3 }} />
      </div>
      <div className="ns-skeleton" style={{ width: 40, height: 9, borderRadius: 3, flexShrink: 0 }} />
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="ns-skeleton" style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0 }} />
          <div>
            <div className="ns-skeleton" style={{ width: 100, height: 10, borderRadius: 3, marginBottom: 5 }} />
            <div className="ns-skeleton" style={{ width: 72, height: 9, borderRadius: 3 }} />
          </div>
        </div>
      </td>
      <td>
        <div className="ns-skeleton" style={{ width: 120, height: 18, borderRadius: 4 }} />
      </td>
      <td>
        <div className="ns-skeleton" style={{ width: 52, height: 18, borderRadius: 4 }} />
      </td>
      <td>
        <div className="ns-skeleton" style={{ width: 42, height: 24, borderRadius: 5 }} />
      </td>
    </tr>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconUsers() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="6" cy="5" r="2.5"/>
      <path d="M1 13c0-2.8 2.2-5 5-5s5 2.2 5 5"/>
      <circle cx="12" cy="5" r="2"/>
      <path d="M11 13c0-1.4.5-2.6 1.3-3.5"/>
    </svg>
  );
}

function IconSubscription() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="8" cy="8" r="6"/>
      <path d="M5.5 8l1.8 1.8L10.5 6"/>
    </svg>
  );
}

function IconMrr() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M8 2v12M5 5h4.5a2 2 0 0 1 0 4H5M5 9h5"/>
    </svg>
  );
}

function IconMessage() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M14 5H2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h1v2l3-2h8a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z"/>
      <path d="M5 9h6M5 7h4"/>
    </svg>
  );
}

function IconAllies() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M5.5 6.5A2.5 2.5 0 1 0 8 4a2.5 2.5 0 0 0-2.5 2.5z"/>
      <path d="M2 13.5a6 6 0 0 1 12 0"/>
    </svg>
  );
}

function IconPayment() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <rect x="1" y="4" width="14" height="10" rx="1.5"/>
      <path d="M1 7h14"/>
      <path d="M4 10.5h2M10 10.5h2"/>
    </svg>
  );
}

function IconSessions() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <rect x="2" y="2" width="12" height="12" rx="2"/>
      <path d="M5 8h6M8 5v6"/>
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M8 1.5L2 4v4c0 3.5 2.7 6 6 7 3.3-1 6-3.5 6-7V4L8 1.5z"/>
      <path d="M5.5 8l1.8 1.8L10.5 6"/>
    </svg>
  );
}

// Audit event icons
function AuditIconAlly() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--ns-teal)" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="6" cy="4" r="2"/>
      <path d="M1 11c0-2.8 2.2-5 5-5s5 2.2 5 5"/>
    </svg>
  );
}
function AuditIconClient() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--ns-amber)" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="6" cy="6" r="4.5"/>
      <path d="M6 3.5V6l1.5 1.5"/>
    </svg>
  );
}
function AuditIconSystem() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--ns-forest)" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="6" cy="6" r="1.5"/>
      <path d="M6 1v2M6 9v2M1 6h2M9 6h2M2.3 2.3l1.4 1.4M8.3 8.3l1.4 1.4M2.3 9.7l1.4-1.4M8.3 3.7l1.4-1.4"/>
    </svg>
  );
}
function AuditIconOther() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--ns-ink-4)" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="6" cy="6" r="4.5"/>
      <path d="M6 4v3M6 8.5v.5"/>
    </svg>
  );
}

function AuditIcon({ eventType }: { eventType: string }) {
  const cat = auditCategory(eventType);
  const iconClass = AUDIT_ICON_CLASS[cat];
  const icon = cat === 'ally'   ? <AuditIconAlly /> :
               cat === 'client' ? <AuditIconClient /> :
               cat === 'system' ? <AuditIconSystem /> :
                                  <AuditIconOther />;
  return <div className={`ns-audit__icon ${iconClass}`}>{icon}</div>;
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface MetricCardProps {
  variant?: 'green' | 'teal' | 'amber' | 'red' | '';
  icon: React.ReactNode;
  label: string;
  value: string;
  delta?: { dir: 'up' | 'dn'; text: string };
  sub?: string;
  href?: string;
}

function MetricCard({ variant = '', icon, label, value, delta, sub, href }: MetricCardProps) {
  const cls = `ns-metric${variant ? ` ns-metric--${variant}` : ''}`;

  const inner = (
    <>
      <div className="ns-metric__icon">{icon}</div>
      <div className="ns-metric__label">{label}</div>
      <div className="ns-metric__val">{value}</div>
      {delta && (
        <div className={`ns-metric__delta ns-metric__delta--${delta.dir}`}>
          {delta.dir === 'up' ? (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2 7L5 3L8 7"/>
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2 3L5 7L8 3"/>
            </svg>
          )}
          {delta.text}
        </div>
      )}
      {sub && <div className="ns-metric__sub">{sub}</div>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cls} style={{ color: 'inherit', display: 'block', textDecoration: 'none' }}>
        {inner}
      </Link>
    );
  }
  return <div className={cls}>{inner}</div>;
}

function AuditRow({ log }: { log: RecentLog }) {
  const title = log.action || log.event_type.replace(/\./g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const sub = [log.actor_email, log.target_label].filter(Boolean).join(' · ');

  return (
    <div className="ns-audit-item">
      <AuditIcon eventType={log.event_type} />
      <div className="ns-audit__body">
        <div className="ns-audit__title">{title}</div>
        {sub && <div className="ns-audit__sub">{sub}</div>}
      </div>
      <div className="ns-audit__time">{fmtRelative(log.created_at)}</div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [stats, setStats]   = useState<DashStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/dashboard/stats')
      .then(r => {
        if (!r.ok) throw new Error('Failed to load');
        return r.json() as Promise<DashStats>;
      })
      .then(data => setStats(data))
      .catch(err => setError(err instanceof Error ? err.message : 'Unknown error'))
      .finally(() => setLoading(false));
  }, []);

  const s = stats;

  // Compute real weekly chart bars from DB data
  const weeklyBars = (() => {
    if (!s || s.weeklyActivity.length === 0) return null;
    const maxCnt = Math.max(...s.weeklyActivity.map(d => d.cnt), 1);
    return s.weeklyActivity.map(d => ({
      day: new Date(d.day).toLocaleDateString('en-IN', { weekday: 'narrow' }),
      h:   `${Math.max(Math.round((d.cnt / maxCnt) * 100), 4)}%`,
      hi:  d.cnt > 0 && d.cnt === maxCnt,
      cnt: d.cnt,
    }));
  })();

  return (
    <>
      {/* ── Pending applications banner ───────────────────────────────────── */}
      {!loading && s && s.pendingApplications > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          background: 'var(--ns-forest-light)',
          border: '1px solid rgba(47,76,58,0.18)',
          borderRadius: 'var(--ns-radius)',
          marginBottom: 4,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--ns-forest)" strokeWidth="1.4" strokeLinecap="round" style={{ flexShrink: 0 }}>
            <circle cx="8" cy="8" r="6.5"/>
            <path d="M8 5v3M8 9.5v.5"/>
          </svg>
          <span style={{ flex: 1, fontSize: 13, color: 'var(--ns-forest)', fontWeight: 500 }}>
            {s.pendingApplications} ally application{s.pendingApplications !== 1 ? 's' : ''} waiting for review
          </span>
          <Link href="/admin/allies/applications" className="ns-btn ns-btn--primary ns-btn--sm">
            Review now →
          </Link>
        </div>
      )}

      {/* ── Safety flag banner ────────────────────────────────────────────── */}
      {!loading && s && s.safetyFlagCount > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          background: 'rgba(196,75,58,0.07)',
          border: '1px solid rgba(196,75,58,0.22)',
          borderRadius: 'var(--ns-radius)',
          marginBottom: 4,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--ns-red)" strokeWidth="1.4" strokeLinecap="round" style={{ flexShrink: 0 }}>
            <path d="M8 1.5L1.5 4v4.5C1.5 12 4.5 14.7 8 15.5c3.5-.8 6.5-3.5 6.5-7V4L8 1.5z"/>
            <path d="M8 6v3M8 10.5v.5"/>
          </svg>
          <span style={{ flex: 1, fontSize: 13, color: 'var(--ns-red)', fontWeight: 500 }}>
            {s.safetyFlagCount} user{s.safetyFlagCount !== 1 ? 's' : ''} flagged for safety review
          </span>
          <Link href="/admin/users?flag=true" className="ns-btn ns-btn--sm" style={{
            background: 'var(--ns-red)',
            color: '#fff',
            border: 'none',
          }}>
            Review →
          </Link>
        </div>
      )}

      {/* ── Metric cards ─────────────────────────────────────────────────────── */}
      <div className="ns-metrics">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <MetricSkeleton key={i} />)
        ) : error ? (
          <div style={{ gridColumn: '1/-1', color: 'var(--ns-red)', fontSize: 13, padding: '12px 0' }}>
            ⚠ Could not load metrics: {error}
          </div>
        ) : s ? (
          <>
            <MetricCard
              variant="green"
              icon={<IconUsers />}
              label="Total Users"
              value={s.totalUsers.toLocaleString('en-IN')}
              href="/admin/users"
            />
            <MetricCard
              variant="teal"
              icon={<IconSubscription />}
              label="Active Subscriptions"
              value={s.activeSubscriptions.toLocaleString('en-IN')}
            />
            <MetricCard
              variant="amber"
              icon={<IconMrr />}
              label="MRR"
              value={fmtInr(s.mrrInr)}
              sub={s.mrrInr === 0 ? 'No active paid subscriptions' : `${s.activeSubscriptions} paid plans`}
            />
            <MetricCard
              icon={<IconMessage />}
              label="Nila Messages Today"
              value={s.nilaMessagesToday.toLocaleString('en-IN')}
              sub={s.nilaMessagesToday === 0 ? 'No messages yet today' : 'Messages sent today'}
            />
            <MetricCard
              icon={<IconAllies />}
              label="Active Allies"
              value={s.activeAllies.toLocaleString('en-IN')}
              sub={`${s.totalAllies} total registered`}
              href="/admin/allies"
            />
            <MetricCard
              variant={s.paymentFailures > 0 ? 'red' : ''}
              icon={<IconPayment />}
              label="Payment Failures"
              value={s.paymentFailures.toLocaleString('en-IN')}
              sub={s.paymentFailures > 0 ? 'Requires attention' : 'All payments healthy'}
              href={s.paymentFailures > 0 ? '/admin/users' : undefined}
            />
          </>
        ) : null}
      </div>

      {/* ── 60/40: weekly chart + live audit feed ────────────────────────────── */}
      <div className="ns-60-40">

        {/* Left — weekly Nila activity (real data) */}
        <div className="ns-card">
          <div className="ns-section-hd" style={{ marginBottom: 12 }}>
            <div className="ns-card__label">Weekly Nila activity</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <span className="ns-badge ns-badge--forest">Messages</span>
            </div>
          </div>

          {!loading && weeklyBars ? (
            <div className="ns-bar-chart" style={{ height: 80, gap: 8 }}>
              {weeklyBars.map((b, i) => (
                <div key={i} className="ns-bar-chart__col" title={`${b.cnt} messages`}>
                  <div className={`ns-bar-chart__bar${b.hi ? ' ns-bar-chart__bar--hi' : ''}`} style={{ height: b.h }} />
                  <div className="ns-bar-chart__day">{b.day}</div>
                </div>
              ))}
            </div>
          ) : !loading ? (
            <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ns-ink-4)', fontSize: 12 }}>
              No messages in the last 7 days
            </div>
          ) : (
            <div className="ns-skeleton" style={{ height: 80, borderRadius: 6 }} />
          )}
        </div>

        {/* Right — live audit feed */}
        <div className="ns-card">
          <div className="ns-section-hd" style={{ marginBottom: 12 }}>
            <div className="ns-card__label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              Recent activity
              <span style={{
                display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                background: 'var(--ns-teal)',
                boxShadow: '0 0 0 2px rgba(42,122,106,0.25)',
              }} />
            </div>
            <Link href="/admin/audit" className="ns-btn ns-btn--ghost ns-btn--sm">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="ns-audit">
              {Array.from({ length: 5 }).map((_, i) => <AuditRowSkeleton key={i} />)}
            </div>
          ) : (s?.recentAuditLogs ?? []).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--ns-ink-4)', fontSize: 13 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>📋</div>
              No events recorded yet
            </div>
          ) : (
            <div className="ns-audit">
              {(s?.recentAuditLogs ?? []).map(log => (
                <AuditRow key={log.id} log={log} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Sessions overview ─────────────────────────────────────────────────── */}
      <div className="ns-card">
        <div className="ns-section-hd" style={{ marginBottom: 16 }}>
          <div className="ns-card__label">Sessions overview</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ padding: '12px 16px', background: 'var(--ns-surface)', borderRadius: 8 }}>
                <div className="ns-skeleton" style={{ width: '50%', height: 9, borderRadius: 3, marginBottom: 10 }} />
                <div className="ns-skeleton" style={{ width: '65%', height: 22, borderRadius: 4 }} />
              </div>
            ))
          ) : (
            <>
              <div style={{ padding: '12px 16px', background: 'var(--ns-surface)', borderRadius: 8 }}>
                <div className="ns-card__label" style={{ marginBottom: 6 }}>Total Booked</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 22, fontWeight: 600, color: 'var(--ns-ink)' }}>
                    {s?.sessionsTotal.toLocaleString('en-IN') ?? '0'}
                  </span>
                  <IconSessions />
                </div>
              </div>
              <div style={{ padding: '12px 16px', background: 'var(--ns-surface)', borderRadius: 8 }}>
                <div className="ns-card__label" style={{ marginBottom: 6 }}>Completed</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 22, fontWeight: 600, color: 'var(--ns-teal)' }}>
                    {s?.sessionsCompleted.toLocaleString('en-IN') ?? '0'}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--ns-ink-4)' }}>
                    {s && s.sessionsTotal > 0
                      ? `${Math.round((s.sessionsCompleted / s.sessionsTotal) * 100)}% of total`
                      : 'sessions'}
                  </span>
                </div>
              </div>
              <div style={{ padding: '12px 16px', background: 'var(--ns-surface)', borderRadius: 8 }}>
                <div className="ns-card__label" style={{ marginBottom: 6 }}>Pending / Active</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 22, fontWeight: 600, color: s && s.sessionsPending > 0 ? 'var(--ns-amber)' : 'var(--ns-ink)' }}>
                    {s?.sessionsPending.toLocaleString('en-IN') ?? '0'}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--ns-ink-4)' }}>awaiting</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Active ally snapshot ─────────────────────────────────────────────── */}
      <div className="ns-card">
        <div className="ns-section-hd">
          <div className="ns-card__label">Active ally snapshot</div>
          <Link href="/admin/allies" className="ns-btn ns-btn--ghost ns-btn--sm">
            View all allies →
          </Link>
        </div>

        {loading ? (
          <div className="ns-table-wrap">
            <table className="ns-table">
              <thead>
                <tr>
                  <th>Ally</th>
                  <th>Specialties</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} />)}
              </tbody>
            </table>
          </div>
        ) : (s?.allySnapshot ?? []).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 0', color: 'var(--ns-ink-4)', fontSize: 13 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>👤</div>
            No active allies yet —{' '}
            <Link href="/admin/allies/applications" style={{ color: 'var(--ns-forest)', textDecoration: 'underline' }}>
              review pending applications
            </Link>
          </div>
        ) : (
          <div className="ns-table-wrap">
            <table className="ns-table">
              <thead>
                <tr>
                  <th>Ally</th>
                  <th>Specialties</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(s?.allySnapshot ?? []).map(ally => (
                  <tr key={ally.id}>
                    {/* Avatar + name */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="ns-ally-avatar" style={{ width: 30, height: 30, fontSize: 10, flexShrink: 0 }}>
                          {initials(ally.full_name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 13 }}>{ally.full_name ?? '—'}</div>
                          {ally.email && (
                            <div style={{ fontSize: 11, color: 'var(--ns-ink-4)', marginTop: 1 }}>
                              {ally.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Specialties */}
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {(ally.specialties ?? []).slice(0, 3).map(sp => (
                          <span key={sp} className="ns-badge ns-badge--gray" style={{ fontSize: 10 }}>{sp}</span>
                        ))}
                        {(ally.specialties ?? []).length > 3 && (
                          <span className="ns-badge ns-badge--gray" style={{ fontSize: 10 }}>
                            +{(ally.specialties ?? []).length - 3}
                          </span>
                        )}
                        {(ally.specialties ?? []).length === 0 && (
                          <span style={{ color: 'var(--ns-ink-4)', fontSize: 12 }}>—</span>
                        )}
                      </div>
                    </td>

                    {/* Status badge */}
                    <td>
                      <span className="ns-badge ns-badge--green">
                        <span className="ns-badge__dot" />
                        Active
                      </span>
                    </td>

                    {/* Action — pass ally id so list page can highlight/scroll */}
                    <td>
                      <Link href={`/admin/allies?id=${ally.id}`} className="ns-btn ns-btn--ghost ns-btn--sm">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
