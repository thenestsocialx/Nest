'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { ClientRow, ClientPlan, ClientSubscriptionStatus } from '@/types/client';

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtRelative(iso: string | null | undefined): string {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30)  return `${days}d ago`;
  return fmtDate(iso);
}

function getInitials(name: string | null, email: string | null | undefined): string {
  if (name) return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  if (email) return email[0].toUpperCase();
  return '?';
}

function PlanBadge({ plan }: { plan: ClientPlan }) {
  const cls: Record<ClientPlan, string> = {
    free:    'ns-badge ns-badge--gray',
    core:    'ns-badge ns-badge--forest',
    premium: 'ns-badge ns-badge--amber',
  };
  return <span className={cls[plan]}>{plan.charAt(0).toUpperCase() + plan.slice(1)}</span>;
}

function StatusBadge({ status, flagged }: { status: ClientSubscriptionStatus; flagged: boolean }) {
  if (flagged)                         return <span className="ns-badge ns-badge--red">Safety flag</span>;
  if (status === 'payment_failed')     return <span className="ns-badge ns-badge--amber">Payment failed</span>;
  if (status === 'cancelled')          return <span className="ns-badge ns-badge--gray">Cancelled</span>;
  return <span className="ns-badge ns-badge--green">Active</span>;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ClientsPage() {
  const [clients, setClients]           = useState<ClientRow[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [total, setTotal]               = useState(0);
  const [page, setPage]                 = useState(1);
  const LIMIT = 50;

  /*
   * settled = true once the FIRST fetch completes (success or error).
   * After that, we NEVER show the full loading card again — we keep the
   * content area mounted and just dim it. This is the key to preventing
   * layout shift while the user types.
   */
  const [settled, setSettled]           = useState(false);

  /*
   * Two search states:
   *   searchRaw  — bound directly to the <input> value, updates on every keystroke
   *   search     — debounced (350 ms), used in the API call / useCallback deps
   *
   * This means typing does NOT fire an API call on every character.
   */
  const [searchRaw, setSearchRaw]       = useState('');
  const [search, setSearch]             = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [planFilter, setPlanFilter]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ── Debounce: update `search` 350 ms after user stops typing ─────────────
  function handleSearchChange(value: string) {
    setSearchRaw(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
    }, 350);
  }

  function clearSearch() {
    setSearchRaw('');
    setSearch('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setPage(1);
  }

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search)       params.set('search', search);
      if (planFilter)   params.set('plan', planFilter);
      if (statusFilter === 'safety_flag') params.set('flag', 'true');
      else if (statusFilter) params.set('status', statusFilter);
      params.set('page', String(page));
      params.set('limit', String(LIMIT));

      const res = await fetch(`/api/v1/clients?${params}`);
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to load clients');
      const json = await res.json();
      setClients(json.clients ?? []);
      setTotal(json.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
      setSettled(true); // first fetch done — layout is now stable forever
    }
  }, [search, planFilter, statusFilter, page]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  // ── Actions ───────────────────────────────────────────────────────────────
  async function toggleSafetyFlag(client: ClientRow) {
    const newFlag = !client.safety_flag;
    // eslint-disable-next-line no-alert
    const reason  = newFlag ? window.prompt('Reason for safety flag (optional):') : null;
    setActionLoading(client.id);
    try {
      const body: Record<string, unknown> = { safety_flag: newFlag };
      if (reason) body.safety_flag_reason = reason;
      const res = await fetch(`/api/v1/clients/${client.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed');
      setClients(prev => prev.map(c =>
        c.id === client.id ? { ...c, safety_flag: newFlag, safety_flag_reason: reason ?? null } : c,
      ));
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(null);
    }
  }

  async function changePlan(client: ClientRow, newPlan: ClientPlan) {
    setActionLoading(`plan-${client.id}`);
    try {
      const res = await fetch(`/api/v1/clients/${client.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: newPlan }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed');
      setClients(prev => prev.map(c => c.id === client.id ? { ...c, plan: newPlan } : c));
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(null);
    }
  }

  const flaggedCount = clients.filter(c => c.safety_flag).length;
  const failedCount  = clients.filter(c => c.subscription_status === 'payment_failed').length;
  const totalPages   = Math.ceil(total / LIMIT);
  const hasActiveFilters = !!(planFilter || statusFilter || searchRaw);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="ns-page-content">

      {/* ── Alert banner ──────────────────────────────────────────────────── */}
      {(flaggedCount > 0 || failedCount > 0) && (
        <div className="ns-flagged">
          <span className="ns-flagged__icon">⚠️</span>
          <span className="ns-flagged__text">
            {[
              flaggedCount > 0 && `${flaggedCount} user${flaggedCount > 1 ? 's' : ''} flagged for safety review`,
              failedCount  > 0 && `${failedCount} user${failedCount > 1 ? 's' : ''} with payment failure`,
            ].filter(Boolean).join(' · ')}
          </span>
          <button
            className="ns-btn ns-btn--danger ns-btn--sm"
            onClick={() => { setStatusFilter(flaggedCount > 0 ? 'safety_flag' : 'payment_failed'); setPage(1); }}
          >
            Review
          </button>
        </div>
      )}

      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <div className="ns-search-row" style={{ alignItems: 'center' }}>
        {/* Search — occupies all remaining space via flex:1 from .ns-search-input-wrap */}
        <div className="ns-search-input-wrap">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/>
          </svg>
          <input
            className="ns-search-input"
            type="text"
            placeholder="Search by name or email…"
            value={searchRaw}
            onChange={e => handleSearchChange(e.target.value)}
          />
          {searchRaw && (
            <button
              onClick={clearSearch}
              style={{
                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--ns-ink-4)', fontSize: 12, lineHeight: 1, padding: '2px 4px',
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Plan filter — width:auto overrides .ns-select's width:100% */}
        <select
          className="ns-select"
          style={{ width: 'auto', flex: '0 0 auto', minWidth: 120 }}
          value={planFilter}
          onChange={e => { setPlanFilter(e.target.value); setPage(1); }}
        >
          <option value="">All plans</option>
          <option value="free">Free</option>
          <option value="core">Core</option>
          <option value="premium">Premium</option>
        </select>

        {/* Status filter */}
        <select
          className="ns-select"
          style={{ width: 'auto', flex: '0 0 auto', minWidth: 140 }}
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="payment_failed">Payment failed</option>
          <option value="safety_flag">Safety flag</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {/* Always rendered — visibility:hidden keeps the row stable even when no filters */}
        <button
          className="ns-btn ns-btn--ghost ns-btn--sm"
          style={{ flex: '0 0 auto', visibility: hasActiveFilters ? 'visible' : 'hidden' }}
          onClick={() => { setPlanFilter(''); setStatusFilter(''); clearSearch(); }}
        >
          Clear filters
        </button>
      </div>

      {/* ── Content area ──────────────────────────────────────────────────────
          LAYOUT RULE: once `settled` is true, this wrapper never unmounts.
          A full loading card is only shown before the very first fetch.
          After that, refetches dim the content (opacity) — no structural change.
      ─────────────────────────────────────────────────────────────────────── */}

      {!settled ? (
        /* First-ever load: full placeholder is fine because nothing is below it yet */
        <div className="ns-card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--ns-ink-4)' }}>
          Loading clients…
        </div>
      ) : (
        /* Stable wrapper — dims during refetch but NEVER unmounts */
        <div style={{ position: 'relative' }}>
          {/* "Updating" badge — absolutely positioned, takes up zero layout space */}
          {loading && (
            <div style={{
              position: 'absolute', top: 10, right: 12, zIndex: 10,
              fontSize: '0.72rem', color: 'var(--ns-ink-4)',
              background: '#fff', padding: '3px 10px',
              borderRadius: 20, border: '1px solid var(--ns-border-soft)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              Updating…
            </div>
          )}

          <div style={{
            opacity: loading ? 0.5 : 1,
            transition: 'opacity 0.15s ease',
            pointerEvents: loading ? 'none' : 'auto',
          }}>
            {error ? (
              <div className="ns-card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--ns-red)' }}>
                {error}
              </div>
            ) : clients.length === 0 ? (
              <div className="ns-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--ns-ink-4)' }}>
                <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔍</p>
                <p>No clients found{hasActiveFilters ? ' matching your filters' : ' yet'}.</p>
              </div>
            ) : (
              <div className="ns-card" style={{ padding: 0, overflow: 'hidden' }}>
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
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map(client => {
                      const displayName   = client.full_name ?? client.display_name ?? 'Anonymous';
                      const isFlagLoading = actionLoading === client.id;
                      const isPlanLoading = actionLoading === `plan-${client.id}`;
                      return (
                        <tr
                          key={client.id}
                          style={client.safety_flag ? { background: 'var(--ns-red-light)' } : {}}
                        >
                          {/* User */}
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                              <div style={{
                                width: 32, height: 32, borderRadius: '50%',
                                background: 'var(--ns-forest)', color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.75rem', fontWeight: 600, flexShrink: 0, overflow: 'hidden',
                              }}>
                                {client.avatar_url
                                  ? <img src={client.avatar_url} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  : getInitials(client.full_name, client.email)
                                }
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--ns-ink)' }}>{displayName}</div>
                                {client.email && (
                                  <div style={{ fontSize: '0.75rem', color: 'var(--ns-ink-4)', marginTop: 1 }}>{client.email}</div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Plan inline dropdown */}
                          <td>
                            <select
                              value={client.plan}
                              disabled={isPlanLoading}
                              onChange={e => changePlan(client, e.target.value as ClientPlan)}
                              style={{
                                border: '1px solid var(--ns-border-soft)',
                                borderRadius: 'var(--ns-radius-sm)',
                                padding: '0.25rem 0.5rem',
                                fontSize: '0.75rem',
                                background: 'transparent',
                                cursor: isPlanLoading ? 'wait' : 'pointer',
                              }}
                              title="Change plan"
                            >
                              <option value="free">Free</option>
                              <option value="core">Core</option>
                              <option value="premium">Premium</option>
                            </select>
                          </td>

                          <td style={{ color: 'var(--ns-ink-4)', fontSize: '0.8125rem' }}>{fmtDate(client.created_at)}</td>
                          <td style={{ color: 'var(--ns-ink-4)', fontSize: '0.8125rem' }}>{fmtRelative(client.last_active_at)}</td>
                          <td>{client.nila_message_count.toLocaleString()}</td>
                          <td>{client.credits.toLocaleString()}</td>

                          <td>
                            <StatusBadge status={client.subscription_status} flagged={client.safety_flag} />
                          </td>

                          <td>
                            <button
                              className="ns-btn ns-btn--sm"
                              style={client.safety_flag
                                ? { background: 'transparent', border: '1px solid var(--ns-border-soft)', color: 'var(--ns-ink-4)' }
                                : { background: 'transparent', border: '1px solid rgba(196,75,58,0.3)', color: 'var(--ns-red)' }
                              }
                              disabled={isFlagLoading}
                              onClick={() => toggleSafetyFlag(client)}
                              title={client.safety_flag ? 'Clear safety flag' : 'Set safety flag'}
                            >
                              {isFlagLoading ? '…' : client.safety_flag ? 'Clear flag' : '🚩 Flag'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Pagination ──────────────────────────────────────────────────────── */}
      {settled && !error && total > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--ns-ink-4)' }}>
            {total.toLocaleString()} client{total !== 1 ? 's' : ''} total
          </span>
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                className="ns-btn ns-btn--ghost ns-btn--sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                ← Prev
              </button>
              <span style={{ fontSize: '0.8125rem', color: 'var(--ns-ink-4)' }}>
                {page} / {totalPages}
              </span>
              <button
                className="ns-btn ns-btn--ghost ns-btn--sm"
                disabled={page >= totalPages || loading}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Privacy notice ────────────────────────────────────────────────── */}
      <p style={{ fontSize: '0.75rem', color: 'var(--ns-ink-4)', marginTop: '1.5rem', display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
        🔒 Message content is end-to-end encrypted and is not accessible from this dashboard.
        Only metadata (message count, timestamps) is visible.
      </p>
    </div>
  );
}
