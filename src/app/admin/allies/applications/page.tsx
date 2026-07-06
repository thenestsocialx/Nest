'use client';

import { useEffect, useState, useCallback } from 'react';

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

interface Toast { type: 'success' | 'error'; message: string }

// ── Helpers ───────────────────────────────────────────────────────────────────
function initials(name: string | null): string {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function ApplicationsPage() {
  const [allies, setAllies]       = useState<AllyListItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [toast, setToast]         = useState<Toast | null>(null);
  const [busy, setBusy]           = useState<Record<string, boolean>>({});
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [embedUrlWarning, setEmbedUrlWarning] = useState<{ id: string; name: string; message: string } | null>(null);
  const [syncingUrl, setSyncingUrl] = useState(false);

  const showToast = useCallback((type: Toast['type'], message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  }, []);

  // ── Load all pending allies (submitted + approved) ──────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/v1/allies?status=submitted,approved');
      const data = await res.json() as { allies?: AllyListItem[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Failed to load');
      setAllies(data.allies ?? []);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Load failed');
      setAllies([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { void load(); }, [load]);

  // ── Actions ──────────────────────────────────────────────────────────────────
  const setAllyBusy = (id: string, val: boolean) =>
    setBusy(prev => ({ ...prev, [id]: val }));

  async function handleApproveAndActivate(id: string, name: string | null) {
    setAllyBusy(id, true);
    try {
      const res  = await fetch(`/api/v1/allies/${id}/approve-and-activate`, { method: 'POST' });
      const data = await res.json() as {
        ok?: boolean; error?: string; warning?: string; step?: string; embed_url_warning?: string;
      };
      if (!res.ok) {
        const detail = data.step ? ` (failed at: ${data.step} step)` : '';
        throw new Error((data.error ?? 'Action failed') + detail);
      }
      if (data.warning) {
        showToast('error', `Partial success — ${data.warning}`);
      } else if (data.embed_url_warning) {
        showToast('success', `✓ ${name ?? 'Ally'} is now live`);
        setEmbedUrlWarning({ id, name: name ?? 'This ally', message: data.embed_url_warning });
      } else {
        showToast('success', `✓ ${name ?? 'Ally'} is now live — profile and services created in Zoho`);
      }
      void load();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Action failed');
    } finally {
      setAllyBusy(id, false);
    }
  }

  async function handleSyncBookingUrl(id: string) {
    setSyncingUrl(true);
    try {
      const res  = await fetch(`/api/v1/allies/${id}/refresh-booking-url`, { method: 'POST' });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Sync failed');
      showToast('success', 'Booking URL synced successfully');
      setEmbedUrlWarning(null);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncingUrl(false);
    }
  }

  async function handleReject(id: string, name: string | null) {
    setAllyBusy(id, true);
    try {
      const res  = await fetch(`/api/v1/allies/${id}/reject`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ reason: rejectReason.trim() || undefined }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Reject failed');
      showToast('success', `${name ?? 'Ally'} application rejected`);
      setRejectTarget(null);
      setRejectReason('');
      void load();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Reject failed');
    } finally {
      setAllyBusy(id, false);
    }
  }

  const pendingCount  = allies.filter(a => a.onboarding_status === 'submitted').length;
  const recoveryCount = allies.filter(a => a.onboarding_status === 'approved').length;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Toast */}
      {toast && (
        <div className={`ns-toast ns-toast--${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--ns-font-serif)',
              fontSize: 22,
              fontWeight: 400,
              color: 'var(--ns-ink)',
              margin: 0,
              lineHeight: 1.25,
            }}
          >
            Ally Applications
          </h1>
          <p style={{ fontSize: 13, color: 'var(--ns-ink-4)', margin: '4px 0 0', lineHeight: 1.4 }}>
            Review submissions and make allies live in a single step.
          </p>
        </div>

        <a
          href="/admin/allies/onboard"
          className="ns-btn ns-btn--primary"
          style={{ flexShrink: 0 }}
        >
          {/* Plus icon */}
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
            <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
          Onboard New Ally
        </a>
      </div>

      {/* ── Info notice ──────────────────────────────────────────────────────── */}
      <div className="ns-notice" style={{ marginBottom: 20 }}>
        {/* Info circle icon */}
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="none"
          style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true"
        >
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" />
          <path d="M7 6.5v3M7 4v.75" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <span style={{ fontSize: 12, lineHeight: 1.5 }}>
          <strong>One-step approval:</strong>{' '}
          Approving an application instantly creates the ally's Zoho profile and bookable
          services — they go live without a separate activation step.
          {recoveryCount > 0 && (
            <span style={{ marginLeft: 8, color: 'var(--ns-amber)', fontWeight: 500 }}>
              {recoveryCount} {recoveryCount === 1 ? 'ally has' : 'allies have'} a Zoho profile
              already — clicking &ldquo;Go Live&rdquo; will create their services and activate them.
            </span>
          )}
        </span>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      {loading ? (
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '40px 0', color: 'var(--ns-ink-4)', fontSize: 13,
          }}
        >
          <div className="ob-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
          Loading applications…
        </div>

      ) : allies.length === 0 ? (
        /* ── Empty state ── */
        <div
          className="ns-card"
          style={{ textAlign: 'center', padding: '56px 24px', color: 'var(--ns-ink-4)' }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
          <div
            style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, color: 'var(--ns-ink)' }}
          >
            No pending applications
          </div>
          <p style={{ fontSize: 13, maxWidth: 340, margin: '0 auto', lineHeight: 1.55 }}>
            New submissions appear here once allies complete onboarding and submit for review.
          </p>
          <a
            href="/admin/allies/onboard"
            className="ns-btn ns-btn--secondary"
            style={{ marginTop: 20, display: 'inline-flex' }}
          >
            Onboard an ally manually
          </a>
        </div>

      ) : (
        /* ── Table ── */
        <div className="ns-card" style={{ padding: 0, overflow: 'hidden' }}>

          {/* Summary bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 16px',
              borderBottom: '1px solid var(--ns-border-soft)',
              background: 'var(--ns-cream)',
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--ns-ink-4)', flex: 1 }}>
              <span style={{ fontWeight: 600, color: 'var(--ns-ink)' }}>
                {allies.length}
              </span>{' '}
              {allies.length === 1 ? 'application' : 'applications'}
            </span>
            {pendingCount > 0 && (
              <span className="ns-badge ns-badge--amber">
                <span className="ns-badge__dot" />
                {pendingCount} pending review
              </span>
            )}
            {recoveryCount > 0 && (
              <span className="ns-badge ns-badge--forest">
                <span className="ns-badge__dot" />
                {recoveryCount} awaiting activation
              </span>
            )}
          </div>

          <div className="ns-table-wrap">
            <table className="ns-table">
              <thead>
                <tr>
                  <th>Ally</th>
                  <th>Role</th>
                  <th>Specialties</th>
                  <th>Sessions offered</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allies.map(ally => {
                  const isBusy     = !!busy[ally.id];
                  const isRecovery = ally.onboarding_status === 'approved';

                  return (
                    <tr key={ally.id}>

                      {/* Ally avatar + name */}
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
                              className="ns-ally-avatar"
                              style={{ width: 34, height: 34, fontSize: 11, flexShrink: 0 }}
                            >
                              {initials(ally.full_name)}
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 13 }}>
                              {ally.full_name ?? '—'}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--ns-ink-4)', marginTop: 1 }}>
                              {ally.email ?? ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="muted" style={{ fontSize: 12 }}>
                        {ally.primary_role ?? '—'}
                      </td>

                      {/* Specialties */}
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {(ally.specialties ?? []).slice(0, 3).map(s => (
                            <span key={s} className="ns-badge ns-badge--gray" style={{ fontSize: 10 }}>
                              {s}
                            </span>
                          ))}
                          {(ally.specialties ?? []).length > 3 && (
                            <span className="ns-badge ns-badge--gray" style={{ fontSize: 10 }}>
                              +{ally.specialties.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Sessions offered */}
                      <td className="muted" style={{ fontSize: 12 }}>
                        {ally.session_durations?.join(', ') ?? '—'}
                        {ally.session_price ? (
                          <span style={{ marginLeft: 4, color: 'var(--ns-ink)' }}>
                            · ₹{ally.session_price}
                          </span>
                        ) : null}
                      </td>

                      {/* Status badge */}
                      <td>
                        {isRecovery ? (
                          <span className="ns-badge ns-badge--forest">
                            <span className="ns-badge__dot" />
                            Needs activation
                          </span>
                        ) : (
                          <span className="ns-badge ns-badge--amber">
                            <span className="ns-badge__dot" />
                            Pending review
                          </span>
                        )}
                      </td>

                      {/* Time */}
                      <td className="muted" style={{ fontSize: 12 }}>
                        {timeAgo(ally.updated_at ?? ally.created_at)}
                      </td>

                      {/* Actions */}
                      <td>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                          {/* View form */}
                          <a
                            href={`/admin/allies/onboard?ally=${ally.id}`}
                            className="ns-btn ns-btn--ghost ns-btn--sm"
                          >
                            View
                          </a>

                          {/* Approve & Go Live / Go Live */}
                          <button
                            className="ns-btn ns-btn--primary ns-btn--sm"
                            disabled={isBusy}
                            onClick={() => void handleApproveAndActivate(ally.id, ally.full_name)}
                            style={{ minWidth: isRecovery ? 76 : 136 }}
                          >
                            {isBusy ? (
                              <>
                                <span
                                  className="ob-spinner"
                                  style={{
                                    width: 11, height: 11, borderWidth: 1.5,
                                    borderTopColor: '#fff', display: 'inline-block',
                                  }}
                                />
                                &nbsp;Processing…
                              </>
                            ) : isRecovery ? (
                              '⚡ Go Live'
                            ) : (
                              '✓ Approve & Go Live'
                            )}
                          </button>

                          {/* Reject */}
                          <button
                            className="ns-btn ns-btn--ghost ns-btn--sm"
                            style={{ color: 'var(--ns-red)', borderColor: 'transparent' }}
                            disabled={isBusy}
                            onClick={() => { setRejectTarget(ally.id); setRejectReason(''); }}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Embed URL warning dialog ─────────────────────────────────────────── */}
      {embedUrlWarning && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(26,43,34,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200,
          }}
          onClick={e => { if (e.target === e.currentTarget) setEmbedUrlWarning(null); }}
        >
          <div className="ns-card" style={{ width: 460, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: 'var(--ns-amber-light, #fff8e6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 2L1.5 13h13L8 2z" stroke="var(--ns-amber)" strokeWidth="1.3" strokeLinejoin="round"/>
                  <path d="M8 6.5v3M8 11v.5" stroke="var(--ns-amber)" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </div>
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--ns-ink)' }}>
                Ally is live — but booking URL is missing
              </div>
            </div>

            <p style={{ fontSize: 13, color: 'var(--ns-ink-4)', marginBottom: 8, lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--ns-ink)' }}>{embedUrlWarning.name}</strong> has been approved and activated successfully, but their Zoho booking URL could not be fetched automatically.
            </p>
            <p style={{ fontSize: 13, color: 'var(--ns-ink-4)', marginBottom: 20, lineHeight: 1.6 }}>
              Clients clicking <em>"Book a session"</em> will see a <em>"Booking not set up"</em> message until this is fixed. Go to their profile and manually set the Zoho embed URL.
            </p>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                className="ns-btn ns-btn--ghost ns-btn--sm"
                onClick={() => setEmbedUrlWarning(null)}
              >
                Dismiss
              </button>
              <button
                className="ns-btn ns-btn--primary ns-btn--sm"
                disabled={syncingUrl}
                onClick={() => void handleSyncBookingUrl(embedUrlWarning.id)}
              >
                {syncingUrl ? (
                  <>
                    <span
                      className="ob-spinner"
                      style={{ width: 11, height: 11, borderWidth: 1.5, borderTopColor: '#fff', display: 'inline-block' }}
                    />
                    &nbsp;Syncing…
                  </>
                ) : (
                  'Sync Booking URL Now'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject dialog ────────────────────────────────────────────────────── */}
      {rejectTarget && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(26,43,34,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200,
          }}
          onClick={e => { if (e.target === e.currentTarget) setRejectTarget(null); }}
        >
          <div className="ns-card" style={{ width: 440, padding: 28 }}>
            {/* Icon + title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: 'var(--ns-red-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                  <path
                    d="M7.5 1L1 13h13L7.5 1z"
                    stroke="var(--ns-red)" strokeWidth="1.3" strokeLinejoin="round"
                  />
                  <path d="M7.5 6v3.5M7.5 11v.5" stroke="var(--ns-red)" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </div>
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--ns-ink)' }}>
                Reject application
              </div>
            </div>

            <p style={{ fontSize: 13, color: 'var(--ns-ink-4)', marginBottom: 16, lineHeight: 1.55 }}>
              This moves the ally to <strong>rejected</strong> status. Optionally add a reason —
              it will be saved to their admin notes.
            </p>

            <textarea
              placeholder="Reason for rejection (optional)"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
              style={{
                width: '100%', padding: '9px 11px', fontSize: 13,
                border: '1px solid var(--ns-border)', borderRadius: 6,
                resize: 'vertical', fontFamily: 'inherit',
                background: '#fff', color: 'var(--ns-ink)',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />

            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
              <button
                className="ns-btn ns-btn--ghost ns-btn--sm"
                onClick={() => setRejectTarget(null)}
              >
                Cancel
              </button>
              <button
                className="ns-btn ns-btn--danger ns-btn--sm"
                disabled={!!busy[rejectTarget]}
                onClick={() => {
                  const target = allies.find(a => a.id === rejectTarget);
                  void handleReject(rejectTarget, target?.full_name ?? null);
                }}
              >
                {busy[rejectTarget] ? 'Rejecting…' : 'Confirm reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
