'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ZohoWorkspaceSelector from './ZohoWorkspaceSelector';

interface ZohoCardProps {
  connected: boolean;
  expiresAt: string | null;
  lastUpdated: string | null;
  orgId: string | null;
  workspaceId: string | null;
  workspaceName: string | null;
}

export default function ZohoCard({
  connected,
  expiresAt,
  lastUpdated,
  orgId,
  workspaceId,
  workspaceName,
}: ZohoCardProps) {
  const router = useRouter();
  const [disconnecting, setDisconnecting] = useState(false);
  const [showChangeWorkspace, setShowChangeWorkspace] = useState(false);

  const handleDisconnect = async () => {
    if (!confirm('Disconnect Zoho? Ally booking sync will stop working.')) return;
    setDisconnecting(true);
    try {
      const res = await fetch('/api/v1/zoho/credentials', { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
      }
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

  const formattedExpiry = expiresAt
    ? new Date(expiresAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : '—';

  const formattedUpdated = lastUpdated
    ? new Date(lastUpdated).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : '—';

  // Determine whether to show the workspace selector:
  //   - Always shown if no workspace has been selected yet
  //   - Also shown if the admin clicks "Change workspace"
  const showSelector = !workspaceId || showChangeWorkspace;

  // ── Connected ─────────────────────────────────────────────────────────────
  return (
    <div className="ns-oauth-box ns-oauth-box--connected">
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <div>
          <div className="ns-oauth-box__title">Zoho Bookings — Connected</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              className="ns-status__dot ns-status__dot--live"
              style={{ display: 'inline-block' }}
            />
            <span style={{ fontSize: 12, color: 'var(--ns-teal)', fontWeight: 500 }}>
              OAuth2 active
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="ns-btn ns-btn--secondary ns-btn--sm">
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            >
              <path d="M14 8a6 6 0 1 1-1.5-3.9" />
              <path d="M14 2v4h-4" />
            </svg>
            Sync
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

      {/* Meta grid */}
      <div className="ns-oauth-meta">
        <div className="ns-oauth-meta__item">
          <div className="ns-oauth-meta__label">Client ID source</div>
          <div className="ns-oauth-meta__val">Environment variable</div>
        </div>
        <div className="ns-oauth-meta__item">
          <div className="ns-oauth-meta__label">Client Secret source</div>
          <div className="ns-oauth-meta__val">Environment variable</div>
        </div>
        <div className="ns-oauth-meta__item">
          <div className="ns-oauth-meta__label">Last updated</div>
          <div className="ns-oauth-meta__val">{formattedUpdated}</div>
        </div>
        <div className="ns-oauth-meta__item">
          <div className="ns-oauth-meta__label">Token expires</div>
          <div className="ns-oauth-meta__val">{formattedExpiry}</div>
        </div>

        {/* Active workspace row */}
        <div className="ns-oauth-meta__item" style={{ gridColumn: '1 / -1' }}>
          <div className="ns-oauth-meta__label">Active workspace</div>
          <div className="ns-oauth-meta__val" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {workspaceId ? (
              <>
                <span>{workspaceName ?? workspaceId}</span>
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
              <span style={{ color: 'var(--ns-muted, #888)' }}>Not selected</span>
            )}
          </div>
        </div>

        <div className="ns-oauth-meta__item" style={{ gridColumn: '1 / -1' }}>
          <div className="ns-oauth-meta__label">Webhook endpoint</div>
          <div
            className="ns-oauth-meta__val"
            style={{ fontFamily: 'monospace', fontSize: 11 }}
          >
            /api/v1/webhooks/zoho
          </div>
        </div>
      </div>

      {/* Workspace selector — shown when no workspace is selected, or "Change" is clicked */}
      {showSelector && (
        <div style={{ marginTop: 16 }}>
          <ZohoWorkspaceSelector
            savedWorkspaceId={workspaceId}
            savedWorkspaceName={workspaceName}
          />
        </div>
      )}
    </div>
  );
}
