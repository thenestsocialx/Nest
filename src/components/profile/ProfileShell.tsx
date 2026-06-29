/*
 * ProfileShell — Profile & Settings page
 *
 * Env / backend wiring still needed:
 *   — "Request a copy of your information" → data export endpoint
 *   — "Delete my account" → Supabase admin deleteUser() call
 *   — Avatar upload → Supabase Storage bucket + signed upload URL
 */

'use client'

import { useState, useTransition, useRef, type ChangeEvent, type ReactElement } from 'react'
import { useRouter } from 'next/navigation'
import { saveProfile, saveProfileSetting } from '@/actions/profile-settings'
import { signOut } from '@/actions/auth'
import { cancelSubscription, reactivateSubscription, resumeSubscription, pauseSubscription } from '@/actions/razorpay'
import { deleteAccount } from '@/actions/account'
import { uploadAvatar } from '@/actions/avatar'

export interface ActiveSub {
  id: string
  status: 'active' | 'authenticated' | 'paused' | 'halted'
  periodEnd: string | null
  cancelAtEnd: boolean
}

interface ProfileData {
  full_name: string | null
  display_name: string | null
  phone: string | null
  phone_country_code: string | null
  preferred_language: string | null
  city: string | null
  plan: string | null
  subscription_status: string | null
  avatar_url: string | null
  nila_tone: string
  nila_memory_enabled: boolean
  nila_limit_reminder: boolean
  notify_email_updates: boolean
  notify_event_reminders: boolean
  notify_ally_reminders: boolean
  anonymous_mode: boolean
}

interface Props {
  profile: ProfileData | null
  email: string
  userInitial: string
  firstName: string
  activeSub: ActiveSub | null
}

type NilaTone = 'gentle' | 'direct' | 'balanced'

