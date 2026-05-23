export default function PricingPage() {
  return (
    <>
      {/* Notice */}
      <div className="ns-notice">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--ns-forest)" strokeWidth="1.4" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="8" cy="8" r="6"/><path d="M8 7v4M8 5.5V6"/>
        </svg>
        <span>Changes here update the <code>platform_config</code> table in Supabase and take effect immediately — no redeploy needed.</span>
      </div>

      {/* Plan cards */}
      <div>
        <div className="ns-section-hd">
          <h2>Plan configuration</h2>
        </div>
        <div className="ns-plan-grid">
          <div className="ns-plan">
            <div className="ns-plan__tier">Free</div>
            <div className="ns-plan__price">₹0<span className="ns-plan__price-unit">/month</span></div>
            <div className="ns-plan__features">
              <div className="ns-plan__feat">Limited Nila messages/day</div>
              <div className="ns-plan__feat">No Ally access</div>
              <div className="ns-plan__feat">Public resources only</div>
              <div className="ns-plan__feat">No event access</div>
            </div>
          </div>
          <div className="ns-plan ns-plan--featured">
            <div className="ns-plan__badge">Most popular</div>
            <div className="ns-plan__tier">Core</div>
            <div className="ns-plan__price">₹499<span className="ns-plan__price-unit">/month</span></div>
            <div className="ns-plan__features">
              <div className="ns-plan__feat">Unlimited Nila messages</div>
              <div className="ns-plan__feat">1 Ally session/month</div>
              <div className="ns-plan__feat">Full resources library</div>
              <div className="ns-plan__feat">Weekend events access</div>
            </div>
          </div>
          <div className="ns-plan">
            <div className="ns-plan__tier">Premium</div>
            <div className="ns-plan__price">₹999<span className="ns-plan__price-unit">/month</span></div>
            <div className="ns-plan__features">
              <div className="ns-plan__feat">Unlimited everything</div>
              <div className="ns-plan__feat">Priority Ally matching</div>
              <div className="ns-plan__feat">Voice notes with Nila</div>
              <div className="ns-plan__feat">Exclusive events + drops</div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-col config */}
      <div className="ns-two-col">
        {/* Message limits */}
        <div className="ns-limit-card">
          <div className="ns-card__label" style={{ marginBottom: 16 }}>Message limits per day</div>
          {[
            { plan: 'Free', val: 5, max: 30 },
            { plan: 'Core', val: 999, max: 999, label: '∞' },
            { plan: 'Premium', val: 999, max: 999, label: '∞' },
          ].map((row) => (
            <div key={row.plan} className="ns-limit-row">
              <div className="ns-limit-plan">{row.plan}</div>
              <input type="range" className="ns-limit-bar" min={0} max={row.max} defaultValue={row.val} readOnly />
              <div className="ns-limit-val">{row.label ?? row.val}</div>
            </div>
          ))}
          <div className="ns-divider" />
          <div className="ns-card__label" style={{ marginBottom: 12 }}>Voice note access</div>
          {[
            { plan: 'Free', checked: false },
            { plan: 'Core', checked: true },
          ].map((row) => (
            <div key={row.plan} className="ns-toggle-row">
              <div className="ns-toggle-row__info">
                <div className="ns-toggle-row__title">{row.plan} plan</div>
              </div>
              <label className="ns-toggle">
                <input type="checkbox" defaultChecked={row.checked} />
                <div className="ns-toggle__track" />
                <div className="ns-toggle__thumb" />
              </label>
            </div>
          ))}
        </div>

        {/* Credit wallet */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="ns-card">
            <div className="ns-card__label" style={{ marginBottom: 12 }}>Credit wallet config</div>
            {[
              { label: 'Credits on signup', val: '50' },
              { label: 'Credits / Nila msg (Free plan)', val: '1' },
              { label: 'Credit expiry (days)', val: '90' },
            ].map((row) => (
              <div key={row.label} className="ns-credit-row">
                <span style={{ color: 'var(--ns-ink-2)' }}>{row.label}</span>
                <input
                  className="ns-input"
                  defaultValue={row.val}
                  style={{ width: 80, textAlign: 'right' }}
                />
              </div>
            ))}
            <div className="ns-card__label" style={{ marginTop: 16, marginBottom: 8 }}>Top-up packs</div>
            {[
              { credits: '100cr', price: '₹49' },
              { credits: '300cr', price: '₹129' },
              { credits: '1000cr', price: '₹349' },
            ].map((pack) => (
              <div key={pack.credits} className="ns-credit-row">
                <span style={{ fontWeight: 500 }}>{pack.credits}</span>
                <span style={{ color: 'var(--ns-ink-3)' }}>{pack.price}</span>
              </div>
            ))}
          </div>

          {/* Grace period */}
          <div className="ns-card">
            <div className="ns-card__label" style={{ marginBottom: 12 }}>Grace period & dunning</div>
            <div className="ns-two-col" style={{ gap: 10 }}>
              <div className="ns-field">
                <label className="ns-label">Grace period (days)</label>
                <input className="ns-input" defaultValue="7" />
              </div>
              <div className="ns-field">
                <label className="ns-label">Max retries</label>
                <input className="ns-input" defaultValue="3" />
              </div>
              <div className="ns-field">
                <label className="ns-label">Downgrade to</label>
                <select className="ns-select">
                  <option>Free plan</option>
                </select>
              </div>
              <div className="ns-field">
                <label className="ns-label">Re-activation rule</label>
                <select className="ns-select">
                  <option>Immediate on payment</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="ns-btn ns-btn--ghost ns-btn--sm">Reset</button>
              <button className="ns-btn ns-btn--primary ns-btn--sm">Save changes</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
