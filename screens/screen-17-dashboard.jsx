// NEST · Screen 17 · Full Dashboard (authenticated)
// Sidebar with Home active, top bar with name greeting + bell.
// Mood bar (5 chips). 2-col grid: continue/session/saved left, event/trend right.
// Ambient morning strip between top bar and content.

const MOODS = [
  { glyph: '😔', label: 'Low' },
  { glyph: '😕', label: 'Off' },
  { glyph: '😶', label: 'Numb' },
  { glyph: '🙂', label: 'Okay' },
  { glyph: '😌', label: 'Settled' },
];

const WEEK_BARS = [
  { day: 'M', h: 60, logged: true,  hi: false },
  { day: 'T', h: 40, logged: true,  hi: false },
  { day: 'W', h: 72, logged: true,  hi: true  },
  { day: 'T', h: 82, logged: true,  hi: false },
  { day: 'F', h: 0,  logged: false, hi: false },
  { day: 'S', h: 66, logged: true,  hi: true  },
  { day: 'S', h: 0,  logged: false, hi: false },
];

const NilaAvatar = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <circle cx="20" cy="20" r="18" fill="#F8F0E5" stroke="#E0D5C5" strokeWidth="1"/>
    <circle cx="20" cy="20" r="13" fill="none" stroke="#E8C8A0" strokeWidth="0.7" opacity="0.7"/>
    <path d="M20 14 Q24 16 23.5 20 Q22 23 18.5 23 Q16 22 17 19" stroke="#2F4C3A" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <circle cx="20" cy="20" r="1.4" fill="#2F4C3A"/>
  </svg>
);

const AllyAvatar = ({ size = 44 }) => (
  // warm cream-tone circle as photo placeholder
  <div className="ns-ally-avatar" style={{ width: size, height: size }}>
    <span>PN</span>
  </div>
);

