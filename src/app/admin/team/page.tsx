'use client';

import { useEffect, useState, useTransition } from 'react';
import { grantManagerRole, revokeRole } from './actions';

// ── Types ──────────────────────────────────────────────────────────────────────

interface StaffMember {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'manager';
  created_at: string;
}

interface FoundUser {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getInitials(name: string | null, email: string): string {
  if (name) return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return email[0].toUpperCase();
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function RoleBadge({ role }: { role: 'admin' | 'manager' }) {
  if (role === 'admin') {
    return (
      <span className="ns-badge ns-badge--forest" style={{ gap: 5 }}>
        <span className="ns-badge__dot" />
        Super admin
      </span>
    );
  }
  return (
    <span className="ns-badge ns-badge--teal" style={{ gap: 5 }}>
      <span className="ns-badge__dot" />
      Manager
    </span>
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────────

function Toast({ message, type, onDone }: { message: string; type: 'success' | 'error'; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className={`ns-toast ns-toast--${type}`}>
      {type === 'success' ? (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M3 8l3.5 3.5L13 4"/>
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 4l8 8M12 4l-8 8"/>
        </svg>
      )}
      {message}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const [staff, setStaff]               = useState<StaffMember[]>([]);
  const [loading, setLoading]           = useState(true);
  const [searchEmail, setSearchEmail]   = useState('');
  const [searching, setSearching]       = useState(false);
  const [foundUser, setFoundUser]       = useState<FoundUser | null>(null);
  const [searchError, setSearchError]   = useState<string | null>(null);
  const [toast, setToast]               = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [isPending, startTransition]    = useTransition();
  const [actionTarget, setActionTarget] = useState<string | null>(null);

  // ── Load staff list ──────────────────────────────────────────────────────────
  async function loadStaff() {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/team');
      if (!res.ok) throw new Error('Failed to load team');
      const json = await res.json();
      setStaff(json.staff ?? []);
    } catch {
      setToast({ msg: 'Failed to load team list', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadStaff(); }, []);

  // ── Search user by email ─────────────────────────────────────────────────────
  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const email = searchEmail.trim();
    if (!email) return;
    setSearching(true);
    setFoundUser(null);
    setSearchError(null);
    try {
      const res = await fetch('/api/v1/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSearchError(json.error ?? 'User not found');
      } else {
        setFoundUser(json.user);
      }
    } catch {
      setSearchError('Search failed — please try again');
    } finally {
      setSearching(false);
    }
  }

  // ── Grant manager access ─────────────────────────────────────────────────────
  function handleGrant(userId: string, email: string) {
    setActionTarget(userId);
    startTransition(async () => {
      const res = await grantManagerRole(userId, email);
      if (res.error) {
        setToast({ msg: res.error, type: 'error' });
      } else {
        setToast({ msg: `Manager access granted to ${email}`, type: 'success' });
        setFoundUser(null);
        setSearchEmail('');
        await loadStaff();
      }
      setActionTarget(null);
    });
  }

  // ── Revoke access ────────────────────────────────────────────────────────────
  function handleRevoke(member: StaffMember) {
    if (!window.confirm(`Revoke manager access for ${member.email}?\n\nThey will no longer be able to access the admin panel.`)) return;
    setActionTarget(member.id);
    startTransition(async () => {
      const res = await revokeRole(member.id, member.email);
      if (res.error) {
        setToast({ msg: res.error, type: 'error' });
      } else {
        setToast({ msg: `Access revoked for ${member.email}`, type: 'success' });
        await loadStaff();
      }
      setActionTarget(null);
    });
  }

  const admins   = staff.filter(s => s.role === 'admin');
  const managers = staff.filter(s => s.role === 'manager');

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="ns-page-content">

      {/* ── Info banner ──────────────────────────────────────────────────────── */}
      <div className="ns-notice" style={{ marginBottom: 4 }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="8" cy="8" r="6"/>
          <path d="M8 7v4M8 5.5v.5"/>
        </svg>
        <span>
          <strong>Managers</strong> can manage clients and allies, review applications, and view audit logs.
          They cannot access pricing, integrations, config, or team settings.
          Only super admins can grant or revoke access.
        </span>
      </div>

      {/* ── Current Staff ────────────────────────────────────────────────────── */}
      <div style={{ marginTop: 24 }}>
        <div className="ns-section-hd" style={{ marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--ns-font-serif)', fontSize: 18, color: 'var(--deep-pine)' }}>
            Current team
          </h2>
          <span className="ns-section-hd__note">
            {loading ? 'Loading…' : `${staff.length} member${staff.length !== 1 ? 's' : ''} with system access`}
          </span>
        </div>

        {loading ? (
          <div className="ns-card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--ns-ink-4)' }}>
            Loading team…
          </div>
        ) : staff.length === 0 ? (
          <div className="ns-card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--ns-ink-4)' }}>
            No team members found.
          </div>
        ) : (
          <div className="ns-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="ns-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role</th>
                  <th>Account created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Admins first */}
                {admins.map(member => (
                  <tr key={member.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'var(--ns-forest)', color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.75rem', fontWeight: 600, flexShrink: 0,
                          overflow: 'hidden',
                        }}>
                          {member.avatar_url
                            ? <img src={member.avatar_url} alt={member.full_name ?? member.email} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : getInitials(member.full_name, member.email)
                          }
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--ns-ink)' }}>
                            {member.full_name ?? member.email.split('@')[0]}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--ns-ink-4)', marginTop: 1 }}>
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td><RoleBadge role={member.role} /></td>
                    <td style={{ color: 'var(--ns-ink-4)', fontSize: '0.8125rem' }}>{fmtDate(member.created_at)}</td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--ns-ink-4)', fontStyle: 'italic' }}>Protected</span>
                    </td>
                  </tr>
                ))}
                {/* Managers */}
                {managers.map(member => {
                  const isRevoking = actionTarget === member.id && isPending;
                  return (
                    <tr key={member.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'var(--ns-teal)', color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem', fontWeight: 600, flexShrink: 0,
                            overflow: 'hidden',
                          }}>
                            {member.avatar_url
                              ? <img src={member.avatar_url} alt={member.full_name ?? member.email} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : getInitials(member.full_name, member.email)
                            }
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--ns-ink)' }}>
                              {member.full_name ?? member.email.split('@')[0]}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--ns-ink-4)', marginTop: 1 }}>
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td><RoleBadge role={member.role} /></td>
                      <td style={{ color: 'var(--ns-ink-4)', fontSize: '0.8125rem' }}>{fmtDate(member.created_at)}</td>
                      <td>
                        <button
                          className="ns-btn ns-btn--sm"
                          style={{ background: 'transparent', border: '1px solid rgba(196,75,58,0.3)', color: 'var(--ns-red)' }}
                          disabled={isRevoking || isPending}
                          onClick={() => handleRevoke(member)}
                        >
                          {isRevoking ? '…' : 'Revoke access'}
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

      {/* ── Grant Manager Access ─────────────────────────────────────────────── */}
      <div style={{ marginTop: 32 }}>
        <div className="ns-section-hd" style={{ marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--ns-font-serif)', fontSize: 18, color: 'var(--deep-pine)' }}>
            Grant manager access
          </h2>
          <span className="ns-section-hd__note">Search by email to find an existing user</span>
        </div>

        <div className="ns-card">
          <form onSubmit={handleSearch}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: foundUser || searchError ? 16 : 0 }}>
              <div style={{ flex: 1 }}>
                <label className="ns-label" style={{ marginBottom: 6, display: 'block' }}>
                  User email
                </label>
                <div className="ns-search-input-wrap">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
                    <circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/>
                  </svg>
                  <input
                    className="ns-search-input"
                    type="email"
                    placeholder="user@example.com"
                    value={searchEmail}
                    onChange={e => {
                      setSearchEmail(e.target.value);
                      setFoundUser(null);
                      setSearchError(null);
                    }}
                    style={{ paddingLeft: 34 }}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="ns-btn ns-btn--secondary"
                disabled={!searchEmail.trim() || searching}
                style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
              >
                {searching ? 'Searching…' : 'Search user'}
              </button>
            </div>
          </form>

          {/* Search error */}
          {searchError && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
              background: 'var(--ns-red-light)', border: '1px solid rgba(196,75,58,0.2)',
              borderRadius: 'var(--ns-radius-sm)', fontSize: '0.8125rem', color: 'var(--ns-red)',
            }}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="8" cy="8" r="6"/><path d="M8 5v3M8 11v.5"/>
              </svg>
              {searchError}
            </div>
          )}