export default function ProfileShell({ profile, email, userInitial, firstName, activeSub }: Props) {
  const router = useRouter()
  /* ── Profile form state ── */
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [phone, setPhone] = useState(() => {
    if (!profile?.phone) return ''
    const code = profile.phone_country_code ?? ''
    if (code && profile.phone.startsWith(code)) {
      return profile.phone.slice(code.length).trim()
    }
    return profile.phone
  })
  const [phoneCode, setPhoneCode] = useState(profile?.phone_country_code ?? '+91')
  const [language, setLanguage] = useState(profile?.preferred_language ?? 'english')
  const [city, setCity] = useState(profile?.city ?? '')

  /* ── Save state ── */
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, startSaving] = useTransition()

  /* ── Nila preferences — initialised from DB ── */
  const [nilaTone, setNilaTone] = useState<NilaTone>(
    (['gentle','direct','balanced'].includes(profile?.nila_tone ?? '')
      ? profile!.nila_tone
      : 'balanced') as NilaTone
  )
  const [nilaMemory, setNilaMemory] = useState(profile?.nila_memory_enabled ?? true)
  const [nilaLimitReminder, setNilaLimitReminder] = useState(profile?.nila_limit_reminder ?? true)

  /* ── Notifications — initialised from DB ── */
  const [notifyEmail, setNotifyEmail] = useState(profile?.notify_email_updates ?? false)
  const [notifyEvents, setNotifyEvents] = useState(profile?.notify_event_reminders ?? true)
  const [notifyAllySessions, setNotifyAllySessions] = useState(profile?.notify_ally_reminders ?? true)

  /* ── Privacy — initialised from DB ── */
  const [anonymousMode, setAnonymousMode] = useState(profile?.anonymous_mode ?? false)

  /* ── Delete account ── */
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleting, startDelete] = useTransition()

  /* ── Sign out ── */
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)
  const [signingOut, startSignOut] = useTransition()

  /* ── Billing modal + actions ── */
  const [billingModal, setBillingModal] = useState<BillingAction | null>(null)
  const [billingMsg, setBillingMsg] = useState<string | null>(null)
  const [billingError, setBillingError] = useState<string | null>(null)
  const [billingPending, startBilling] = useTransition()

  /* ── Avatar upload ── */
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url ?? null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  /* ── Derived ── */
  const displayedName = displayName.trim() || fullName.trim() || firstName
  const avatarInitial = displayedName[0]?.toUpperCase() ?? userInitial
  const plan = profile?.plan ?? 'free'
  const tierLabel =
    plan === 'free' ? 'Member'
    : plan.charAt(0).toUpperCase() + plan.slice(1)

  function handleSave() {
    setSaved(false)
    setSaveError(null)
    startSaving(async () => {
      const result = await saveProfile({
        full_name: fullName,
        display_name: displayName,
        phone: phoneCode + phone.replace(/[\s\-()]/g, ''),
        phone_country_code: phoneCode,
        preferred_language: language,
        city,
      })
      if (result.error) {
        setSaveError(result.error)
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    })
  }

  /* Saves a single boolean/string setting immediately when toggled */
  function toggle<T extends string | boolean>(
    field: string,
    setter: (v: T) => void,
    prev: T,
    next: T,
  ) {
    setter(next)
    saveProfileSetting(field, next).catch(() => setter(prev))
  }

  function handleSignOut() {
    startSignOut(async () => {
      await signOut()
    })
  }

  function handleBillingConfirm() {
    if (!billingModal) return
    setBillingMsg(null)
    setBillingError(null)
    startBilling(async () => {
      let res: { error?: string }
      if (billingModal === 'cancel') res = await cancelSubscription()
      else if (billingModal === 'pause') res = await pauseSubscription()
      else if (billingModal === 'resume') res = await resumeSubscription()
      else res = await reactivateSubscription()

      setBillingModal(null)
      if (res.error) {
        setBillingError(res.error)
      } else {
        const msgs: Record<BillingAction, string> = {
          cancel: 'Cancellation scheduled — access continues until the billing period ends.',
          pause: 'Subscription paused. Billing is on hold.',
          resume: 'Subscription resumed.',
          reactivate: 'Subscription reactivated — you\'ll be renewed as usual.',
        }
        setBillingMsg(msgs[billingModal])
        router.refresh()
      }
    })
  }

  function handleDeleteAccount() {
    setDeleteError(null)
    startDelete(async () => {
      const res = await deleteAccount()
      if (res.error) {
        setDeleteError(res.error)
      } else {
        router.replace('/')
      }
    })
  }

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)
    const fd = new FormData()
    fd.append('avatar', file)
    const res = await uploadAvatar(fd)
    setUploading(false)
    if (res.error) {
      setUploadError(res.error)
    } else if (res.avatarUrl) {
      setAvatarUrl(res.avatarUrl)
    }
    // Reset so the same file can be re-selected after an error
    e.target.value = ''
  }

  return (
    <>
      {/* Billing confirm modal */}
      {billingModal && (
        <BillingConfirmModal
          action={billingModal}
          activeSub={activeSub}
          pending={billingPending}
          onConfirm={handleBillingConfirm}
          onClose={() => { if (!billingPending) setBillingModal(null) }}
        />
      )}

      {/* Sticky topbar */}
      <header className="ns-topbar ns-topbar--auth">
        <div className="ns-topbar__left">
          <div className="ns-topbar__greeting">Profile &amp; Settings</div>
          <div className="ns-topbar__sub">Your space, your way</div>
        </div>
      </header>

      <div className="ns-prof-body">
        <div className="ns-prof-body__inner">

          {/* ══════════════════════════════════
              SECTION 1 — Profile
          ══════════════════════════════════ */}
          <section className="ns-card ns-prof-section" aria-labelledby="profile-heading">
            <h2 id="profile-heading" className="ns-prof-section-title">Profile</h2>

            <div className="ns-prof-layout">
              {/* ── Avatar column ── */}
              <div className="ns-prof-avatar-col">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                  aria-label="Upload profile photo"
                />
                <div className="ns-prof-avatar-circle" aria-hidden="true">
                  {avatarUrl
                    ? (
                      <img
                        src={avatarUrl}
                        alt={displayedName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
                      />
                    )
                    : avatarInitial}
                </div>
                <button
                  className="ns-prof-avatar-change"
                  type="button"
                  aria-label="Change profile photo"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading…' : 'Change photo'}
                </button>
                {uploadError && (
                  <p className="ns-prof-save-error" style={{ textAlign: 'center', marginTop: 4 }}>{uploadError}</p>
                )}
                <div className="ns-prof-avatar-name">{displayedName}</div>
                <span className="ns-prof-tier">{tierLabel}</span>
              </div>

              {/* ── Fields column ── */}
              <div className="ns-prof-fields">
                <div className="ns-prof-grid">

                  {/* Full name */}
                  <div className="ns-su-field">
                    <label htmlFor="pf-full-name" className="ns-su-field-label">
                      Full name
                    </label>
                    <input
                      id="pf-full-name"
                      className="ns-su-input"
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Your full name"
                      autoComplete="name"
                    />
                  </div>

                  {/* Display / preferred name */}
                  <div className="ns-su-field">
                    <label htmlFor="pf-display-name" className="ns-su-field-label">
                      Preferred name
                    </label>
                    <input
                      id="pf-display-name"
                      className="ns-su-input"
                      type="text"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder="e.g. Mani"
                    />
                    <p className="ns-su-hint">What should Nila call you?</p>
                  </div>

                  {/* Email — read only */}
                  <div className="ns-su-field">
                    <label htmlFor="pf-email" className="ns-su-field-label">
                      Email
                      <span className="ns-prof-lock" aria-hidden="true">
                        <LockIcon />
                      </span>
                    </label>
                    <input
                      id="pf-email"
                      className="ns-su-input ns-su-input--readonly"
                      type="email"
                      value={email}
                      readOnly
                      tabIndex={-1}
                    />
                    <p className="ns-su-hint">
                      To change your email, contact support
                    </p>
                  </div>

                  {/* Phone */}
                  <div className="ns-su-field">
                    <label htmlFor="pf-phone" className="ns-su-field-label">
                      Phone{' '}
                      <span style={{ fontWeight: 400, opacity: 0.55 }}>(optional)</span>
                    </label>
                    <div className="ns-su-phone-row">
                      <select
                        className="ns-su-select"
                        value={phoneCode}
                        onChange={e => setPhoneCode(e.target.value)}
                        aria-label="Country code"
                      >
                        <option value="+91">+91</option>
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                        <option value="+65">+65</option>
                        <option value="+971">+971</option>
                        <option value="+61">+61</option>
                      </select>
                      <input
                        id="pf-phone"
                        className="ns-su-input"
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="Your number"
                        autoComplete="tel-national"
                      />
                    </div>
                  </div>

                  {/* Language */}
                  <div className="ns-su-field">
                    <label htmlFor="pf-language" className="ns-su-field-label">
                      Language
                    </label>
                    <select
                      id="pf-language"
                      className="ns-su-input"
                      style={{ cursor: 'pointer', WebkitAppearance: 'menulist-button', appearance: 'auto' }}
                      value={language}
                      onChange={e => setLanguage(e.target.value)}
                    >
                      <option value="english">English</option>
                      <option value="tamil">Tamil</option>
                      <option value="hindi">Hindi</option>
                    </select>
                    <p className="ns-su-hint">Nila speaks to you in this language</p>
                  </div>

                  {/* City */}
                  <div className="ns-su-field">
                    <label htmlFor="pf-city" className="ns-su-field-label">
                      City{' '}
                      <span style={{ fontWeight: 400, opacity: 0.55 }}>(optional)</span>
                    </label>
                    <input
                      id="pf-city"
                      className="ns-su-input"
                      type="text"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="e.g. Bangalore"
                      autoComplete="address-level2"
                    />
                    <p className="ns-su-hint">
                      Your city helps us show events near you
                    </p>
                  </div>
                </div>

                {/* Save row */}
                <div className="ns-prof-save-row">
                  {saveError && (
                    <p className="ns-prof-save-error" role="alert">{saveError}</p>
                  )}
                  {saved && (
                    <span className="ns-prof-save-success" aria-live="polite">
                      <CheckIcon />
                      Saved
                    </span>
                  )}
                  <button
                    className="ns-btn ns-btn--primary ns-prof-save-btn"
                    onClick={handleSave}
                    disabled={saving}
                    type="button"
                  >
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════
              SECTION 2 — Settings
          ══════════════════════════════════ */}
          <section className="ns-card ns-prof-section" aria-labelledby="settings-heading">
            <h2 id="settings-heading" className="ns-prof-section-title">Settings</h2>

            {/* ── Nila Preferences ── */}
            <div className="ns-prof-set-group">
              <div className="ns-prof-set-group-label">Nila preferences</div>

              {/* Tone — segmented control */}
              <div className="ns-prof-set-item ns-prof-set-item--col">
                <div className="ns-prof-set-body">
                  <div className="ns-prof-set-label">Conversation tone</div>
                  <div className="ns-prof-set-sub">How you&rsquo;d like Nila to speak with you</div>
                </div>
                <div
                  className="ns-seg ns-prof-tone-seg"
                  role="group"
                  aria-label="Conversation tone"
                >
                  {(['gentle', 'direct', 'balanced'] as NilaTone[]).map(t => (
                    <button
                      key={t}
                      className={`ns-seg__btn${nilaTone === t ? ' is-active' : ''}`}
                      onClick={() => toggle('nila_tone', setNilaTone, nilaTone, t)}
                      type="button"
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Memory */}
              <ToggleRow
                label="Memory"
                sub="Let Nila remember across sessions"
                checked={nilaMemory}
                onToggle={() => toggle('nila_memory_enabled', setNilaMemory, nilaMemory, !nilaMemory)}
              />

              {/* Limit reminder */}
              <ToggleRow
                label="Daily message limit reminder"
                sub="Remind me when I'm near my limit"
                checked={nilaLimitReminder}
                onToggle={() => toggle('nila_limit_reminder', setNilaLimitReminder, nilaLimitReminder, !nilaLimitReminder)}
              />
            </div>

            {/* ── Notifications ── */}
            <div className="ns-prof-set-group">
              <div className="ns-prof-set-group-label">Notifications</div>

              <ToggleRow
                label="Email updates from Nest"
                checked={notifyEmail}
                onToggle={() => toggle('notify_email_updates', setNotifyEmail, notifyEmail, !notifyEmail)}
              />
              <ToggleRow
                label="Event reminders"
                checked={notifyEvents}
                onToggle={() => toggle('notify_event_reminders', setNotifyEvents, notifyEvents, !notifyEvents)}
              />
              <ToggleRow
                label="Session reminders from Allies"
                checked={notifyAllySessions}
                onToggle={() => toggle('notify_ally_reminders', setNotifyAllySessions, notifyAllySessions, !notifyAllySessions)}
              />
            </div>

            {/* ── Privacy ── */}
            <div className="ns-prof-set-group">
              <div className="ns-prof-set-group-label">Privacy</div>

              <ToggleRow
                label="Anonymous mode"
                sub="Hide your name from Allies during sessions"
                checked={anonymousMode}
                onToggle={() => toggle('anonymous_mode', setAnonymousMode, anonymousMode, !anonymousMode)}
              />

              {/* Data export */}
              <div className="ns-prof-set-item">
                <div className="ns-prof-set-body">
                  <div className="ns-prof-set-label">Your information</div>
                  <div className="ns-prof-set-sub">
                    Get a copy of everything we hold about you
                  </div>
                </div>
                <div className="ns-prof-set-ctrl">
                  <button type="button" className="ns-link ns-link--quiet">
                    Request a copy
                  </button>
                </div>
              </div>

              {/* Delete account */}
              <div className="ns-prof-set-item ns-prof-set-item--delete">
                <div className="ns-prof-set-body">
                  <div className="ns-prof-set-label">Delete account</div>
                </div>
                {!showDeleteConfirm && (
                  <div className="ns-prof-set-ctrl">
                    <button
                      type="button"
                      className="ns-prof-danger-link"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      Delete my account
                    </button>
                  </div>
                )}
              </div>

              {showDeleteConfirm && (
                <div className="ns-prof-delete-confirm" role="alert">
                  <p className="ns-prof-delete-copy">
                    We&rsquo;ll be sad to see you go. This can&rsquo;t be undone — your account and all data will be permanently removed.
                  </p>
                  {deleteError && (
                    <p className="ns-prof-save-error" role="alert" style={{ marginBottom: 8 }}>{deleteError}</p>
                  )}
                  <div className="ns-prof-delete-actions">
                    <button
                      type="button"
                      className="ns-btn ns-btn--ghost ns-btn--sm"
                      onClick={() => { setShowDeleteConfirm(false); setDeleteError(null) }}
                      disabled={deleting}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="ns-btn ns-btn--sm"
                      style={{ background: 'rgba(155,102,81,0.14)', color: 'var(--terracotta)', border: '1px solid rgba(155,102,81,0.25)' }}
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                    >
                      {deleting ? 'Deleting…' : 'Confirm deletion'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Account ── */}
            <div className="ns-prof-set-group">
              <div className="ns-prof-set-group-label">Account</div>

              {/* Current plan */}
              <div className="ns-prof-set-item">
                <div className="ns-prof-set-body">
                  <div className="ns-prof-set-label">Current plan</div>
                  <div className="ns-prof-set-sub">
                    {plan === 'free'
                      ? 'Free · 20 messages per day'
                      : `${tierLabel} · ${subStatusLabel(activeSub)}`}
                  </div>
                  {activeSub?.periodEnd && (
                    <div className="ns-prof-set-sub" style={{ marginTop: 2 }}>
                      {activeSub.cancelAtEnd
                        ? `Access ends ${formatSubDate(activeSub.periodEnd)}`
                        : activeSub.status === 'paused'
                          ? 'Paused — billing on hold'
                          : `Renews ${formatSubDate(activeSub.periodEnd)}`}
                    </div>
                  )}
                </div>
                <div className="ns-prof-set-ctrl">
                  {plan === 'free'
                    ? <a href="/plans" className="ns-link">Upgrade</a>
                    : <a href="/plans" className="ns-link ns-link--quiet">View plans</a>
                  }
                </div>
              </div>

              {/* Subscription management actions */}
              {activeSub && plan !== 'free' && (
                <div className="ns-prof-set-item">
                  <div className="ns-prof-set-body">
                    {billingMsg && (
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--deep-pine, #2F4C3A)' }} aria-live="polite">
                        {billingMsg}
                      </p>
                    )}
                    {billingError && (
                      <p className="ns-prof-save-error" role="alert">{billingError}</p>
                    )}
                  </div>
                  <div className="ns-prof-set-ctrl" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {activeSub.status === 'active' && !activeSub.cancelAtEnd && (
                      <>
                        <button
                          type="button"
                          className="ns-link ns-link--quiet"
                          disabled={billingPending}
                          onClick={() => setBillingModal('pause')}
                        >
                          Pause
                        </button>
                        <button
                          type="button"
                          className="ns-prof-danger-link"
                          disabled={billingPending}
                          onClick={() => setBillingModal('cancel')}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {activeSub.cancelAtEnd && (
                      <button
                        type="button"
                        className="ns-link"
                        disabled={billingPending}
                        onClick={() => setBillingModal('reactivate')}
                      >
                        Keep my subscription
                      </button>
                    )}
                    {activeSub.status === 'paused' && !activeSub.cancelAtEnd && (
                      <button
                        type="button"
                        className="ns-link"
                        disabled={billingPending}
                        onClick={() => setBillingModal('resume')}
                      >
                        Resume subscription
                      </button>
                    )}
                    {activeSub.status === 'halted' && (
                      <a href="/plans" className="ns-link">Update payment</a>
                    )}
                  </div>
                </div>
              )}

              {/* Sign out */}
              <div className="ns-prof-signout-row">
                {!showSignOutConfirm ? (
                  <button
                    type="button"
                    className="ns-prof-signout-btn"
                    onClick={() => setShowSignOutConfirm(true)}
                  >
                    <SignOutIcon />
                    Sign out
                  </button>
                ) : (
                  <div className="ns-prof-signout-confirm">
                    <p className="ns-prof-delete-copy">
                      You can always come back. Take your time.
                    </p>
                    <div className="ns-prof-delete-actions">
                      <button
                        type="button"
                        className="ns-btn ns-btn--ghost ns-btn--sm"
                        onClick={() => setShowSignOutConfirm(false)}
                        disabled={signingOut}
                      >
                        Stay
                      </button>
                      <button
                        type="button"
                        className="ns-btn ns-btn--sm"
                        style={{ background: 'var(--pine-tint)', color: 'var(--deep-pine)', border: '1px solid rgba(92,122,102,0.3)' }}
                        onClick={handleSignOut}
                        disabled={signingOut}
                      >
                        {signingOut ? 'Signing out…' : 'Yes, sign out'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

/* ── Billing types ── */

type BillingAction = 'cancel' | 'pause' | 'resume' | 'reactivate'

/* ── Billing confirm modal ── */

interface BillingModalConfig {
  icon: ReactElement
  title: string
  body: string
  note: ((sub: ActiveSub | null) => string | null) | null
  confirmLabel: string
  danger?: boolean
}

const BILLING_CONFIG: Record<BillingAction, BillingModalConfig> = {
  cancel: {
    icon: <CalendarXIcon />,
    title: 'Cancel your subscription?',
    body: "You'll keep full access to all features until the end of your current billing period. After that, your account reverts to the free plan.",
    note: (sub) => sub?.periodEnd ? `Access continues until ${formatSubDate(sub.periodEnd)}` : null,
    confirmLabel: 'Yes, cancel',
    danger: true,
  },
  pause: {
    icon: <PauseCircleIcon />,
    title: 'Pause your subscription?',
    body: "Billing pauses immediately. You'll retain access until your current period ends, then access pauses too.",
    note: (sub) => sub?.periodEnd ? `Current period ends ${formatSubDate(sub.periodEnd)}` : null,
    confirmLabel: 'Pause billing',
  },
  resume: {
    icon: <PlayCircleIcon />,
    title: 'Resume your subscription?',
    body: "Billing resumes from today and you regain full access to all features immediately.",
    note: null,
    confirmLabel: 'Resume now',
  },
  reactivate: {
    icon: <RefreshIcon />,
    title: 'Keep your subscription?',
    body: "Your scheduled cancellation will be removed. Billing continues as normal at the next renewal date.",
    note: null,
    confirmLabel: 'Keep my subscription',
  },
}

function BillingConfirmModal({
  action,
  activeSub,
  pending,
  onConfirm,
  onClose,
}: {
  action: BillingAction
  activeSub: ActiveSub | null
  pending: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  const cfg = BILLING_CONFIG[action]
  const note = cfg.note?.(activeSub) ?? null

  return (
    <div
      className="ns-billing-overlay"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="ns-billing-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="billing-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`ns-billing-modal__icon${cfg.danger ? ' ns-billing-modal__icon--warn' : ''}`}>
          {cfg.icon}
        </div>
        <h2 id="billing-modal-title" className="ns-billing-modal__title">
          {cfg.title}
        </h2>
        <p className="ns-billing-modal__body">{cfg.body}</p>
        {note && (
          <div className={`ns-billing-modal__note${cfg.danger ? ' ns-billing-modal__note--warn' : ''}`}>
            <CalendarIcon />
            {note}
          </div>
        )}
        <div className="ns-billing-modal__actions">
          <button
            type="button"
            className="ns-btn ns-btn--ghost"
            onClick={onClose}
            disabled={pending}
          >
            Not now
          </button>
          <button
            type="button"
            className={cfg.danger ? 'ns-billing-modal__btn--danger' : 'ns-btn ns-btn--primary'}
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? 'Working…' : cfg.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Billing helpers ── */

function subStatusLabel(sub: ActiveSub | null): string {
  if (!sub) return 'Inactive'
  if (sub.status === 'paused') return 'Paused'
  if (sub.status === 'halted') return 'Payment failed'
  if (sub.cancelAtEnd) return 'Active until period end'
  return 'Active'
}

function formatSubDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

/* ── Sub-components ── */

function ToggleRow({
  label,
  sub,
  checked,
  onToggle,
}: {
  label: string
  sub?: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <div className="ns-prof-set-item">
      <div className="ns-prof-set-body">
        <div className="ns-prof-set-label">{label}</div>
        {sub && <div className="ns-prof-set-sub">{sub}</div>}
      </div>
      <div className="ns-prof-set-ctrl">
        <button
          role="switch"
          aria-checked={checked}
          className={`ns-toggle${checked ? ' is-on' : ''}`}
          onClick={onToggle}
          type="button"
          aria-label={label}
        />
      </div>
    </div>
  )
}

/* ── Inline SVGs ── */

function LockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="2.5" y="6" width="9" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4.5 6 V4.5 A2.5 2.5 0 0 1 9.5 4.5 V6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 7.5 L5.5 10 L11 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SignOutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 3 H12.5 Q13.5 3 13.5 4 V12 Q13.5 13 12.5 13 H10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M7 8 H2.5 M2.5 8 L5 5.5 M2.5 8 L5 10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CalendarXIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 15l6-4M9 11l6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function PauseCircleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9.5 8.5v7M14.5 8.5v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function PlayCircleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 8.5l6 3.5-6 3.5V8.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12a8 8 0 0 1 14.4-4.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20 12a8 8 0 0 1-14.4 4.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M17.8 6.5L18.5 7.8 20 7.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.2 17.5L5.5 16.2 4 16.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <rect x="1.5" y="3" width="13" height="11.5" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1.5 7h13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M5 1.5v3M11 1.5v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
