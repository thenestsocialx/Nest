'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ZohoWorkspace } from '@/types/zoho';

type SelectorState =
  | { phase: 'loading' }
  | { phase: 'error'; message: string }
  | { phase: 'ready'; workspaces: ZohoWorkspace[]; selected: string }
  | { phase: 'saving' }
  | { phase: 'saved'; workspaceName: string };

interface ZohoWorkspaceSelectorProps {
  savedWorkspaceId?: string | null;
  savedWorkspaceName?: string | null;
}

export default function ZohoWorkspaceSelector({
  savedWorkspaceId,
  savedWorkspaceName,
}: ZohoWorkspaceSelectorProps) {
  const router = useRouter();
  const hasFetched = useRef(false);

  const [state, setState] = useState<SelectorState>({ phase: 'loading' });

  const fetchWorkspaces = async () => {
    setState({ phase: 'loading' });
    try {
      const res = await fetch('/api/v1/zoho/workspaces');
      const json = (await res.json()) as {
        workspaces?: ZohoWorkspace[];
        error?: { message: string };
      };

      if (!res.ok || !json.workspaces) {
        setState({ phase: 'error', message: json.error?.message ?? 'Failed to load workspaces.' });
        return;
      }

      setState({
        phase: 'ready',
        workspaces: json.workspaces,
        selected: savedWorkspaceId ?? json.workspaces[0]?.id ?? '',
      });
    } catch {
      setState({ phase: 'error', message: 'Network error — could not reach the server.' });
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    void fetchWorkspaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (state.phase !== 'ready' || !state.selected) return;

    const workspace = state.workspaces.find((w) => w.id === state.selected);
    if (!workspace) return;

    setState({ phase: 'saving' });

    try {
      const res = await fetch('/api/v1/zoho/credentials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspace_id: workspace.id, workspace_name: workspace.name }),
      });

      if (res.ok) {
        setState({ phase: 'saved', workspaceName: workspace.name });
        // Refresh the server component (ZohoCard parent) to reflect the saved workspace
        router.refresh();
      } else {
        const json = (await res.json()) as { error?: { message: string } };
        setState({
          phase: 'error',
          message: json.error?.message ?? 'Failed to save workspace. Please try again.',
        });
      }
    } catch {
      setState({ phase: 'error', message: 'Network error — could not save workspace.' });
    }
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (state.phase === 'loading') {
    return (
      <div className="ns-workspace-selector">
        <div className="ns-workspace-selector__loading">
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }}
          >
            <path d="M14 8a6 6 0 1 1-1.5-3.9" />
          </svg>
          <span>Loading workspaces…</span>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (state.phase === 'error') {
    return (
      <div className="ns-workspace-selector">
        <div className="ns-workspace-selector__error">
          <svg
            width="13"
            height="13"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            style={{ flexShrink: 0 }}
          >
            <circle cx="8" cy="8" r="6" />
            <path d="M8 5v3M8 10.5V11" />
          </svg>
          <span>{state.message}</span>
          <button
            className="ns-btn ns-btn--ghost ns-btn--sm"
            onClick={() => {
              hasFetched.current = false;
              void fetchWorkspaces();
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Saved ────────────────────────────────────────────────────────────────────
  if (state.phase === 'saved') {
    return (
      <div className="ns-workspace-selector">
        <div className="ns-workspace-selector__saved">
          <svg
            width="13"
            height="13"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M2 6l3 3 5-5" />
          </svg>
          <span>
            Workspace saved — <strong>{state.workspaceName}</strong>
          </span>
        </div>
      </div>
    );
  }

  // ── Saving ───────────────────────────────────────────────────────────────────
  const isSaving = state.phase === 'saving';

  // ── Ready ────────────────────────────────────────────────────────────────────
  const readyState = state.phase === 'ready' ? state : null;

  return (
    <div className="ns-workspace-selector">
      <div className="ns-workspace-selector__label">
        {savedWorkspaceId ? 'Change workspace' : 'Select workspace to complete setup'}
      </div>

      <div className="ns-workspace-selector__row">
        <div className="ns-workspace-selector__select-wrap">
          <select
            className="ns-workspace-selector__select"
            value={readyState?.selected ?? ''}
            disabled={isSaving}
            onChange={(e) => {
              if (readyState) {
                setState({ ...readyState, selected: e.target.value });
              }
            }}
          >
            {readyState?.workspaces.length === 0 && (
              <option value="" disabled>
                No workspaces found
              </option>
            )}
            {readyState?.workspaces.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          {/* Dropdown chevron */}
          <svg
            className="ns-workspace-selector__chevron"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M2 4l4 4 4-4" />
          </svg>
        </div>

        <button
          className="ns-btn ns-btn--primary ns-btn--sm"
          disabled={isSaving || !readyState?.selected || readyState?.selected === savedWorkspaceId}
          onClick={handleSave}
        >
          {isSaving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {savedWorkspaceName && (
        <div className="ns-workspace-selector__current">
          Currently: <strong>{savedWorkspaceName}</strong>
        </div>
      )}
    </div>
  );
}