          {/* Found user */}
          {foundUser && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px',
              background: 'var(--ns-cream-2)',
              border: '1px solid var(--ns-border)',
              borderRadius: 'var(--ns-radius-sm)',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: foundUser.role ? 'var(--ns-gold-mid)' : 'var(--ns-forest-light)',
                color: foundUser.role ? 'var(--ns-forest)' : 'var(--ns-forest)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.875rem', fontWeight: 600, flexShrink: 0,
              }}>
                {getInitials(foundUser.full_name, foundUser.email)}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--ns-ink)' }}>
                  {foundUser.full_name ?? foundUser.email.split('@')[0]}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ns-ink-4)', marginTop: 2 }}>
                  {foundUser.email}
                </div>
              </div>

              {/* Current role info */}
              {foundUser.role ? (
                <span className={`ns-badge ${foundUser.role === 'admin' ? 'ns-badge--forest' : foundUser.role === 'manager' ? 'ns-badge--teal' : 'ns-badge--gray'}`}>
                  {foundUser.role === 'admin' ? 'Super admin' : foundUser.role === 'manager' ? 'Already a manager' : foundUser.role}
                </span>
              ) : (
                <span className="ns-badge ns-badge--gray">No staff role</span>
              )}

              {/* Grant button — only if not already staff */}
              {(!foundUser.role || (foundUser.role !== 'admin' && foundUser.role !== 'manager')) && (
                <button
                  className="ns-btn ns-btn--primary ns-btn--sm"
                  disabled={isPending}
                  onClick={() => handleGrant(foundUser.id, foundUser.email)}
                  style={{ flexShrink: 0 }}
                >
                  {isPending && actionTarget === foundUser.id ? 'Granting…' : 'Grant manager access'}
                </button>
              )}

              {foundUser.role === 'manager' && (
                <span style={{ fontSize: '0.8125rem', color: 'var(--ns-ink-4)', fontStyle: 'italic', flexShrink: 0 }}>
                  Already a manager
                </span>
              )}
              {foundUser.role === 'admin' && (
                <span style={{ fontSize: '0.8125rem', color: 'var(--ns-ink-4)', fontStyle: 'italic', flexShrink: 0 }}>
                  Already an admin
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Permission summary card ──────────────────────────────────────────── */}
      <div style={{ marginTop: 32 }}>
        <div className="ns-section-hd" style={{ marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--ns-font-serif)', fontSize: 18, color: 'var(--deep-pine)' }}>
            Access levels
          </h2>
        </div>
        <div className="ns-two-col" style={{ gap: 14 }}>
          {/* Super admin */}
          <div className="ns-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--ns-forest-light)', color: 'var(--ns-forest)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                  <path d="M8 2 Q12 3 13 7 Q13 11 9 13 Q8 13.5 7 13 Q3 11 3 7 Q4 3 8 2Z"/>
                  <circle cx="8" cy="7.5" r="1.5"/>
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--ns-ink)' }}>Super admin</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ns-ink-4)' }}>Full system access</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {['Dashboard & all stats', 'Client & ally management', 'Pricing & limits config', 'Integrations setup', 'App Config & feature flags', 'Audit logs', 'Team management'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.8125rem', color: 'var(--ns-ink-2)' }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="var(--ns-forest)" strokeWidth="2" strokeLinecap="round">
                    <path d="M3 8l3.5 3.5L13 4"/>
                  </svg>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Manager */}
          <div className="ns-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--ns-teal-light)', color: 'var(--ns-teal)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                  <circle cx="8" cy="5" r="3"/>
                  <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--ns-ink)' }}>Manager</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ns-ink-4)' }}>Day-to-day operations</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {[
                { label: 'Dashboard & stats', granted: true },
                { label: 'Client & ally management', granted: true },
                { label: 'Ally application review', granted: true },
                { label: 'Audit logs (read-only)', granted: true },
                { label: 'Pricing & limits config', granted: false },
                { label: 'Integrations & App Config', granted: false },
                { label: 'Team management', granted: false },
              ].map(({ label, granted }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.8125rem', color: granted ? 'var(--ns-ink-2)' : 'var(--ns-ink-4)' }}>
                  {granted ? (
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="var(--ns-teal)" strokeWidth="2" strokeLinecap="round">
                      <path d="M3 8l3.5 3.5L13 4"/>
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="var(--ns-border)" strokeWidth="2" strokeLinecap="round">
                      <path d="M4 4l8 8M12 4l-8 8"/>
                    </svg>
                  )}
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Toast ─────────────────────────────────────────────────────────────── */}
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}
    </div>
  );
}
