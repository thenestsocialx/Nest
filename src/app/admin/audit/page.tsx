'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import type { AuditLog } from '@/types/audit';

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) +
    ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function fmtRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return fmtDateTime(iso);
}

/** Derive category from event_type prefix, e.g. "ally.approved" → "ally" */
function categoryOf(eventType: string): 'ally' | 'client' | 'system' | 'other' {
  if (eventType.startsWith('ally.'))   return 'ally';
  if (eventType.startsWith('client.')) return 'client';
  if (eventType.startsWith('system.')) return 'system';
  return 'other';
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  ally:   { bg: 'rgba(20,184,166,0.12)', text: '#0d9488' },
  client: { bg: 'rgba(196,154,90,0.15)', text: '#b8862a' },
  system: { bg: 'rgba(47,76,58,0.12)',   text: '#2f4c3a' },
  other:  { bg: 'rgba(100,100,100,0.1)', text: '#555' },
};

function EventBadge({ eventType }: { eventType: string }) {
  const cat    = categoryOf(eventType);
  const colors = CATEGORY_COLORS[cat];
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 999,
      fontSize: '0.7rem',
      fontWeight: 600,
      letterSpacing: '0.02em',
      background: colors.bg,
      color: colors.text,
      whiteSpace: 'nowrap',
    }}>
      {eventType}
    </span>
  );
}

