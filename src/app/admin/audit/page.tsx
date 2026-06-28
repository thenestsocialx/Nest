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
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return fmtDateTime(iso);
}

function fmtTimeFull(d: Date): string {
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function categoryOf(eventType: string): 'ally' | 'client' | 'system' | 'other' {
  if (eventType.startsWith('ally.'))   return 'ally';
  if (eventType.startsWith('client.')) return 'client';
  if (eventType.startsWith('system.')) return 'system';
  return 'other';
}

function verbOf(eventType: string): string {
  const dot = eventType.indexOf('.');
  return dot === -1 ? eventType : eventType.slice(dot + 1);
}

type Severity = 'critical' | 'warning' | 'positive' | 'info' | 'neutral';

function severityOf(eventType: string): Severity {
  switch (eventType) {
    case 'ally.rejected':
    case 'client.safety_flag_set':
      return 'critical';
    case 'ally.paused':
    case 'client.credits_adjusted':
      return 'warning';
    case 'ally.approved':
    case 'ally.activated':
    case 'ally.reactivated':
    case 'client.safety_flag_cleared':
      return 'positive';
    case 'system.zoho_connected':
    case 'system.zoho_sync':
      return 'info';
    default:
      return 'neutral';
  }
}

const CAT_COLORS: Record<string, { dot: string; label: string }> = {
  ally:   { dot: '#0d9488', label: 'Ally' },
  client: { dot: '#b8862a', label: 'Client' },
  system: { dot: '#2f4c3a', label: 'System' },
  other:  { dot: '#94A89E', label: 'Other' },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function EventBadge({ eventType }: { eventType: string }) {
  const cat = categoryOf(eventType);
  const { dot, label } = CAT_COLORS[cat];
  const verb = verbOf(eventType);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: dot, flexShrink: 0, display: 'inline-block' }} />
      <span style={{ fontSize: '0.75rem', color: dot, fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: '0.8125rem', color: 'var(--ns-ink)', fontWeight: 400 }}>{verb}</span>
    </span>
  );
}

