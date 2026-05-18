// NEST · Screen 05 · Guest Dashboard
// For users who skipped the assessment. Locked Companion + Ally sections,
// open Resources + Events. Soft assessment nudge banner. Ambient path strip.

const GuestDashboard = () => {
  const [bannerDismissed, setBannerDismissed] = React.useState(false);

  return (
    <div className="ns-shell">
      <Sidebar
        active="home"
        footer={<SidebarProfile name="Guest" role="Not signed in" />}
      />

      <div className="ns-main">
        {/* top bar */}
        <header className="ns-topbar">
          <div className="ns-topbar__greeting">Good evening.</div>
          <button className="ns-btn ns-btn--primary ns-btn--sm">Sign up free</button>
        </header>

        <div className="ns-content">
          {/* assessment nudge banner */}
          {!bannerDismissed && (
            <section className="ns-nudge">
              <div className="ns-nudge__body">
                <h3 className="ns-nudge__title">Take your 3-minute assessment</h3>
                <p className="ns-nudge__sub">A few gentle questions to find what might help you most. No account needed.</p>
              </div>
              <button className="ns-btn ns-btn--primary">
                Start <Arrow size={12} />
              </button>
              <button className="ns-nudge__dismiss" aria-label="Dismiss" onClick={() => setBannerDismissed(true)}>
                Later
              </button>
            </section>
          )}

          {/* ambient path strip */}
          <div className="ns-ambient-wrap" aria-hidden="true">
            <AmbientPath />
          </div>

          {/* section label */}
          <div className="ns-section-label">What's available to you tonight</div>

          {/* 2×2 grid */}
          <div className="ns-grid-2">
            {/* Locked: Companion */}
            <article className="ns-card ns-card--locked">
              <div className="ns-card__lock">
                <LockIcon size={11}/> <span>Sign in to open</span>
              </div>
              <div className="ns-card__eyebrow">Your Companion</div>
              <h3 className="ns-card__title">Talk to Sai, when you're ready.</h3>
              <p className="ns-card__body">An AI companion who listens without judgment, points toward real support, and never asks more than you can give.</p>
              {/* placeholder for Sai illustration */}
              <div className="ns-card__illust">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                  <circle cx="32" cy="32" r="28" fill="#F8F0E5" stroke="#E0D5C5" strokeWidth="1"/>
                  <circle cx="32" cy="32" r="20" fill="none" stroke="#E8C8A0" strokeWidth="0.7" opacity="0.7"/>
                  <path d="M32 24 Q38 27 37 33 Q35 38 30 38 Q26 36 28 32" stroke="#2F4C3A" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
                  <circle cx="32" cy="32" r="2" fill="#2F4C3A"/>
                </svg>
              </div>
            </article>

            {/* Locked: Ally session */}
            <article className="ns-card ns-card--locked">
              <div className="ns-card__lock">
                <LockIcon size={11}/> <span>Sign in to open</span>
              </div>
              <div className="ns-card__eyebrow">Find an Ally</div>
              <h3 className="ns-card__title">A real human, when text isn't enough.</h3>
              <p className="ns-card__body">Warm, trained Allies who've been through hard things. Book a session on your own time — no waitlists, no clinical paperwork.</p>
              {/* placeholder for two leaves illustration */}
              <div className="ns-card__illust">
                <svg width="84" height="48" viewBox="0 0 84 48" fill="none" aria-hidden="true">
                  <path d="M14 24 Q22 14 32 22 Q26 28 18 28 Q14 28 14 24 Z" fill="#5C7A66" opacity="0.65" stroke="#2F4C3A" strokeWidth="1"/>
                  <path d="M70 24 Q62 14 52 22 Q58 28 66 28 Q70 28 70 24 Z" fill="#5C7A66" opacity="0.65" stroke="#2F4C3A" strokeWidth="1"/>
                  <path d="M32 22 Q40 26 52 22" stroke="#E8C8A0" strokeWidth="1" fill="none" strokeDasharray="2 2"/>
                </svg>
              </div>
            </article>

            {/* Open: Resources */}
            <article className="ns-card">
              <div className="ns-card__eyebrow">Browse Resources</div>
              <h3 className="ns-card__title">Something gentle to fall into.</h3>
              <p className="ns-card__body">Words, sounds, and short pieces — curated for the kind of evening you're actually having.</p>
              <div className="ns-chips">
                <span className="ns-chip ns-chip--sm">Loneliness</span>
                <span className="ns-chip ns-chip--sm">Anxiety</span>
                <span className="ns-chip ns-chip--sm">Heartbreak</span>
                <span className="ns-chip ns-chip--sm">Healing</span>
              </div>
              <button className="ns-btn ns-btn--secondary ns-btn--full">
                Browse freely <Arrow size={12}/>
              </button>
            </article>

            {/* Open: Events */}
            <article className="ns-card">
              <div className="ns-card__eyebrow">Upcoming Events</div>
              <h3 className="ns-card__title">Actual humans, in actual rooms.</h3>
              <p className="ns-card__body">Low-pressure weekend gatherings. No icebreakers, no performing wellness.</p>
              <div className="ns-event-mini">
                <div className="ns-event-mini__date">
                  <span className="ns-event-mini__day">26</span>
                  <span className="ns-event-mini__mon">JUL</span>
                </div>
                <div className="ns-event-mini__info">
                  <div className="ns-event-mini__title">Sunday Circle</div>
                  <div className="ns-event-mini__loc">Bangalore · 6:00 PM</div>
                </div>
              </div>
              <button className="ns-btn ns-btn--secondary ns-btn--full">
                View events <Arrow size={12}/>
              </button>
            </article>
          </div>

          <p className="ns-footnote">
            <em>Take what you need. Leave the rest. You can sign up whenever you're ready — or not at all.</em>
          </p>
        </div>
      </div>
    </div>
  );
};

window.GuestDashboard = GuestDashboard;
