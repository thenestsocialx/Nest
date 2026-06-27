'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import ZohoWorkspaceSelector from './ZohoWorkspaceSelector';
import type { ZohoServiceRow } from '@/types/zoho';

interface ZohoCardProps {
  connected: boolean;
  orgId: string | null;
  workspaceId: string | null;
  workspaceName: string | null;
}

export default function ZohoCard({
  connected,
  orgId,
  workspaceId,
  workspaceName,
}: ZohoCardProps) {
  const router = useRouter();
  const [disconnecting, setDisconnecting]   = useState(false);
  const [showChangeWorkspace, setShowChangeWorkspace] = useState(false);
  const [services, setServices]             = useState<ZohoServiceRow[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [syncing, setSyncing]               = useState(false);
  const [syncResult, setSyncResult]         = useState<{ synced: number; deactivated: number } | null>(null);
  const [syncError, setSyncError]           = useState<string | null>(null);

  const loadCachedServices = useCallback(() => {
    setServicesLoading(true);
    setSyncError(null);
    fetch('/api/v1/zoho/services/cached')
      .then(r => r.json())
      .then((d: { services?: ZohoServiceRow[]; error?: { message?: string } }) => {
        if (d.error) throw new Error(d.error.message ?? 'Load failed');
        setServices(d.services ?? []);
      })
      .catch((err: unknown) => {
        setSyncError(err instanceof Error ? err.message : 'Failed to load services');
      })
      .finally(() => setServicesLoading(false));
  }, []);

  useEffect(() => {
    if (connected && workspaceId) loadCachedServices();
  }, [connected, workspaceId, loadCachedServices]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    setSyncError(null);
    try {
      const res  = await fetch('/api/v1/zoho/sync-services', { method: 'POST' });
      const data = (await res.json()) as { synced?: number; deactivated?: number; error?: { message?: string } };
      if (!res.ok) throw new Error(data.error?.message ?? 'Sync failed');
      setSyncResult({ synced: data.synced ?? 0, deactivated: data.deactivated ?? 0 });
      loadCachedServices();
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect Zoho? Ally booking sync will stop working.')) return;
    setDisconnecting(true);
    try {
      const res = await fetch('/api/v1/zoho/credentials', { method: 'DELETE' });
      if (res.ok) router.refresh();
    } finally {
      setDisconnecting(false);
    }
  };

  // ── Not connected ─────────────────────────────────────────────────────────
  if (!connected) {
    return (
      <div className="ns-oauth-box">
        <div className="ns-oauth-box__title">Connect Zoho Bookings</div>
        <div className="ns-oauth-box__sub">
          Link your Zoho Bookings account to enable Ally session scheduling, slot management, and
          booking sync.
        </div>
        <a href="/api/v1/zoho/oauth/start" className="ns-btn ns-btn--primary">
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          >
            <path d="M10 3l3 3-3 3M6 13l-3-3 3-3M9 6H6M10 10H7" />
          </svg>
          Connect Zoho
        </a>
      </div>
    );
  }

  const showSelector = !workspaceId || showChangeWorkspace;

  // ── Connected ─────────────────────────────────────────────────────────────
  return (
    <div className="ns-oauth-box ns-oauth-box--connected">
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div className="ns-oauth-box__title">Zoho Bookings — Connected</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="ns-status__dot ns-status__dot--live" style={{ display: 'inline-block' }} />
            <span style={{ fontSize: 12, color: 'var(--ns-teal)', fontWeight: 500 }}>OAuth2 active</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="ns-btn ns-btn--secondary ns-btn--sm"
            onClick={() => { void handleSync(); }}
            disabled={syncing || !workspaceId}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
          >
            {syncing ? (
              <>
                <span style={{ width: 12, height: 12, border: '1.5px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                Syncing…
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
                  <path d="M14 8a6 6 0 1 1-1.5-3.9" /><path d="M14 2v4h-4" />
                </svg>
                Sync Services
              </>
            )}
          </button>
          <button className="ns-btn ns-btn--ghost ns-btn--sm">View</button>
          <button
            className="ns-btn ns-btn--danger ns-btn--sm"
            onClick={handleDisconnect}
            disabled={disconnecting}
          >
            {disconnecting ? 'Disconnecting…' : 'Disconnect'}
          </button>
        </div>
      </div>

      {/* Sync result/error banners */}
      {syncResult && (
        <div style={{ fontSize: 12, color: 'var(--ns-teal)', background: 'rgba(92,122,102,0.08)', border: '1px solid rgba(92,122,102,0.2)', borderRadius: 7, padding: '8px 12px', marginBottom: 10 }}>
          ✓ Synced {syncResult.synced} service{syncResult.synced !== 1 ? 's' : ''}
          {syncResult.deactivated > 0 && ` · ${syncResult.deactivated} deactivated`}
        </div>
      )}
      {syncError && (
        <div style={{ fontSize: 12, color: 'var(--ns-terra,#9B6651)', background: 'rgba(155,102,81,0.08)', border: '1px solid rgba(155,102,81,0.2)', borderRadius: 7, padding: '8px 12px', marginBottom: 10 }}>
          ✗ {syncError}
        </div>
      )}

      {/* Active workspace */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: 'var(--ns-muted, #888)', fontWeight: 500 }}>Workspace:</span>
        {workspaceId ? (
          <>
            <span style={{ fontSize: 12, color: 'var(--ns-forest, #2F4C3A)', fontWeight: 500 }}>{workspaceName ?? workspaceId}</span>
            {!showChangeWorkspace && (
              <button
                className="ns-btn ns-btn--ghost ns-btn--sm"
                style={{ padding: '1px 8px', fontSize: 11 }}
                onClick={() => setShowChangeWorkspace(true)}
              >
                Change
              </button>
            )}
          </>
        ) : (
          <span style={{ fontSize: 12, color: 'var(--ns-muted, #888)' }}>Not selected</span>
        )}
      </div>

      {showSelector && (
        <div style={{ marginTop: 16 }}>
          <ZohoWorkspaceSelector savedWorkspaceId={workspaceId} savedWorkspaceName={workspaceName} />
        </div>
      )}

      {/* ── Services list ── */}
      {workspaceId && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="ns-card__label" style={{ margin: 0 }}>
              Synced services
              {services.length > 0 && (
                <span style={{ marginLeft: 6, fontSize: 10, background: 'var(--ns-forest,#2F4C3A)', color: '#F8F0E5', padding: '1px 7px', borderRadius: 50 }}>
                  {services.length}
                </span>
              )}
            </div>
          </div>

          {servicesLoading && (
            <div style={{ fontSize: 12, color: 'var(--ns-muted,#888)', padding: '8px 0' }}>Loading services…</div>
          )}

          {!servicesLoading && services.length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--ns-muted,#888)', background: 'var(--ns-pine-t,#EFF5EE)', border: '1px solid var(--ns-border,#E0D5C5)', borderRadius: 8, padding: '12px 14px' }}>
              No services synced yet. Click <strong>Sync Services</strong> to fetch from Zoho Bookings.
            </div>
          )}

          {!servicesLoading && services.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--ns-border,#E0D5C5)' }}>
                  {['Service name', 'Duration', 'Pre / Post buffer', 'Effective slot', 'Format', 'Last synced'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 500, color: 'var(--ns-muted,#888)', letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: 10 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {services.map(s => (
                  <tr key={s.zoho_service_id} style={{ borderBottom: '1px solid var(--ns-border,#E0D5C5)' }}>
                    <td style={{ padding: '8px 8px', color: 'var(--ns-forest,#2F4C3A)', fontWeight: 500 }}>{s.name}</td>
                    <td style={{ padding: '8px 8px' }}>{s.duration_mins} min</td>
                    <td style={{ padding: '8px 8px' }}>{s.pre_buffer_mins} / {s.post_buffer_mins} min</td>
                    <td style={{ padding: '8px 8px' }}>{s.effective_slot_mins} min</td>
                    <td style={{ padding: '8px 8px' }}>{s.session_format.join(', ')}</td>
                    <td style={{ padding: '8px 8px', color: 'var(--ns-muted,#888)' }}>
                      {s.last_synced_at
                        ? new Date(s.last_synced_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {orgId && null}
    </div>
  );
}
