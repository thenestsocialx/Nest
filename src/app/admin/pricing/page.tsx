'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { savePlan, saveNestConfig } from './actions'
import './pricing.css'

interface PlanRow {
  id: string
  name: string
  price_inr: number
  tag: string
  features: string[]
  cta: string
  is_featured: boolean
  razorpay_plan_id: string | null
  display_order: number
}

interface PlanEdits {
  name: string
  price_inr: string
  tag: string
  features: string
  cta: string
  is_featured: boolean
  razorpay_plan_id: string
}

type ActiveTab = 'pricing' | 'limits' | 'dunning'

const CONFIG_KEYS = [
  'nila.free_daily_message_limit',
  'nila.core_message_limit',
  'nila.premium_message_limit',
  'nila.limit_reset_period',
  'plan.ally_sessions.core',
  'plan.ally_sessions.premium',
  'plan.dunning.grace_period_days',
  'plan.dunning.max_retries',
  'plan.price_inr_annual.core',
  'plan.price_inr_annual.premium',
]

const LIMIT_KEYS     = ['nila.free_daily_message_limit', 'nila.core_message_limit', 'nila.premium_message_limit', 'nila.limit_reset_period']
const ALLY_KEYS      = ['plan.ally_sessions.core', 'plan.ally_sessions.premium']
const ALL_LIMIT_KEYS = [...LIMIT_KEYS, ...ALLY_KEYS]
const DUNNING_KEYS   = ['plan.dunning.grace_period_days', 'plan.dunning.max_retries']

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('pricing')
  const [plans, setPlans]         = useState<PlanRow[]>([])
  const [planEdits, setPlanEdits] = useState<Record<string, PlanEdits>>({})
  const [configEdits, setConfigEdits] = useState<Record<string, string>>({})
  const [savedConfig, setSavedConfig] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [msgs, setMsgs]     = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Both plans and nest_config are readable by authenticated users via RLS
    const supabase = createClient()
    Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).from('plans').select('*').order('display_order'),
      supabase.from('nest_config').select('key, value').in('key', CONFIG_KEYS),
    ]).then(([plansRes, configRes]) => {
      const plansData = plansRes.data as PlanRow[] | null
      if (plansData) {
        setPlans(plansData)
        const edits: Record<string, PlanEdits> = {}
        plansData.forEach((p) => {
          edits[p.id] = {
            name: p.name,
            price_inr: String(p.price_inr),
            tag: p.tag,
            features: (p.features as string[]).join('\n'),
            cta: p.cta,
            is_featured: p.is_featured,
            razorpay_plan_id: p.razorpay_plan_id ?? '',
          }
        })
        setPlanEdits(edits)
      }
      if (configRes.data) {
        const map: Record<string, string> = {}
        ;(configRes.data as { key: string; value: string }[]).forEach((r) => { map[r.key] = r.value })
        setSavedConfig(map)
        setConfigEdits({ ...map })
      }
      setLoading(false)
    })
  }, [])

  function flash(key: string, msg: string) {
    setMsgs((p) => ({ ...p, [key]: msg }))
    setTimeout(() => setMsgs((p) => { const n = { ...p }; delete n[key]; return n }), 3000)
  }
  function setPE(id: string, field: keyof PlanEdits, value: string | boolean) {
    setPlanEdits((p) => ({ ...p, [id]: { ...p[id], [field]: value } }))
  }
  function setCfg(key: string, value: string) {
    setConfigEdits((p) => ({ ...p, [key]: value }))
  }
  function isDirty(key: string) { return configEdits[key] !== savedConfig[key] }
  function isUnlimited(key: string) { return parseInt(configEdits[key] || '0', 10) >= 999 }

  // Annual price helpers
  function annualKey(planId: string) { return `plan.price_inr_annual.${planId}` }
  function annualValue(planId: string, monthlyStr: string) {
    const stored = configEdits[annualKey(planId)]
    if (stored) return stored
    const mo = parseInt(monthlyStr || '0', 10)
    return mo > 0 ? String(Math.round(mo * 12 * 0.8)) : ''
  }
  function discountPct(planId: string, monthlyStr: string): number {
    const mo = parseInt(monthlyStr || '0', 10)
    const yr = parseInt(configEdits[annualKey(planId)] || annualValue(planId, monthlyStr) || '0', 10)
    if (mo <= 0 || yr <= 0) return 0
    return Math.round((1 - yr / (mo * 12)) * 100)
  }

  async function handleSaveAllPlans() {
    setSaving((p) => ({ ...p, __plans__: true }))
    const results = await Promise.all(plans.map(async (plan) => {
      const e = planEdits[plan.id]
      if (!e) return { error: undefined }
      const r = await savePlan(plan.id, {
        name: e.name.trim(),
        price_inr: Math.max(0, parseInt(e.price_inr, 10) || 0),
        tag: e.tag.trim(),
        features: e.features.split('\n').map((f) => f.trim()).filter(Boolean),
        cta: e.cta.trim(),
        is_featured: e.is_featured,
        razorpay_plan_id: e.razorpay_plan_id.trim() || null,
      })
      if (r.error) return r
      if (plan.id !== 'free') {
        const av = configEdits[annualKey(plan.id)] || annualValue(plan.id, e.price_inr)
        if (av) return saveNestConfig(annualKey(plan.id), av)
      }
      return r
    }))
    const err = results.find((r) => r.error)?.error
    setSaving((p) => ({ ...p, __plans__: false }))
    flash('__plans__', err ?? 'Pricing saved.')
  }

  async function handleSaveMany(keys: string[], flashKey: string) {
    setSaving((p) => ({ ...p, [flashKey]: true }))
    const results = await Promise.all(keys.map((k) => saveNestConfig(k, configEdits[k] ?? '')))
    const err = results.find((r) => r.error)?.error
    setSaving((p) => ({ ...p, [flashKey]: false }))
    if (!err) setSavedConfig((p) => { const n = { ...p }; keys.forEach((k) => { n[k] = configEdits[k] ?? '' }); return n })
    flash(flashKey, err ?? 'Saved.')
  }

  function discardPlans() {
    const edits: Record<string, PlanEdits> = {}
    plans.forEach((p) => {
      edits[p.id] = {
        name: p.name, price_inr: String(p.price_inr), tag: p.tag,
        features: (p.features as string[]).join('\n'), cta: p.cta,
        is_featured: p.is_featured, razorpay_plan_id: p.razorpay_plan_id ?? '',
      }
    })
    setPlanEdits(edits)
    setConfigEdits((prev) => {
      const n = { ...prev }
      ;['plan.price_inr_annual.core', 'plan.price_inr_annual.premium'].forEach((k) => { n[k] = savedConfig[k] ?? '' })
      return n
    })
  }

  function discardTab(keys: string[]) {
    setConfigEdits((p) => { const n = { ...p }; keys.forEach((k) => { n[k] = savedConfig[k] ?? '' }); return n })
  }

  if (loading) return <div style={{ padding: 40, color: 'var(--deep-pine)', fontSize: 14 }}>Loading…</div>

  const TABS: { id: ActiveTab; label: string }[] = [
    { id: 'pricing', label: 'Plan pricing' },
    { id: 'limits',  label: 'Usage limits' },
    { id: 'dunning', label: 'Grace & dunning' },
  ]

  return (
    <div className="pricing-pg">

      {/* ── Tab navigation ── */}
      <div className="tab-row" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={activeTab === t.id}
            className={`tab-btn${activeTab === t.id ? ' tab-active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════ PRICING PANE ══════════════ */}
      {activeTab === 'pricing' && (
        <div>
          <div className="section-head">
            <div className="section-title">Monthly pricing</div>
            <div className="section-sub">Prices shown to users on the plans page. Annual price is stored separately and used for yearly checkout.</div>
          </div>

          <div className="plan-grid">
            {plans.map((plan) => {
              const e = planEdits[plan.id]
              if (!e) return null
              const mo = parseInt(e.price_inr || '0', 10)
              const disc = plan.id !== 'free' ? discountPct(plan.id, e.price_inr) : 0

              return (
                <div
                  key={plan.id}
                  className={[
                    'plan-card',
                    e.is_featured ? 'featured' : '',
                    plan.id === 'free' ? 'disabled-plan' : '',
                  ].filter(Boolean).join(' ')}
                >
                  {e.is_featured && <div className="popular-tag">Most popular</div>}

                  {/* Header row */}
                  <div className="plan-card-top">
                    <div className="plan-name-row">
                      <div className={`plan-dot dot-${plan.id}`} />
                      <span className="plan-name">{e.name || plan.id}</span>
                    </div>
                    <span
                      className="stripe-badge"
                      title={e.razorpay_plan_id || undefined}
                      style={{ background: e.razorpay_plan_id ? 'rgba(47,76,58,0.08)' : undefined }}
                    >
                      {plan.id === 'free'
                        ? 'No Razorpay plan'
                        : e.razorpay_plan_id
                          ? e.razorpay_plan_id.substring(0, 16) + (e.razorpay_plan_id.length > 16 ? '…' : '')
                          : 'Not linked'}
                    </span>
                  </div>

                  {/* Live price preview */}
                  <div className="plan-price-display">
                    <span className="p-currency">₹</span>
                    <span className="p-amount">{mo > 0 ? mo.toLocaleString('en-IN') : '0'}</span>
                    <span className="p-period"> /month</span>
                  </div>

                  {/* Description (tagline) */}
                  <div className="plan-desc">{e.tag || <span style={{ opacity: 0.4 }}>Add a tagline…</span>}</div>

                  {/* Monthly price input */}
                  <label className="field-label">Monthly price (₹)</label>
                  <div className="price-field">
                    <span className="price-sym">₹</span>
                    <input
                      className="price-inp"
                      type="number" min={0}
                      value={e.price_inr}
                      disabled={plan.id === 'free'}
                      onChange={(ev) => setPE(plan.id, 'price_inr', ev.target.value)}
                    />
                  </div>

                  {/* Annual price + discount */}
                  {plan.id !== 'free' && (
                    <>
                      <div className="annual-label-row">
                        <label className="field-label" style={{ marginBottom: 0 }}>Annual price (₹ / year)</label>
                      </div>
                      <div className="annual-row">
                        <input
                          className="annual-inp"
                          type="number" min={0}
                          value={configEdits[annualKey(plan.id)] ?? annualValue(plan.id, e.price_inr)}
                          onChange={(ev) => setCfg(annualKey(plan.id), ev.target.value)}
                        />
                        {disc > 0 && <span className="discount-tag">{disc}% off</span>}
                      </div>
                    </>
                  )}

                  {/* Extra fields */}
                  <div className="plan-extra">
                    <div className="compact-field">
                      <label className="field-label" style={{ marginBottom: 0 }}>Name</label>
                      <input className="compact-inp" value={e.name} onChange={(ev) => setPE(plan.id, 'name', ev.target.value)} />
                    </div>
                    <div className="compact-field">
                      <label className="field-label" style={{ marginBottom: 0 }}>Tagline</label>
                      <input className="compact-inp" value={e.tag} onChange={(ev) => setPE(plan.id, 'tag', ev.target.value)} />
                    </div>
                    <div className="compact-field">
                      <label className="field-label" style={{ marginBottom: 0 }}>Features (one per line)</label>
                      <textarea className="compact-textarea" rows={3} value={e.features} onChange={(ev) => setPE(plan.id, 'features', ev.target.value)} />
                    </div>
                    <div className="compact-field">
                      <label className="field-label" style={{ marginBottom: 0 }}>CTA button</label>
                      <input className="compact-inp" value={e.cta} onChange={(ev) => setPE(plan.id, 'cta', ev.target.value)} />
                    </div>
                    {plan.id !== 'free' && (
                      <div className="compact-field">
                        <label className="field-label" style={{ marginBottom: 0 }}>Razorpay Plan ID</label>
                        <input
                          className="compact-inp"
                          value={e.razorpay_plan_id}
                          placeholder="plan_… (from Razorpay Dashboard → Subscriptions → Plans)"
                          onChange={(ev) => setPE(plan.id, 'razorpay_plan_id', ev.target.value)}
                        />
                      </div>
                    )}
                    <div className="featured-row">
                      <span>Featured (highlighted)</span>
                      <label className="ns-toggle">
                        <input type="checkbox" checked={e.is_featured} onChange={(ev) => setPE(plan.id, 'is_featured', ev.target.checked)} />
                        <div className="ns-toggle__track" />
                        <div className="ns-toggle__thumb" />
                      </label>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="save-bar">
            <div className="save-hint">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><circle cx="7" cy="7" r="5.5"/><path d="M7 5v2.5M7 9v.2"/></svg>
              Saving updates the plans table and nest_config immediately — no redeploy needed
            </div>
            <div className="save-actions">
              <button className="btn-discard" onClick={discardPlans}>Discard changes</button>
              <button
                className="btn-save-tab"
                disabled={!!saving['__plans__']}
                onClick={handleSaveAllPlans}
              >
                {saving['__plans__'] ? 'Saving…' : 'Save pricing'}
              </button>
            </div>
          </div>
          {msgs['__plans__'] && (
            <div className={msgs['__plans__'] === 'Pricing saved.' ? 'flash-ok' : 'flash-err'} style={{ marginTop: 8 }}>
              {msgs['__plans__']}
            </div>
          )}
        </div>
      )}

      {/* ══════════════ LIMITS PANE ══════════════ */}
      {activeTab === 'limits' && (
        <div>
          {/* Nila chat messages */}
          <div className="limits-card">
            <div className="limits-card-header">
              <div>
                <div className="limits-card-title">Nila chat messages</div>
                <div className="limits-card-sub">Cap per reset period per user. Toggle ∞ to remove the limit for a plan.</div>
              </div>
              <div className="segment-wrap">
                {(['daily', 'weekly'] as const).map((opt) => (
                  <button
                    key={opt}
                    className={`seg${configEdits['nila.limit_reset_period'] === opt ? ' seg-on' : ''}`}
                    onClick={() => setCfg('nila.limit_reset_period', opt)}
                  >
                    {opt === 'daily' ? 'Daily (midnight)' : 'Weekly (Mon)'}
                  </button>
                ))}
              </div>
            </div>
            <table className="limits-table">
              <thead>
                <tr>
                  <th style={{ width: '46%' }}>Setting</th>
                  <th><div className="th-plan"><div className="th-dot dot-free" />Free</div></th>
                  <th><div className="th-plan"><div className="th-dot dot-core" />Core</div></th>
                  <th><div className="th-plan"><div className="th-dot dot-premium" />Premium</div></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="row-label">Messages per period</div>
                    <div className="row-hint">Hard limit before the upgrade nudge appears</div>
                  </td>
                  <td>
                    <input
                      className="lim-input"
                      type="number" min={1}
                      value={configEdits['nila.free_daily_message_limit'] ?? '10'}
                      onChange={(ev) => setCfg('nila.free_daily_message_limit', ev.target.value)}
                    />
                  </td>
                  <td>
                    {isUnlimited('nila.core_message_limit') ? (
                      <button className="inf-toggle inf-on" onClick={() => setCfg('nila.core_message_limit', '50')}>
                        ∞ Unlimited
                      </button>
                    ) : (
                      <div className="lim-cell">
                        <input
                          className="lim-input"
                          type="number" min={1}
                          value={configEdits['nila.core_message_limit'] ?? '50'}
                          onChange={(ev) => setCfg('nila.core_message_limit', ev.target.value)}
                        />
                        <button className="inf-toggle" onClick={() => setCfg('nila.core_message_limit', '999')}>∞</button>
                      </div>
                    )}
                  </td>
                  <td>
                    {isUnlimited('nila.premium_message_limit') ? (
                      <button className="inf-toggle inf-on" onClick={() => setCfg('nila.premium_message_limit', '50')}>
                        ∞ Unlimited
                      </button>
                    ) : (
                      <div className="lim-cell">
                        <input
                          className="lim-input"
                          type="number" min={1}
                          value={configEdits['nila.premium_message_limit'] ?? '50'}
                          onChange={(ev) => setCfg('nila.premium_message_limit', ev.target.value)}
                        />
                        <button className="inf-toggle" onClick={() => setCfg('nila.premium_message_limit', '999')}>∞</button>
                      </div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Ally sessions */}
          <div className="limits-card">
            <div className="limits-card-header">
              <div>
                <div className="limits-card-title">Ally sessions</div>
                <div className="limits-card-sub">Human listener sessions per calendar month</div>
              </div>
            </div>
            <table className="limits-table">
              <thead>
                <tr>
                  <th style={{ width: '46%' }}>Setting</th>
                  <th><div className="th-plan"><div className="th-dot dot-free" />Free</div></th>
                  <th><div className="th-plan"><div className="th-dot dot-core" />Core</div></th>
                  <th><div className="th-plan"><div className="th-dot dot-premium" />Premium</div></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="row-label">Sessions per month</div>
                    <div className="row-hint">Free plan has no Ally access</div>
                  </td>
                  <td><span className="locked-badge">No access</span></td>
                  <td>
                    <input
                      className="lim-input"
                      type="number" min={0}
                      value={configEdits['plan.ally_sessions.core'] ?? '1'}
                      onChange={(ev) => setCfg('plan.ally_sessions.core', ev.target.value)}
                    />
                  </td>
                  <td>
                    {isUnlimited('plan.ally_sessions.premium') ? (
                      <button className="inf-toggle inf-on" onClick={() => setCfg('plan.ally_sessions.premium', '4')}>
                        ∞ Unlimited
                      </button>
                    ) : (
                      <div className="lim-cell">
                        <input
                          className="lim-input"
                          type="number" min={0}
                          value={configEdits['plan.ally_sessions.premium'] ?? '4'}
                          onChange={(ev) => setCfg('plan.ally_sessions.premium', ev.target.value)}
                        />
                        <button className="inf-toggle" onClick={() => setCfg('plan.ally_sessions.premium', '999')}>∞</button>
                      </div>
                    )}
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="row-label">Matching queue priority</div>
                    <div className="row-hint">How the matching engine ranks session requests</div>
                  </td>
                  <td><span className="locked-badge">No access</span></td>
                  <td><span className="standard-badge">Standard</span></td>
                  <td><span className="priority-badge">Priority</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="save-bar">
            <div className="save-hint">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><circle cx="7" cy="7" r="5.5"/><path d="M7 5v2.5M7 9v.2"/></svg>
              Limit changes apply immediately to all new sessions
            </div>
            <div className="save-actions">
              <button className="btn-discard" onClick={() => discardTab(ALL_LIMIT_KEYS)}>Discard changes</button>
              <button
                className="btn-save-tab"
                disabled={!!saving['__limits__'] || ALL_LIMIT_KEYS.every((k) => !isDirty(k))}
                onClick={() => handleSaveMany(ALL_LIMIT_KEYS, '__limits__')}
              >
                {saving['__limits__'] ? 'Saving…' : 'Save limits'}
              </button>
            </div>
          </div>
          {msgs['__limits__'] && (
            <div className={msgs['__limits__'] === 'Saved.' ? 'flash-ok' : 'flash-err'} style={{ marginTop: 8 }}>
              {msgs['__limits__']}
            </div>
          )}
        </div>
      )}

      {/* ══════════════ DUNNING PANE ══════════════ */}
      {activeTab === 'dunning' && (
        <div>
          <div className="section-head">
            <div className="section-title">Grace period &amp; dunning</div>
            <div className="section-sub">Controls what happens when a subscription payment fails. Razorpay handles retries — this defines fallback behaviour after retries are exhausted and the subscription is halted.</div>
          </div>

          <div className="dunning-grid">
            <div className="form-card">
              <div className="form-card-title">Grace period</div>
              <div className="form-card-sub">How long a user retains paid access after a failed payment before being downgraded.</div>
              <div className="form-row">
                <label className="form-label">Grace period (days)</label>
                <input
                  className="form-inp"
                  type="number" min={0}
                  value={configEdits['plan.dunning.grace_period_days'] ?? ''}
                  placeholder="e.g. 7"
                  onChange={(ev) => setCfg('plan.dunning.grace_period_days', ev.target.value)}
                />
              </div>
              <div className="form-row">
                <label className="form-label">Max payment retries</label>
                <input
                  className="form-inp"
                  type="number" min={0}
                  value={configEdits['plan.dunning.max_retries'] ?? ''}
                  placeholder="e.g. 3"
                  onChange={(ev) => setCfg('plan.dunning.max_retries', ev.target.value)}
                />
              </div>
            </div>

            <div className="form-card">
              <div className="form-card-title">Downgrade behaviour</div>
              <div className="form-card-sub">What happens when Razorpay halts the subscription after exhausting retries.</div>
              <div className="form-row">
                <label className="form-label">Downgrade to</label>
                <select className="form-select" disabled>
                  <option>Free plan</option>
                  <option>Pause account</option>
                </select>
              </div>
              <div className="form-row">
                <label className="form-label">Re-activation rule</label>
                <select className="form-select" disabled>
                  <option>Immediate on payment</option>
                  <option>Next billing cycle</option>
                  <option>Manual review required</option>
                </select>
              </div>
            </div>
          </div>

          <div className="save-bar" style={{ marginTop: '1.25rem' }}>
            <div className="save-hint warn">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><path d="M7 1.5L1.5 12h11L7 1.5z"/><path d="M7 6v2.5M7 10v.2"/></svg>
              These changes affect all active subscribers immediately
            </div>
            <div className="save-actions">
              <button className="btn-discard" onClick={() => discardTab(DUNNING_KEYS)}>Discard changes</button>
              <button
                className="btn-save-tab"
                disabled={!!saving['__dunning__'] || DUNNING_KEYS.every((k) => !isDirty(k))}
                onClick={() => handleSaveMany(DUNNING_KEYS, '__dunning__')}
              >
                {saving['__dunning__'] ? 'Saving…' : 'Save dunning config'}
              </button>
            </div>
          </div>
          {msgs['__dunning__'] && (
            <div className={msgs['__dunning__'] === 'Saved.' ? 'flash-ok' : 'flash-err'} style={{ marginTop: 8 }}>
              {msgs['__dunning__']}
            </div>
          )}
        </div>
      )}

    </div>
  )
}