const Dashboard = () => {
  const [mood, setMood] = React.useState(1); // index — selected mood
  return (
    <div className="ns-shell">
      <Sidebar
        active="home"
        footer={<SidebarProfile name="Aryan" role="Member · since Jul" initial="A"/>}
      />

      <div className="ns-main">
        {/* top bar */}
        <header className="ns-topbar ns-topbar--auth">
          <div className="ns-topbar__left">
            <div className="ns-topbar__greeting">Good evening, Aryan.</div>
            <div className="ns-topbar__sub">How are you holding up?</div>
          </div>
          <button className="ns-bell" aria-label="Notifications">
            <BellIcon/>
            <span className="ns-bell__dot" aria-hidden="true"/>
          </button>
        </header>

        {/* ambient morning strip */}
        <div className="ns-ambient-wrap ns-ambient-wrap--morning" aria-hidden="true">
          <AmbientPath/>
        </div>

        <div className="ns-content">
          {/* mood bar card */}
          <section className="ns-mood">
            <div className="ns-mood__head">
              <div className="ns-mood__label">Today's mood</div>
              <div className="ns-mood__note">Optional · Not shared</div>
            </div>
            <div className="ns-mood__row">
              {MOODS.map((m, i) => (
                <button
                  key={m.label}
                  className={'ns-mood__chip' + (mood === i ? ' is-selected' : '')}
                  onClick={() => setMood(i)}
                  aria-label={m.label}
                  aria-pressed={mood === i}
                >
                  <span className="ns-mood__glyph">{m.glyph}</span>
                  <span className="ns-mood__name">{m.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* 2-col grid */}
          <div className="ns-dash-grid">
            {/* LEFT */}
            <div className="ns-dash-col">
              {/* Continue with Nila — accent */}
              <article className="ns-card ns-card--accent">
                <div className="ns-card__eyebrow">Continue where you left off</div>
                <div className="ns-continue">
                  <NilaAvatar size={48}/>
                  <div className="ns-continue__body">
                    <h3 className="ns-card__title" style={{ marginBottom: 4 }}>Chat with Nila</h3>
                    <p className="ns-continue__last">
                      <span className="ns-continue__quote">"I've been feeling really alone lately…"</span>
                      <span className="ns-continue__time">2 hours ago</span>
                    </p>
                  </div>
                  <button className="ns-btn ns-btn--primary">
                    Resume <Arrow size={12}/>
                  </button>
                </div>
              </article>

              {/* Ally session */}
              <article className="ns-card">
                <div className="ns-card__eyebrow">Your next Ally session</div>
                <div className="ns-session">
                  <AllyAvatar/>
                  <div className="ns-session__body">
                    <h3 className="ns-card__title" style={{ marginBottom: 4 }}>Priya Nair</h3>
                    <div className="ns-session__meta">Monday, 22 July · 4:00 PM · Video call</div>
                    <div className="ns-session__reminder">Reminder set · day before, and one hour ahead</div>
                  </div>
                  <button className="ns-btn ns-btn--secondary">
                    Join
                  </button>
                </div>
              </article>

              {/* Saved resources */}
              <article className="ns-card">
                <div className="ns-card__head">
                  <div className="ns-card__eyebrow">Saved resources</div>
                  <a href="#" className="ns-link ns-link--quiet">See all</a>
                </div>
                <ul className="ns-saved">
                  <li className="ns-saved__item">
                    <span className="ns-tag ns-tag--outline">Article</span>
                    <div className="ns-saved__title">Why feeling lonely in a crowd is real</div>
                    <span className="ns-saved__meta">4 min read</span>
                  </li>
                  <li className="ns-saved__item">
                    <span className="ns-tag ns-tag--outline">Playlist</span>
                    <div className="ns-saved__title">For nights when quiet feels too loud</div>
                    <span className="ns-saved__meta">54 min</span>
                  </li>
                  <li className="ns-saved__item">
                    <span className="ns-tag ns-tag--outline">Guide</span>
                    <div className="ns-saved__title">Talking to someone you trust — how to start</div>
                    <span className="ns-saved__meta">8 min read</span>
                  </li>
                </ul>
              </article>
            </div>

            {/* RIGHT */}
            <div className="ns-dash-col ns-dash-col--narrow">
              {/* Upcoming event */}
              <article className="ns-card ns-event">
                <div className="ns-event__poster" aria-hidden="true">
                  {/* warm-toned event illustration: silhouette circle */}
                  <svg viewBox="0 0 280 140" preserveAspectRatio="xMidYMid slice" fill="none">
                    <rect width="280" height="140" fill="#9B6651" opacity="0.18"/>
                    <ellipse cx="140" cy="120" rx="120" ry="20" fill="#E8C8A0" opacity="0.4"/>
                    <g fill="#2F4C3A">
                      <circle cx="60" cy="78" r="9"/>
                      <path d="M50 92 Q50 110 60 114 Q70 110 70 92 Z"/>
                    </g>
                    <g fill="#5C7A66">
                      <circle cx="100" cy="70" r="9"/>
                      <path d="M90 84 Q90 108 100 112 Q110 108 110 84 Z"/>
                    </g>
                    <g fill="#2F4C3A">
                      <circle cx="140" cy="68" r="9"/>
                      <path d="M130 82 Q130 108 140 112 Q150 108 150 82 Z"/>
                    </g>
                    <g fill="#5C7A66">
                      <circle cx="180" cy="70" r="9"/>
                      <path d="M170 84 Q170 108 180 112 Q190 108 190 84 Z"/>
                    </g>
                    <g fill="#2F4C3A">
                      <circle cx="220" cy="78" r="9"/>
                      <path d="M210 92 Q210 110 220 114 Q230 110 230 92 Z"/>
                    </g>
                    {/* warm dots */}
                    <circle cx="50" cy="28" r="1.6" fill="#E8C8A0"/>
                    <circle cx="140" cy="22" r="1.4" fill="#E8C8A0"/>
                    <circle cx="220" cy="32" r="1.6" fill="#E8C8A0"/>
                  </svg>
                </div>
                <div className="ns-event__body">
                  <div className="ns-event__date">SAT 26 JULY · 6:00 PM</div>
                  <h3 className="ns-card__title">Sunday Circle</h3>
                  <div className="ns-event__loc">Indiranagar, Bangalore · 8 spots left</div>
                  <button className="ns-btn ns-btn--ghost ns-btn--full" style={{ marginTop: 16 }}>
                    View details
                  </button>
                </div>
              </article>

              {/* Mood trend */}
              <article className="ns-card">
                <div className="ns-card__head">
                  <div className="ns-card__eyebrow">This week</div>
                  <div className="ns-trend__note">5 of 7 days</div>
                </div>
                <div className="ns-trend">
                  {WEEK_BARS.map((b, i) => (
                    <div key={i} className="ns-trend__col">
                      <div className="ns-trend__track">
                        <div
                          className={'ns-trend__bar' + (b.hi ? ' is-hi' : '') + (!b.logged ? ' is-empty' : '')}
                          style={{ height: b.logged ? `${b.h}%` : '8%' }}
                        />
                      </div>
                      <div className="ns-trend__day">{b.day}</div>
                    </div>
                  ))}
                </div>
                <p className="ns-trend__caption">
                  <em>Two settled days this week. That's something.</em>
                </p>
              </article>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

window.Dashboard = Dashboard;