function JsonDiff({ label, value }: { label: string; value: Record<string, unknown> | null }) {
  if (!value || Object.keys(value).length === 0) return null;
  return (
    <div style={{ marginTop: '0.5rem' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--ns-ink-4)', marginBottom: 2 }}>{label}</div>
      <pre style={{
        margin: 0, fontSize: '0.7rem', background: 'var(--ns-cream)',
        border: '1px solid var(--ns-border-soft)', borderRadius: 4,
        padding: '0.5rem', overflowX: 'auto', color: 'var(--ns-ink)',
      }}>
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

const LIMIT = 50;

export default function AuditPage() {
  const [logs, setLogs]               = useState<AuditLog[]>([]);
  const [loading, setLoading]         = useState(true);
  // `settled` goes true after the very first fetch completes and never goes false.
  // This prevents the loading card from flashing back on every refetch.
  const [settled, setSettled]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [total, setTotal]             = useState(0);
  const [page, setPage]               = useState(1);
  const [expanded, setExpanded]       = useState<Set<string>>(new Set());

  // Filters — static dropdowns / date pickers
  const [category, setCategory]       = useState('');
  const [fromDate, setFromDate]       = useState('');
  const [toDate, setToDate]           = useState('');

  // Search — debounced: `searchRaw` drives the input; `search` drives the API call
  const [searchRaw, setSearchRaw]     = useState('');
  const [search, setSearch]           = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-refresh
  const [autoRefresh, setAutoRefresh] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLogs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (search)   params.set('search', search);
      if (fromDate) params.set('from', fromDate);
      if (toDate)   params.set('to', toDate + 'T23:59:59');
      params.set('page', String(page));
      params.set('limit', String(LIMIT));

      const res = await fetch(`/api/v1/audit-logs?${params}`);
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to load logs');
      const json = await res.json();
      setLogs(json.logs ?? []);
      setTotal(json.total ?? 0);
    } catch (err) {
      if (!silent) setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
      setSettled(true); // never goes back to false — keeps layout stable on refetch
    }
  }, [category, search, fromDate, toDate, page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // Auto-refresh every 30s
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoRefresh) {
      timerRef.current = setInterval(() => fetchLogs(true), 30_000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [autoRefresh, fetchLogs]);

  /** Update search input immediately; debounce the API param by 350ms */
  function handleSearchChange(value: string) {
    setSearchRaw(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
    }, 350);
  }

  /** Clear the search field — also cancels any pending debounce */
  function clearSearch() {
    setSearchRaw('');
    setSearch('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setPage(1);
  }

  function toggleExpanded(id: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const totalPages    = Math.ceil(total / LIMIT);
  const hasFilters    = !!(category || searchRaw || fromDate || toDate);

  return (
    <div className="ns-page-content">

      {/*
        ── Filters ─────────────────────────────────────────────────────────────
        Split into TWO stable rows so no item ever causes a reflow:

        Row 1 (fixed controls — never change width):
          [Event type ▾]  [From date]  to  [To date]  [Clear all — visibility:hidden when inactive]

        Row 2 (search + actions — always same set of elements):
          [🔍 Search input ── flex:1 ──]  [Auto-refresh ☐]  [↺ Refresh — fixed minWidth]

        Key rules:
          • "Clear all" uses visibility:hidden (not conditional render) → no reflow
          • Refresh button has a fixed minWidth → text change '↺ Refresh' ↔ '…'
            never shifts its neighbours
          • All selects/date inputs override .ns-select's width:100% with width:auto
      */}

      {/* Row 1 — static filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <select
          className="ns-select"
          style={{ width: 'auto', flex: '0 0 auto', minWidth: 148 }}
          value={category}
          onChange={e => { setCategory(e.target.value); setPage(1); }}
        >
          <option value="">All event types</option>
          <option value="ally">Ally events</option>
          <option value="client">Client events</option>
          <option value="system">System events</option>
        </select>

        <input
          type="date"
          className="ns-select"
          value={fromDate}
          max={toDate || undefined}
          onChange={e => { setFromDate(e.target.value); setPage(1); }}
          title="From date"
          style={{ width: 'auto', flex: '0 0 auto' }}
        />
        <span style={{ color: 'var(--ns-ink-4)', fontSize: '0.8125rem', flexShrink: 0 }}>to</span>
        <input
          type="date"
          className="ns-select"
          value={toDate}
          min={fromDate || undefined}
          onChange={e => { setToDate(e.target.value); setPage(1); }}
          title="To date"
          style={{ width: 'auto', flex: '0 0 auto' }}
        />

        {/* Always in DOM; invisible when nothing to clear → zero layout impact */}
        <button
          className="ns-btn ns-btn--ghost ns-btn--sm"
          style={{ flex: '0 0 auto', visibility: hasFilters ? 'visible' : 'hidden' }}
          onClick={() => {
            setCategory('');
            setSearchRaw('');
            setSearch('');
            if (debounceRef.current) clearTimeout(debounceRef.current);
            setFromDate('');
            setToDate('');
            setPage(1);
          }}
        >
          Clear all
        </button>
      </div>

      {/* Row 2 — search + actions (layout never changes) */}
      <div className="ns-search-row" style={{ marginBottom: 16 }}>
        {/* Search input — flex:1 via .ns-search-input-wrap */}
        <div className="ns-search-input-wrap">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/>
          </svg>
          <input
            className="ns-search-input"
            type="text"
            placeholder="Search by actor or target…"
            value={searchRaw}
            onChange={e => handleSearchChange(e.target.value)}
          />
          {/* ✕ inside the input wrapper — does NOT affect row width */}
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

        {/* Auto-refresh — flex:0 0 auto, always rendered */}
        <label style={{
          display: 'flex', alignItems: 'center', gap: '0.375rem',
          fontSize: '0.8125rem', color: 'var(--ns-ink-4)',
          cursor: 'pointer', whiteSpace: 'nowrap', flex: '0 0 auto',
        }}>
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={e => setAutoRefresh(e.target.checked)}
          />
          Auto-refresh
        </label>

        {/*
          Refresh button — minWidth locks its size so '↺ Refresh' ↔ '…'
          never shifts the auto-refresh label.
        */}
        <button
          className="ns-btn ns-btn--ghost ns-btn--sm"
          style={{ flex: '0 0 auto', minWidth: 94, justifyContent: 'center' }}
          onClick={() => fetchLogs()}
          disabled={loading}
          title="Refresh now"
        >
          {loading ? '…' : '↺ Refresh'}
        </button>
      </div>

      {/*
        ── Content area ─────────────────────────────────────────────────────────
        • `!settled` → show initial loading card (full-height placeholder)
        • `settled`  → keep the stable wrapper permanently mounted;
                       dim it while refetching (opacity transition, no layout shift)
        • "Updating…" badge is absolutely positioned (zero layout impact)
      */}

      {!settled ? (
        <div className="ns-card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--ns-ink-4)' }}>
          Loading audit logs…
        </div>
      ) : (
        <>
          {/* Count row — always reserves space once settled */}
          <div style={{ minHeight: '1.5rem', marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--ns-ink-4)' }}>
              {!error && (
                <>
                  {total.toLocaleString()} event{total !== 1 ? 's' : ''}
                  {hasFilters && ' matching filters'}
                </>
              )}
            </div>
          </div>

          {/* Stable content wrapper — dims on refetch, no mount/unmount */}
          <div style={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
            {error ? (
              <div className="ns-card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--ns-red)' }}>
                {error}
              </div>
            ) : logs.length === 0 ? (
              <div className="ns-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--ns-ink-4)' }}>
                <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📋</p>
                <p>No audit events found{hasFilters ? ' matching your filters' : ' yet'}.</p>
                <p style={{ fontSize: '0.8125rem', marginTop: '0.5rem' }}>
                  Events are recorded automatically when admin actions are performed.
                </p>
              </div>
            ) : (
              <div className="ns-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="ns-table">
                  <thead>
                    <tr>
                      <th style={{ width: 120 }}>When</th>
                      <th style={{ width: 200 }}>Event</th>
                      <th>Actor</th>
                      <th>Target</th>
                      <th>Action</th>
                      <th style={{ width: 48 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => {
                      const isOpen = expanded.has(log.id);
                      const hasDetails =
                        (log.old_value && Object.keys(log.old_value).length > 0) ||
                        (log.new_value && Object.keys(log.new_value).length > 0) ||
                        (log.metadata  && Object.keys(log.metadata).length  > 0);
                      return (
                        <React.Fragment key={log.id}>
                          <tr style={{ verticalAlign: 'top' }}>
                            {/* When */}
                            <td title={new Date(log.created_at).toLocaleString('en-IN')}>
                              <div style={{ fontSize: '0.8125rem', color: 'var(--ns-ink)' }}>
                                {fmtRelative(log.created_at)}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--ns-ink-4)', marginTop: 1 }}>
                                {fmtDateTime(log.created_at)}
                              </div>
                            </td>

                            {/* Event type badge */}
                            <td><EventBadge eventType={log.event_type} /></td>

                            {/* Actor */}
                            <td>
                              <div style={{ fontSize: '0.8125rem' }}>
                                {log.actor_email ?? <span style={{ color: 'var(--ns-ink-4)' }}>System</span>}
                              </div>
                              {log.actor_role && log.actor_role !== 'admin' && (
                                <div style={{ fontSize: '0.7rem', color: 'var(--ns-ink-4)' }}>{log.actor_role}</div>
                              )}
                            </td>

                            {/* Target */}
                            <td>
                              {log.target_label && (
                                <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{log.target_label}</div>
                              )}
                              {log.target_type && (
                                <div style={{ fontSize: '0.7rem', color: 'var(--ns-ink-4)' }}>{log.target_type}</div>
                              )}
                              {!log.target_label && !log.target_type && (
                                <span style={{ color: 'var(--ns-ink-4)' }}>—</span>
                              )}
                            </td>

                            {/* Action */}
                            <td style={{ fontSize: '0.8125rem', color: 'var(--ns-ink)' }}>
                              {log.action}
                            </td>

                            {/* Expand toggle */}
                            <td>
                              {hasDetails && (
                                <button
                                  onClick={() => toggleExpanded(log.id)}
                                  style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'var(--ns-ink-4)', fontSize: '0.875rem', padding: '0 4px',
                                    transition: 'transform 0.15s',
                                    transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                                  }}
                                  title="Show details"
                                >
                                  ›
                                </button>
                              )}
                            </td>
                          </tr>

                          {/* Expanded detail row */}
                          {isOpen && hasDetails && (
                            <tr style={{ background: 'var(--ns-cream)' }}>
                              <td colSpan={6} style={{ padding: '0.75rem 1rem 1rem' }}>
                                <JsonDiff label="Before"   value={log.old_value} />
                                <JsonDiff label="After"    value={log.new_value} />
                                <JsonDiff label="Metadata" value={log.metadata} />
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Pagination ──────────────────────────────────────────────── */}
          {!error && totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
              <button
                className="ns-btn ns-btn--ghost ns-btn--sm"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                ← Prev
              </button>
              <span style={{ fontSize: '0.8125rem', color: 'var(--ns-ink-4)' }}>
                Page {page} of {totalPages}
              </span>
              <button
                className="ns-btn ns-btn--ghost ns-btn--sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