function DetailPanel({ log }: { log: AuditLog }) {
  const hasChanges =
    (log.old_value && Object.keys(log.old_value).length > 0) ||
    (log.new_value && Object.keys(log.new_value).length > 0);
  const hasMetadata = log.metadata && Object.keys(log.metadata).length > 0;

  const [tab, setTab] = useState<'changes' | 'metadata'>(hasChanges ? 'changes' : 'metadata');

  function copyJson() {
    const text = JSON.stringify({
      id: log.id, event_type: log.event_type, actor_email: log.actor_email,
      target_label: log.target_label, action: log.action,
      old_value: log.old_value, new_value: log.new_value,
      metadata: log.metadata, created_at: log.created_at,
    }, null, 2);
    navigator.clipboard.writeText(text).catch(() => {});
  }

  const tabBtn = (t: 'changes' | 'metadata', label: string) => (
    <button
      onClick={() => setTab(t)}
      style={{
        padding: '3px 10px', borderRadius: 4, border: 'none', cursor: 'pointer',
        fontSize: '0.75rem', fontWeight: 600, fontFamily: 'inherit',
        background: tab === t ? 'var(--ns-forest)' : 'transparent',
        color: tab === t ? '#fff' : 'var(--ns-ink-4)',
        transition: 'background 0.15s, color 0.15s',
      }}
    >{label}</button>
  );

  return (
    <div style={{ padding: '12px 16px 16px' }}>
      {/* Tab bar + copy */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {hasChanges  && tabBtn('changes',  'Changes')}
          {hasMetadata && tabBtn('metadata', 'Metadata')}
        </div>
        <button className="ns-btn ns-btn--ghost ns-btn--sm" onClick={copyJson} style={{ fontSize: '0.72rem' }}>
          Copy JSON
        </button>
      </div>

      {/* Changes — side-by-side before/after */}
      {tab === 'changes' && hasChanges && (
        <div className="ns-audit-diff-grid">
          {log.old_value && Object.keys(log.old_value).length > 0 && (
            <div>
              <div className="ns-audit-diff-label ns-audit-diff-label--before">Before</div>
              <pre className="ns-audit-diff-pre ns-audit-diff-pre--before">
                {JSON.stringify(log.old_value, null, 2)}
              </pre>
            </div>
          )}
          {log.new_value && Object.keys(log.new_value).length > 0 && (
            <div>
              <div className="ns-audit-diff-label ns-audit-diff-label--after">After</div>
              <pre className="ns-audit-diff-pre ns-audit-diff-pre--after">
                {JSON.stringify(log.new_value, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Metadata */}
      {tab === 'metadata' && hasMetadata && (
        <div>
          <div className="ns-audit-diff-label" style={{ marginBottom: 4, color: 'var(--ns-ink-3)' }}>Metadata</div>
          <pre className="ns-audit-diff-pre">{JSON.stringify(log.metadata, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

// Clock icon — used for auto-refresh toggle (conveys "scheduled/timed")
function IconClock({ spinning }: { spinning?: boolean }) {
  return (
    <svg
      width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={spinning ? { animation: 'spin 3s linear infinite' } : undefined}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

// Rotate-CW icon — used for manual Refresh button (conveys "reload now")
function IconRotateCw({ spinning }: { spinning?: boolean }) {
  return (
    <svg
      width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={spinning ? { animation: 'spin 0.7s linear infinite' } : undefined}
    >
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <circle cx="7" cy="7" r="5" /><path d="M11 11l3 3" />
    </svg>
  );
}

function Pagination({
  page, totalPages, total, limit, onPage,
}: {
  page: number; totalPages: number; total: number; limit: number; onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    const lo = Math.max(2, page - 1);
    const hi = Math.min(totalPages - 1, page + 1);
    for (let i = lo; i <= hi; i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginTop: '1rem', flexWrap: 'wrap', gap: 8,
    }}>
      <span style={{ fontSize: '0.8125rem', color: 'var(--ns-ink-4)' }}>
        Showing {from.toLocaleString()}–{to.toLocaleString()} of {total.toLocaleString()} events
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button
          className="ns-btn ns-btn--ghost ns-btn--sm"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >← Prev</button>

        {pages.map((p, i) =>
          p === '...'
            ? <span key={`ell-${i}`} style={{ padding: '0 4px', color: 'var(--ns-ink-4)', fontSize: '0.8125rem' }}>…</span>
            : (
              <button
                key={p}
                onClick={() => onPage(p as number)}
                className={p === page ? 'ns-audit-page-btn ns-audit-page-btn--active' : 'ns-audit-page-btn'}
              >{p}</button>
            )
        )}

        <button
          className="ns-btn ns-btn--ghost ns-btn--sm"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
        >Next →</button>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

const LIMIT = 50;

const CAT_LABEL: Record<string, string> = {
  ally: 'Ally events', client: 'Client events', system: 'System events',
};

export default function AuditPage() {
  const [logs, setLogs]         = useState<AuditLog[]>([]);
  const [loading, setLoading]   = useState(true);
  const [settled, setSettled]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const [category,    setCategory]    = useState('');
  const [fromDate,    setFromDate]    = useState('');
  const [toDate,      setToDate]      = useState('');
  const [targetId,    setTargetId]    = useState('');
  const [targetLabel, setTargetLabel] = useState('');

  const [searchRaw, setSearchRaw] = useState('');
  const [search,    setSearch]    = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [autoRefresh,  setAutoRefresh]  = useState(true);
  const [lastFetched,  setLastFetched]  = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Read URL params on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams(window.location.search);
    if (p.get('category'))     setCategory(p.get('category')!);
    if (p.get('from'))         setFromDate(p.get('from')!);
    if (p.get('to'))           setToDate(p.get('to')!);
    if (p.get('target_id'))    setTargetId(p.get('target_id')!);
    if (p.get('target_label')) setTargetLabel(p.get('target_label')!);
    if (p.get('search'))       { setSearchRaw(p.get('search')!); setSearch(p.get('search')!); }
    if (p.get('page'))         setPage(Number(p.get('page')));
  }, []);

  // Sync current filter state to URL
  const syncUrl = useCallback((patch: Record<string, string>) => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams();
    const merged = {
      category, from: fromDate, to: toDate, search,
      target_id: targetId, target_label: targetLabel,
      page: String(page), ...patch,
    };
    Object.entries(merged).forEach(([k, v]) => {
      if (v && !(k === 'page' && v === '1')) p.set(k, v);
    });
    window.history.replaceState(null, '', p.toString() ? `?${p}` : window.location.pathname);
  }, [category, fromDate, toDate, search, targetId, targetLabel, page]);

  const fetchLogs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (search)   params.set('search', search);
      if (fromDate) params.set('from', fromDate);
      if (toDate)   params.set('to', toDate + 'T23:59:59');
      if (targetId) params.set('target_id', targetId);
      params.set('page', String(page));
      params.set('limit', String(LIMIT));

      const res = await fetch(`/api/v1/audit-logs?${params}`);
      if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to load logs');
      const json = await res.json();
      setLogs(json.logs ?? []);
      setTotal(json.total ?? 0);
      setLastFetched(new Date());
    } catch (err) {
      if (!silent) setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
      setSettled(true);
    }
  }, [category, search, fromDate, toDate, targetId, page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoRefresh) timerRef.current = setInterval(() => fetchLogs(true), 30_000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [autoRefresh, fetchLogs]);

  function handleSearchChange(value: string) {
    setSearchRaw(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
      syncUrl({ search: value, page: '1' });
    }, 350);
  }

  function clearSearch() {
    setSearchRaw('');
    setSearch('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setPage(1);
    syncUrl({ search: '', page: '1' });
  }

  function clearAll() {
    setCategory(''); setSearchRaw(''); setSearch('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setFromDate(''); setToDate(''); setTargetId(''); setTargetLabel(''); setPage(1);
    if (typeof window !== 'undefined')
      window.history.replaceState(null, '', window.location.pathname);
  }

  function handleCategoryChange(val: string) {
    setCategory(val); setPage(1);
    syncUrl({ category: val, page: '1' });
  }

  function handleFromChange(val: string) {
    setFromDate(val); setPage(1);
    syncUrl({ from: val, page: '1' });
  }

  function handleToChange(val: string) {
    setToDate(val); setPage(1);
    syncUrl({ to: val, page: '1' });
  }

  function handleTargetClick(log: AuditLog) {
    if (!log.target_id) return;
    const lbl = log.target_label ?? log.target_type ?? log.target_id;
    setTargetId(log.target_id); setTargetLabel(lbl); setPage(1);
    syncUrl({ target_id: log.target_id, target_label: lbl, page: '1' });
  }

  function removeTargetFilter() {
    setTargetId(''); setTargetLabel(''); setPage(1);
    syncUrl({ target_id: '', target_label: '', page: '1' });
  }

  function handlePageChange(p: number) {
    setPage(p);
    syncUrl({ page: String(p) });
  }

  function toggleExpanded(id: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const totalPages = Math.ceil(total / LIMIT);
  const hasFilters = !!(category || searchRaw || fromDate || toDate || targetId);

  return (
    <div className="ns-page-content" style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* ── Filter bar ─────────────────────────────────────────────────────── */}
      <div className="ns-audit-filter-bar">

        {/* Search */}
        <div className="ns-search-input-wrap" style={{ flex: 1, minWidth: 180 }}>
          <IconSearch />
          <input
            className="ns-search-input"
            type="text"
            placeholder="Search by actor or target…"
            value={searchRaw}
            onChange={e => handleSearchChange(e.target.value)}
          />
          {searchRaw && (
            <button className="ns-audit-clear-x" onClick={clearSearch} aria-label="Clear search">✕</button>
          )}
        </div>

        {/* Category */}
        <select
          className="ns-select"
          style={{ width: 'auto', flex: '0 0 auto', minWidth: 140 }}
          value={category}
          onChange={e => handleCategoryChange(e.target.value)}
        >
          <option value="">All categories</option>
          <option value="ally">Ally events</option>
          <option value="client">Client events</option>
          <option value="system">System events</option>
        </select>

        {/* Date range */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flex: '0 0 auto' }}>
          <input
            type="date" className="ns-select"
            value={fromDate} max={toDate || undefined}
            onChange={e => handleFromChange(e.target.value)}
            title="From date" style={{ width: 'auto' }}
          />
          <span style={{ color: 'var(--ns-ink-4)', fontSize: '0.75rem', flexShrink: 0 }}>–</span>
          <input
            type="date" className="ns-select"
            value={toDate} min={fromDate || undefined}
            onChange={e => handleToChange(e.target.value)}
            title="To date" style={{ width: 'auto' }}
          />
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: 'var(--ns-border-soft)', flexShrink: 0 }} />

        {/* Last refreshed */}
        {lastFetched && (
          <span style={{ fontSize: '0.72rem', color: 'var(--ns-ink-4)', whiteSpace: 'nowrap', flexShrink: 0 }}>
            Updated {fmtTimeFull(lastFetched)}
          </span>
        )}

        {/* Auto-refresh toggle */}
        <button
          onClick={() => setAutoRefresh(v => !v)}
          title={autoRefresh ? 'Auto-refresh active — click to pause' : 'Auto-refresh paused — click to enable'}
          className="ns-audit-autorefresh-btn"
          style={{ color: autoRefresh ? 'var(--ns-forest)' : 'var(--ns-ink-4)' }}
          aria-label="Toggle auto-refresh"
        >
          <IconClock spinning={autoRefresh} />
          <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>
            {autoRefresh ? 'Live' : 'Paused'}
          </span>
        </button>

        {/* Manual refresh */}
        <button
          className="ns-btn ns-btn--ghost ns-btn--sm"
          style={{ flex: '0 0 auto', minWidth: 90, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 5 }}
          onClick={() => fetchLogs()}
          disabled={loading}
          title="Refresh now"
        >
          <IconRotateCw spinning={loading} />
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {/* ── Active filter chips ─────────────────────────────────────────────── */}
      {hasFilters && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--ns-ink-4)', flexShrink: 0 }}>Active filters:</span>

          {category && (
            <button className="ns-audit-chip" onClick={() => handleCategoryChange('')}>
              {CAT_LABEL[category] ?? category} <span style={{ opacity: 0.6 }}>✕</span>
            </button>
          )}
          {searchRaw && (
            <button className="ns-audit-chip" onClick={clearSearch}>
              &ldquo;{searchRaw}&rdquo; <span style={{ opacity: 0.6 }}>✕</span>
            </button>
          )}
          {fromDate && (
            <button className="ns-audit-chip" onClick={() => handleFromChange('')}>
              From {fromDate} <span style={{ opacity: 0.6 }}>✕</span>
            </button>
          )}
          {toDate && (
            <button className="ns-audit-chip" onClick={() => handleToChange('')}>
              To {toDate} <span style={{ opacity: 0.6 }}>✕</span>
            </button>
          )}
          {targetId && (
            <button className="ns-audit-chip" onClick={removeTargetFilter}>
              {targetLabel || targetId} <span style={{ opacity: 0.6 }}>✕</span>
            </button>
          )}

          <button className="ns-btn ns-btn--ghost ns-btn--sm" onClick={clearAll}
            style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
            Clear all
          </button>
        </div>
      )}

      {/* ── Content ────────────────────────────────────────────────────────── */}
      {!settled ? (
        <div className="ns-card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--ns-ink-4)' }}>
          Loading audit logs…
        </div>
      ) : (
        <>
          {/* Result summary — stays fixed above the scroll area */}
          <div style={{ flexShrink: 0, minHeight: '1.25rem', marginBottom: '0.5rem' }}>
            {!error && (
              <div style={{ fontSize: '0.8125rem', color: 'var(--ns-ink-4)' }}>
                {total.toLocaleString()} event{total !== 1 ? 's' : ''}{hasFilters ? ' matching filters' : ''}
                {logs.length > 0 && (
                  <span style={{ marginLeft: 8 }}>
                    · most recent {fmtRelative(logs[0].created_at)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Scrollable table area — only this region scrolls */}
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>

          {/* Table wrapper dims on silent refetch */}
          <div style={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
            {error ? (
              <div className="ns-card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--ns-red)' }}>
                {error}
              </div>

            ) : logs.length === 0 ? (
              <div className="ns-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                <svg
                  width="40" height="40" viewBox="0 0 24 24" fill="none"
                  stroke="var(--ns-forest)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ display: 'block', margin: '0 auto 12px', opacity: 0.45 }}
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="8" y1="13" x2="16" y2="13" />
                  <line x1="8" y1="17" x2="12" y2="17" />
                </svg>
                <p style={{ fontWeight: 600, color: 'var(--ns-ink-2)', marginBottom: 4, fontSize: '0.9375rem' }}>
                  No audit events found{hasFilters ? ' matching your filters' : ' yet'}
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ns-ink-4)', marginBottom: hasFilters ? 16 : 0 }}>
                  {hasFilters
                    ? 'Try adjusting your filters, or clear them to see all events.'
                    : 'Events are recorded automatically when admin actions are performed.'}
                </p>
                {hasFilters && (
                  <button className="ns-btn ns-btn--ghost ns-btn--sm" onClick={clearAll}>
                    Clear all filters
                  </button>
                )}
              </div>

            ) : (
              <div className="ns-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="ns-table">
                  <thead>
                    <tr>
                      {/* Severity stripe column */}
                      <th style={{ width: 4, padding: 0, border: 0 }}></th>
                      <th style={{ width: 140 }}>When</th>
                      <th style={{ width: 190 }}>Event</th>
                      <th>Actor → Target</th>
                      <th>Details</th>
                      <th style={{ width: 36 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, idx) => {
                      const isOpen    = expanded.has(log.id);
                      const sev       = severityOf(log.event_type);
                      const isEven    = idx % 2 === 1;
                      const hasDetails =
                        (log.old_value && Object.keys(log.old_value).length > 0) ||
                        (log.new_value && Object.keys(log.new_value).length > 0) ||
                        (log.metadata  && Object.keys(log.metadata).length  > 0);

                      const rowClass = [
                        'ns-audit-row',
                        `ns-audit-row--${sev}`,
                        isEven ? 'ns-audit-row--even' : '',
                        isOpen ? 'ns-audit-row--open' : '',
                      ].filter(Boolean).join(' ');

                      return (
                        <React.Fragment key={log.id}>
                          <tr className={rowClass} style={{ verticalAlign: 'top' }}>

                            {/* Severity stripe */}
                            <td className="ns-audit-stripe" />

                            {/* When — sub-line only for recent events (fmtRelative already shows date for older ones) */}
                            <td title={new Date(log.created_at).toLocaleString('en-IN')}>
                              <div style={{ fontSize: '0.8125rem', color: 'var(--ns-ink)', fontWeight: 500 }}>
                                {fmtRelative(log.created_at)}
                              </div>
                              {Date.now() - new Date(log.created_at).getTime() < 86_400_000 && (
                                <div style={{ fontSize: '0.72rem', color: 'var(--ns-ink-4)', marginTop: 1 }}>
                                  {fmtDateTime(log.created_at)}
                                </div>
                              )}
                            </td>

                            {/* Event badge */}
                            <td><EventBadge eventType={log.event_type} /></td>

                            {/* Actor → Target */}
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', lineHeight: 1.4 }}>
                                {/* Actor */}
                                {log.actor_email ? (
                                  <span
                                    style={{
                                      fontSize: '0.8125rem', color: 'var(--ns-ink-2)',
                                      maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap', display: 'inline-block',
                                    }}
                                    title={log.actor_email}
                                  >{log.actor_email}</span>
                                ) : (
                                  <span className="ns-badge ns-badge--forest" style={{ fontSize: '0.7rem' }}>System</span>
                                )}

                                {/* Arrow + target */}
                                {(log.target_label || log.target_type) && (
                                  <>
                                    <span style={{ color: 'var(--ns-ink-4)', fontSize: '0.75rem', flexShrink: 0 }}>→</span>
                                    <span>
                                      {log.target_label && (
                                        <span
                                          onClick={() => handleTargetClick(log)}
                                          title={log.target_id ? `Filter by ${log.target_label}` : undefined}
                                          style={{
                                            fontSize: '0.8125rem', fontWeight: 500,
                                            color: log.target_id ? 'var(--ns-forest)' : 'var(--ns-ink)',
                                            cursor: log.target_id ? 'pointer' : 'default',
                                            textDecoration: log.target_id ? 'underline' : 'none',
                                            textDecorationColor: 'rgba(47,76,58,0.4)',
                                            textUnderlineOffset: 2,
                                          }}
                                        >{log.target_label}</span>
                                      )}
                                      {log.target_type && (
                                        <div style={{ fontSize: '0.7rem', color: 'var(--ns-ink-4)', marginTop: 1 }}>
                                          {log.target_type}
                                        </div>
                                      )}
                                    </span>
                                  </>
                                )}

                                {!log.target_label && !log.target_type && !log.actor_email && (
                                  <span style={{ color: 'var(--ns-ink-4)' }}>—</span>
                                )}
                              </div>

                              {log.actor_role && log.actor_role !== 'admin' && (
                                <div style={{ fontSize: '0.7rem', color: 'var(--ns-ink-4)', marginTop: 2 }}>
                                  {log.actor_role}
                                </div>
                              )}
                            </td>

                            {/* Details (truncated to 1 line) */}
                            <td style={{ maxWidth: 220 }}>
                              <div
                                title={log.action}
                                style={{
                                  fontSize: '0.8125rem', color: 'var(--ns-ink)',
                                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }}
                              >{log.action}</div>
                            </td>

                            {/* Expand toggle */}
                            <td>
                              {hasDetails && (
                                <button
                                  onClick={() => toggleExpanded(log.id)}
                                  title={isOpen ? 'Collapse' : 'Show details'}
                                  style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: isOpen ? 'var(--ns-forest)' : 'var(--ns-ink-4)',
                                    padding: '2px 4px', borderRadius: 4,
                                    display: 'flex', alignItems: 'center',
                                    transition: 'transform 0.15s, color 0.15s',
                                    transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                                  }}
                                >
                                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 3 11 8 6 13" />
                                  </svg>
                                </button>
                              )}
                            </td>
                          </tr>

                          {/* Expanded detail row */}
                          {isOpen && hasDetails && (
                            <tr className="ns-audit-detail-row">
                              <td colSpan={6} style={{ padding: 0 }}>
                                <DetailPanel log={log} />
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

          </div>{/* end scrollable area */}

          {/* Pagination — stays fixed below the scroll area */}
          {!error && (
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={LIMIT}
              onPage={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
