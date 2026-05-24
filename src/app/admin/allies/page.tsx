'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

// ── Types ─────────────────────────────────────────────────────────────────────
type OnboardingStatus = 'draft' | 'submitted' | 'approved' | 'active' | 'rejected';

interface AllyListItem {
  id: string;
  full_name: string | null;
  display_name: string | null;
  email: string | null;
  photo_url: string | null;
  primary_role: string | null;
  specialties: string[];
  onboarding_status: OnboardingStatus;
  onboarding_step: number;
  is_active: boolean;
  zoho_staff_id: string | null;
  zoho_service_ids: Record<string, string> | null;
  session_durations: string[];
  session_price: number;
  created_at: string;
  updated_at: string | null;
  admin_notes: string | null;
}

type DisplayStatus = 'Active' | 'Paused' | 'Pending' | 'Draft' | 'Rejected';
type StatusFilter  = 'all' | 'active' | 'paused' | 'pending' | 'draft' | 'rejected';

interface Toast { type: 'success' | 'error'; message: string }

// ── Helpers ───────────────────────────────────────────────────────────────────
function initials(name: string | null): string {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function getDisplayStatus(ally: AllyListItem): { label: DisplayStatus; badge: string } {
  if (ally.onboarding_status === 'active' && ally.is_active)  return { label: 'Active',   badge: 'green' };
  if (ally.onboarding_status === 'active' && !ally.is_active) return { label: 'Paused',   badge: 'gray'  };
  if (ally.onboarding_status === 'submitted' || ally.onboarding_status === 'approved')
                                                              return { label: 'Pending',  badge: 'amber' };
  if (ally.onboarding_status === 'rejected')                  return { label: 'Rejected', badge: 'red'   };
  return { label: 'Draft', badge: 'gray' };
}

function matchesFilter(ally: AllyListItem, filter: StatusFilter): boolean {
  if (filter === 'all') return true;
  return getDisplayStatus(ally).label.toLowerCase() === filter;
}

function matchesSearch(ally: AllyListItem, q: string): boolean {
  if (!q) return true;
  const lower = q.toLowerCase();
  return (
    (ally.full_name ?? '').toLowerCase().includes(lower) ||
    (ally.display_name ?? '').toLowerCase().includes(lower) ||
    (ally.email ?? '').toLowerCase().includes(lower) ||
    (ally.primary_role ?? '').toLowerCase().includes(lower) ||
    (ally.specialties ?? []).some(s => s.toLowerCase().includes(lower))
  );
}

// ── Avatar colour variants ────────────────────────────────────────────────────
const AVATAR_VARIANTS = ['', '--v2', '--v3', '--v4'] as const;
function avatarVariant(id: string): string {
  const n = id.charCodeAt(id.length - 1) % AVATAR_VARIANTS.length;
  return AVATAR_VARIANTS[n];
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AlliesPage() {
  const router = useRouter();

  const [allies,       setAllies]       = useState<AllyListItem[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [toast,        setToast]        = useState<Toast | null>(null);
  const [busy,         setBusy]         = useState<Record<string, boolean>>({});

  // ── Toast ─────────────────────────────────────────────────────────────────
  const showToast = useCallback((type: Toast['type'], message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/v1/allies');
      const data = await res.json() as { allies?: AllyListItem[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Failed to load allies');
      setAllies(data.allies ?? []);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to load allies');
      setAllies([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { void load(); }, [load]);

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = useMemo(
    () => allies.filter(a => matchesFilter(a, statusFilter) && matchesSearch(a, search)),
    [allies, statusFilter, search],
  );

  // ── Aggregate stats ───────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    allies.length,
    active:   allies.filter(a => getDisplayStatus(a).label === 'Active').length,
    paused:   allies.filter(a => getDisplayStatus(a).label === 'Paused').length,
    pending:  allies.filter(a => getDisplayStatus(a).label === 'Pending').length,
    draft:    allies.filter(a => getDisplayStatus(a).label === 'Draft').length,
    rejected: allies.filter(a => getDisplayStatus(a).label === 'Rejected').length,
  }), [allies]);

  // ── Active allies for payout summary (top 5) ──────────────────────────────
  const activeAllies = useMemo(
    () => allies.filter(a => a.onboarding_status === 'active' && a.is_active).slice(0, 5),
    [allies],
  );

  // ── Busy state helpers ────────────────────────────────────────────────────
  const setAllyBusy = (id: string, val: boolean) =>
    setBusy(prev => ({ ...prev, [id]: val }));

  // ── Action: Pause ─────────────────────────────────────────────────────────
  async function handlePause(ally: AllyListItem) {
    setAllyBusy(ally.id, true);
    try {
      const res  = await fetch(`/api/v1/allies/${ally.id}/pause`, { method: 'POST' });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Pause failed');
      showToast('success', `${ally.full_name ?? 'Ally'} has been paused`);
      void load();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Pause failed');
    } finally {
      setAllyBusy(ally.id, false);
    }
  }

  // ── Action: Reactivate ────────────────────────────────────────────────────
  async function handleReactivate(ally: AllyListItem) {
    setAllyBusy(ally.id, true);
    try {
      const res  = await fetch(`/api/v1/allies/${ally.id}/reactivate`, { method: 'POST' });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Reactivate failed');
      showToast('success', `✓ ${ally.full_name ?? 'Ally'} is now active again`);
      void load();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Reactivate failed');
    } finally {
      setAllyBusy(ally.id, false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Toast */}
      {toast && (
        <div
          className={`ns-toast ns-toast--${toast.type}`}
          style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, maxWidth: 400 }}
        >
          {toast.message}
        </div>
      )}

      {/* Header row */}
      <div className="ns-search-row">
        <div className="ns-search-input-wrap">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/>
          </svg>
          <input
            className="ns-search-input"
            placeholder="Search allies…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--ns-ink-4)', padding: '0 4px', fontSize: 14, lineHeight: 1,
              }}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <select
          className="ns-select"
          style={{ width: 170 }}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as StatusFilter)}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="pending">Pending review</option>
          <option value="draft">Draft</option>
          <option value="rejected">Rejected</option>
        </select>

        <a href="/admin/allies/onboard" className="ns-btn ns-btn--primary">+ Add Ally</a>
      </div>

      <div className="ns-60-40">
        {/* ── Left: Allies table ─────────────────────────────────────────── */}
        <div className="ns-card">
          <div className="ns-card__head">
            <div className="ns-card__label">All allies</div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {loading && (
                <div className="ob-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
              )}
              <span className="ns-badge ns-badge--gray">
                {loading ? '…' : `${stats.total} total`}
              </span>
            </div>
          </div>

          {loading ? (
            /* Skeleton rows */
            <div className="ns-table-wrap">
              <table className="ns-table">
                <thead>
                  <tr>
                    <th>Ally</th><th>Specialties</th><th>Sessions</th><th>Rating</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map(i => (
                    <tr key={i}>
                      {[140, 120, 40, 40, 60, 100].map((w, j) => (
                        <td key={j}>
                          <div style={{
                            height: 14, width: w, borderRadius: 4,
                            background: 'var(--ns-line)', opacity: 0.6,
                            animation: 'pulse 1.4s ease-in-out infinite',
                          }} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--ns-ink-4)' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>
                {allies.length === 0 ? '🤝' : '🔍'}
              </div>
              <div style={{ fontWeight: 500, color: 'var(--ns-ink)', marginBottom: 4 }}>
                {allies.length === 0
                  ? 'No allies yet'
                  : 'No allies match your filters'}
              </div>
              <div style={{ fontSize: 12, marginBottom: 16 }}>
                {allies.length === 0
                  ? 'Onboard your first ally to get started.'
                  : 'Try a different search term or status filter.'}
              </div>
              {allies.length === 0 ? (
                <a href="/admin/allies/onboard" className="ns-btn ns-btn--primary ns-btn--sm">
                  + Onboard first ally
                </a>
              ) : (
                <button
                  className="ns-btn ns-btn--ghost ns-btn--sm"
                  onClick={() => { setSearch(''); setStatusFilter('all'); }}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="ns-table-wrap">
              <table className="ns-table">
                <thead>
                  <tr>
                    <th>Ally</th>
                    <th>Specialties</th>
                    <th>Rate</th>
                    <th>Durations</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(ally => {
                    const { label, badge } = getDisplayStatus(ally);
                    const isBusy = !!busy[ally.id];

                    return (
                      <tr key={ally.id}>
                        {/* Ally */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {ally.photo_url ? (
                              <img
                                src={ally.photo_url}
                                alt={ally.full_name ?? ''}
                                style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                              />
                            ) : (
                              <div
                                className={`ns-ally-avatar${avatarVariant(ally.id)}`}
                                style={{ width: 34, height: 34, fontSize: 11, flexShrink: 0 }}
                              >
                                {initials(ally.full_name)}
                              </div>
                            )}
                            <div>
                              <div style={{ fontWeight: 500 }}>
                                {ally.full_name ?? ally.display_name ?? '—'}
                              </div>
                              {ally.primary_role && (
                                <div style={{ fontSize: 11, color: 'var(--ns-ink-4)' }}>
                                  {ally.primary_role}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Specialties */}
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                            {(ally.specialties ?? []).slice(0, 2).map(s => (
                              <span key={s} className="ns-badge ns-badge--gray" style={{ fontSize: 10 }}>
                                {s}
                              </span>
                            ))}
                            {(ally.specialties ?? []).length > 2 && (
                              <span className="ns-badge ns-badge--gray" style={{ fontSize: 10 }}>
                                +{ally.specialties.length - 2}
                              </span>
                            )}
                            {(ally.specialties ?? []).length === 0 && (
                              <span style={{ fontSize: 12, color: 'var(--ns-ink-4)' }}>—</span>
                            )}
                          </div>
                        </td>

                        {/* Rate */}
                        <td>
                          {ally.session_price ? (
                            <span style={{ fontWeight: 500, fontSize: 13 }}>
                              ₹{ally.session_price.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--ns-ink-4)', fontSize: 12 }}>—</span>
                          )}
                        </td>

                        {/* Session durations */}
                        <td className="muted" style={{ fontSize: 12 }}>
                          {(ally.session_durations ?? []).length > 0
                            ? ally.session_durations.join(', ')
                            : '—'}
                        </td>

                        {/* Status */}
                        <td>
                          <span className={`ns-badge ns-badge--${badge}`}>
                            <span className="ns-badge__dot" />
                            {label}
                          </span>
                        </td>

                        {/* Actions */}
                        <td>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            {label === 'Active' && (
                              <>
                                <button
                                  className="ns-btn ns-btn--ghost ns-btn--sm"
                                  onClick={() => router.push(`/admin/allies/onboard?ally=${ally.id}`)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="ns-btn ns-btn--ghost ns-btn--sm"
                                  disabled={isBusy}
                                  onClick={() => void handlePause(ally)}
                                  style={{ color: 'var(--ns-amber)' }}
                                >
                                  {isBusy
                                    ? <><span className="ob-spinner" style={{ width: 11, height: 11, borderWidth: 2, display: 'inline-block' }} />&nbsp;</>
                                    : null}
                                  Pause
                                </button>
                              </>
                            )}

                            {label === 'Paused' && (
                              <>
                                <button
                                  className="ns-btn ns-btn--primary ns-btn--sm"
                                  disabled={isBusy}
                                  onClick={() => void handleReactivate(ally)}
                                >
                                  {isBusy
                                    ? <><span className="ob-spinner" style={{ width: 11, height: 11, borderWidth: 2, borderTopColor: 'var(--ob-cream)', display: 'inline-block' }} />&nbsp;Reactivating…</>
                                    : 'Reactivate'}
                                </button>
                                <button
                                  className="ns-btn ns-btn--ghost ns-btn--sm"
                                  onClick={() => router.push(`/admin/allies/onboard?ally=${ally.id}`)}
                                >
                                  Edit
                                </button>
                              </>
                            )}

                            {label === 'Pending' && (
                              <a
                                href="/admin/allies/applications"
                                className="ns-btn ns-btn--ghost ns-btn--sm"
                              >
                                Review →
                              </a>
                            )}

                            {label === 'Draft' && (
                              <button
                                className="ns-btn ns-btn--ghost ns-btn--sm"
                                onClick={() => router.push(`/admin/allies/onboard?ally=${ally.id}`)}
                              >
                                Continue
                              </button>
                            )}

                            {label === 'Rejected' && (
                              <button
                                className="ns-btn ns-btn--ghost ns-btn--sm"
                                onClick={() => router.push(`/admin/allies/onboard?ally=${ally.id}`)}
                              >
                                View
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Right column ──────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Ally overview stats */}
          <div className="ns-card">
            <div className="ns-card__label" style={{ marginBottom: 12 }}>Ally overview</div>
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i}>
                    <div style={{ height: 10, width: 60, borderRadius: 4, background: 'var(--ns-line)', marginBottom: 6 }} />
                    <div style={{ height: 22, width: 40, borderRadius: 4, background: 'var(--ns-line)' }} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="ns-two-col" style={{ gap: 12 }}>
                <div>
                  <div className="ns-card__label">Total</div>
                  <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--ns-ink)' }}>
                    {stats.total}
                  </div>
                </div>
                <div>
                  <div className="ns-card__label">Active</div>
                  <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--ns-teal)' }}>
                    {stats.active}
                  </div>
                </div>
                <div>
                  <div className="ns-card__label">Pending</div>
                  <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--ns-amber)' }}>
                    {stats.pending}
                  </div>
                </div>
                <div>
                  <div className="ns-card__label">Paused</div>
                  <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--ns-ink-4)' }}>
                    {stats.paused}
                  </div>
                </div>
              </div>
            )}

            {/* Mini filter chips */}
            {!loading && stats.total > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--ns-line)' }}>
                {(
                  [
                    { key: 'all',      label: 'All',      count: stats.total,    color: 'gray'  },
                    { key: 'active',   label: 'Active',   count: stats.active,   color: 'green' },
                    { key: 'pending',  label: 'Pending',  count: stats.pending,  color: 'amber' },
                    { key: 'paused',   label: 'Paused',   count: stats.paused,   color: 'gray'  },
                    { key: 'draft',    label: 'Draft',    count: stats.draft,    color: 'gray'  },
                    { key: 'rejected', label: 'Rejected', count: stats.rejected, color: 'red'   },
                  ] as const
                ).filter(c => c.key === 'all' || c.count > 0).map(chip => (
                  <button
                    key={chip.key}
                    onClick={() => setStatusFilter(chip.key)}
                    style={{
                      background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                    }}
                  >
                    <span
                      className={`ns-badge ns-badge--${chip.color}`}
                      style={{
                        outline: statusFilter === chip.key ? '2px solid var(--ns-teal)' : 'none',
                        outlineOffset: 1,
                        cursor: 'pointer',
                      }}
                    >
                      {chip.label} {chip.count}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Payout summary */}
          <div className="ns-card">
            <div className="ns-card__head">
              <div className="ns-card__label">Active allies</div>
              {activeAllies.length > 0 && (
                <button
                  className="ns-btn ns-btn--ghost ns-btn--sm"
                  onClick={() => { setStatusFilter('active'); setSearch(''); }}
                >
                  View all
                </button>
              )}
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1, 2].map(i => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ height: 12, width: 100, borderRadius: 4, background: 'var(--ns-line)', marginBottom: 6 }} />
                      <div style={{ height: 10, width: 70, borderRadius: 4, background: 'var(--ns-line)' }} />
                    </div>
                    <div style={{ height: 14, width: 60, borderRadius: 4, background: 'var(--ns-line)' }} />
                  </div>
                ))}
              </div>
            ) : activeAllies.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--ns-ink-4)', fontSize: 12 }}>
                No active allies yet.
                <br />
                <a href="/admin/allies/applications" style={{ color: 'var(--ns-teal)', textDecoration: 'none', marginTop: 4, display: 'inline-block' }}>
                  Activate from Applications →
                </a>
              </div>
            ) : (
              activeAllies.map(ally => (
                <div key={ally.id} className="ns-ally-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {ally.photo_url ? (
                      <img
                        src={ally.photo_url}
                        alt={ally.full_name ?? ''}
                        style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        className={`ns-ally-avatar${avatarVariant(ally.id)}`}
                        style={{ width: 28, height: 28, fontSize: 10 }}
                      >
                        {initials(ally.full_name)}
                      </div>
                    )}
                    <div className="ns-ally__body">
                      <div className="ns-ally__name">{ally.full_name ?? '—'}</div>
                      <div className="ns-ally__meta">
                        {ally.session_durations?.join(', ') || '—'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {ally.session_price ? (
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ns-ink)' }}>
                        ₹{ally.session_price.toLocaleString('en-IN')}/hr
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--ns-ink-4)' }}>No rate</span>
                    )}
                    <span className="ns-badge ns-badge--green">
                      <span className="ns-badge__dot" />Live
                    </span>
                  </div>
                </div>
              ))
            )}

            {!loading && stats.active > 5 && (
              <div style={{ textAlign: 'center', paddingTop: 10, borderTop: '1px solid var(--ns-line)', marginTop: 4 }}>
                <button
                  className="ns-btn ns-btn--ghost ns-btn--sm"
                  onClick={() => { setStatusFilter('active'); setSearch(''); }}
                >
                  + {stats.active - 5} more active allies
                </button>
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="ns-card" style={{ padding: '14px 16px' }}>
            <div className="ns-card__label" style={{ marginBottom: 10 }}>Quick actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <a
                href="/admin/allies/onboard"
                className="ns-btn ns-btn--ghost ns-btn--sm"
                style={{ justifyContent: 'flex-start', textAlign: 'left' }}
              >
                + Onboard new ally
              </a>
              <a
                href="/admin/allies/applications"
                className="ns-btn ns-btn--ghost ns-btn--sm"
                style={{ justifyContent: 'flex-start', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                Review applications
                {stats.pending > 0 && (
                  <span className="ns-badge ns-badge--amber">{stats.pending}</span>
                )}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Pulse animation for skeleton ─────────────────────────────────── */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 0.25; }
        }
      `}</style>
    </>
  );
}
