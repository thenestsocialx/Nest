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

type TabFilter = 'submitted' | 'approved';

// ── Toast ─────────────────────────────────────────────────────────────────────
interface Toast { type: 'success' | 'error'; message: string }

// ── Helpers ───────────────────────────────────────────────────────────────────
function initials(name: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ApplicationsPage() {
  const [tab, setTab]       = useState<TabFilter>('submitted');
  const [allies, setAllies] = useState<AllyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast]   = useState<Toast | null>(null);
  // Track in-flight action per ally ID
  const [busy, setBusy]     = useState<Record<string, boolean>>({});
  // For reject: show reason input
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const showToast = useCallback((type: Toast['type'], message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // ── Load allies ──────────────────────────────────────────────────────────────
  const load = useCallback(async (filter: TabFilter) => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/v1/allies?status=${filter}`);
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

  useEffect(() => { void load(tab); }, [tab, load]);

  // ── Actions ──────────────────────────────────────────────────────────────────
  const setAllyBusy = (id: string, val: boolean) =>
    setBusy(prev => ({ ...prev, [id]: val }));

  async function handleApprove(id: string, name: string | null) {
    setAllyBusy(id, true);
    try {
      const res  = await fetch(`/api/v1/allies/${id}/approve`, { method: 'POST' });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Approve failed');
      showToast('success', `✓ ${name ?? 'Ally'} approved — ready for activation`);
      void load(tab);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Approve failed');
    } finally {
      setAllyBusy(id, false);
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
      void load(tab);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Reject failed');
    } finally {
      setAllyBusy(id, false);
    }
  }

  async function handleActivate(id: string, name: string | null) {
    setAllyBusy(id, true);
    try {
      const res  = await fetch(`/api/v1/allies/${id}/activate`, { method: 'POST' });
      const data = await res.json() as { ok?: boolean; error?: string; warning?: string };
      if (!res.ok) throw new Error(data.error ?? 'Activation failed');
      if (data.warning) showToast('error', `Warning: ${data.warning}`);
      else showToast('success', `✓ ${name ?? 'Ally'} is now live — services created in Zoho`);
      void load(tab);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Activation failed');
    } finally {
      setAllyBusy(id, false);
    }
  }

  // ── Counts ────────────────────────────────────────────────────────────────────
  const submittedCount = tab === 'submitted' ? allies.length : '…';
  const approvedCount  = tab === 'approved'  ? allies.length : '…';

  // ── Render ───────────────────────────────────────────────────────────────────
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

      {/* Header */}
      <div className="ns-search-row">
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--ns-ink)', margin: 0 }}>
            Ally Applications
          </h1>
          <p style={{ fontSize: 12, color: 'var(--ns-ink-4)', margin: '2px 0 0' }}>
            Review submissions, approve profiles, and activate allies in Zoho Bookings.
          </p>
        </div>
        <a href="/admin/allies/onboard" className="ns-btn ns-btn--primary">+ Onboard new</a>
      </div>

      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          borderBottom: '1px solid var(--ns-line)',
          marginBottom: 20,
        }}
      >
        {([
          { key: 'submitted', label: 'Pending review', badge: submittedCount, badgeColor: 'amber' },
          { key: 'approved',  label: 'Approved · awaiting activation', badge: approvedCount, badgeColor: 'forest' },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: tab === t.key ? 600 : 400,
              color: tab === t.key ? 'var(--ns-ink)' : 'var(--ns-ink-4)',
              borderBottom: tab === t.key ? '2px solid var(--ns-teal)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {t.label}
            <span className={`ns-badge ns-badge--${t.badgeColor}`}>{t.badge}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '40px 0', color: 'var(--ns-ink-4)', fontSize: 13 }}>
          <div className="ob-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
          Loading applications…
        </div>
      ) : allies.length === 0 ? (
        <div className="ns-card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--ns-ink-4)' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>
            {tab === 'submitted' ? '📥' : '✅'}
          </div>
          <div style={{ fontWeight: 500, marginBottom: 4, color: 'var(--ns-ink)' }}>
            {tab === 'submitted' ? 'No pending applications' : 'No approved allies awaiting activation'}
          </div>
          <div style={{ fontSize: 12 }}>
            {tab === 'submitted'
              ? 'New submissions will appear here once allies complete onboarding and click "Submit for review".'
              : 'Approved applications will appear here after you approve them from the Pending tab.'}
          </div>
        </div>
      ) : (
        <div className="ns-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="ns-table-wrap">
            <table className="ns-table">
              <thead>
                <tr>
                  <th>Ally</th>
                  <th>Role</th>
                  <th>Specialties</th>
                  <th>Sessions offered</th>
                  <th>{tab === 'approved' ? 'Zoho staff' : 'Step'}</th>
                  <th>Submitted</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allies.map(ally => (
                  <tr key={ally.id}>
                    {/* Ally name + photo */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {ally.photo_url ? (
                          <img
                            src={ally.photo_url}
                            alt={ally.full_name ?? ''}
                            style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="ns-ally-avatar" style={{ width: 34, height: 34, fontSize: 11 }}>
                            {initials(ally.full_name)}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 500 }}>{ally.full_name ?? '—'}</div>
                          <div style={{ fontSize: 11, color: 'var(--ns-ink-4)' }}>{ally.email ?? ''}</div>
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

                    {/* Sessions */}
                    <td className="muted" style={{ fontSize: 12 }}>
                      {ally.session_durations?.join(', ') ?? '—'}
                      {ally.session_price ? (
                        <span style={{ marginLeft: 4, color: 'var(--ns-ink)' }}>· ₹{ally.session_price}</span>
                      ) : null}
                    </td>

                    {/* Zoho staff ID status — only meaningful on "approved" tab */}
                    <td>
                      {tab === 'approved' ? (
                        ally.zoho_staff_id ? (
                          <span className="ns-badge ns-badge--forest">
                            <span className="ns-badge__dot" />Created
                          </span>
                        ) : (
                          <span className="ns-badge ns-badge--red">
                            <span className="ns-badge__dot" />Missing
                          </span>
                        )
                      ) : (
                        <span className="ns-badge ns-badge--gray">
                          Step {ally.onboarding_step} / 5
                        </span>
                      )}
                    </td>

                    {/* Submitted */}
                    <td className="muted" style={{ fontSize: 12 }}>
                      {timeAgo(ally.updated_at ?? ally.created_at)}
                    </td>

                    {/* Actions */}
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        {/* View onboarding form */}
                        <a
                          href={`/admin/allies/onboard?ally=${ally.id}`}
                          className="ns-btn ns-btn--ghost ns-btn--sm"
                        >
                          View
                        </a>

                        {tab === 'submitted' && (
                          <>
                            <button
                              className="ns-btn ns-btn--primary ns-btn--sm"
                              disabled={busy[ally.id]}
                              onClick={() => void handleApprove(ally.id, ally.full_name)}
                            >
                              {busy[ally.id] ? (
                                <><span className="ob-spinner" style={{ width: 12, height: 12, borderWidth: 2, borderTopColor: 'var(--ob-cream)', display: 'inline-block' }} />&nbsp;Creating in Zoho…</>
                              ) : (
                                'Approve'
                              )}
                            </button>
                            <button
                              className="ns-btn ns-btn--ghost ns-btn--sm"
                              style={{ color: 'var(--ns-red)' }}
                              disabled={busy[ally.id]}
                              onClick={() => { setRejectTarget(ally.id); setRejectReason(''); }}
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {tab === 'approved' && (
                          <>
                            <button
                              className="ns-btn ns-btn--primary ns-btn--sm"
                              disabled={busy[ally.id]}
                              onClick={() => void handleActivate(ally.id, ally.full_name)}
                            >
                              {busy[ally.id] ? (
                                <><span className="ob-spinner" style={{ width: 12, height: 12, borderWidth: 2, borderTopColor: 'var(--ob-cream)', display: 'inline-block' }} />&nbsp;Activating…</>
                              ) : (
                                '⚡ Activate'
                              )}
                            </button>
                            <button
                              className="ns-btn ns-btn--ghost ns-btn--sm"
                              style={{ color: 'var(--ns-red)' }}
                              disabled={busy[ally.id]}
                              onClick={() => { setRejectTarget(ally.id); setRejectReason(''); }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject dialog */}
      {rejectTarget && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
          }}
          onClick={e => { if (e.target === e.currentTarget) setRejectTarget(null); }}
        >
          <div className="ns-card" style={{ width: 440, padding: 24 }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Reject application</div>
            <p style={{ fontSize: 13, color: 'var(--ns-ink-4)', marginBottom: 16, lineHeight: 1.5 }}>
              This will move the ally to <strong>rejected</strong> status. Add a reason (optional) — it will be saved to their admin notes.
            </p>
            <textarea
              placeholder="Reason for rejection (optional)"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
              style={{
                width: '100%', padding: '8px 10px', fontSize: 13,
                border: '1px solid var(--ns-line)', borderRadius: 6,
                resize: 'vertical', fontFamily: 'inherit',
                background: 'var(--ns-surface)', color: 'var(--ns-ink)',
                boxSizing: 'border-box',
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
                className="ns-btn ns-btn--sm"
                style={{ background: 'var(--ns-red)', color: '#fff', border: 'none' }}
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

      {/* Flow explanation */}
      <div
        className="ns-card"
        style={{ marginTop: 24, background: 'var(--ns-surface-2, #f8f9f7)', padding: '16px 20px' }}
      >
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ns-ink-4)', letterSpacing: '0.05em', marginBottom: 10 }}>
          ACTIVATION FLOW
        </div>
        <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>
          {[
            { step: '1', label: 'Onboard',   sub: 'Admin fills Steps 1–5',     color: 'var(--ns-ink-4)' },
            { step: '2', label: 'Submit',     sub: 'Zoho staff created',         color: 'var(--ns-ink-4)' },
            { step: '3', label: 'Review',     sub: 'Check docs & profile',       color: 'var(--ns-amber)' },
            { step: '4', label: 'Approve',    sub: 'status → approved',          color: 'var(--ns-amber)' },
            { step: '5', label: 'Activate',   sub: 'Zoho services created · Live', color: 'var(--ns-teal)' },
          ].map((s, i, arr) => (
            <div key={s.step} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ textAlign: 'center', padding: '0 12px' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: s.color === 'var(--ns-teal)' ? 'var(--ns-teal)' : s.color === 'var(--ns-amber)' ? 'var(--ns-amber)' : 'var(--ns-line)',
                  color: s.color !== 'var(--ns-ink-4)' ? '#fff' : 'var(--ns-ink-4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 600, margin: '0 auto 4px',
                }}>
                  {s.step}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ns-ink)' }}>{s.label}</div>
                <div style={{ fontSize: 10, color: 'var(--ns-ink-4)', marginTop: 1 }}>{s.sub}</div>
              </div>
              {i < arr.length - 1 && (
                <div style={{ fontSize: 16, color: 'var(--ns-line)', flexShrink: 0 }}>→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
