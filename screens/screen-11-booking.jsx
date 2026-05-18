// NEST · Screen 11 · Booking Confirmation
// You're booked. Single candle. Calm acknowledgement, not a celebration.

const BookingConfirm = () => {
  const ally = ALLIES[0]; // Priya

  return (
    <div className="ns-shell">
      <Sidebar
        active="ally"
        footer={<SidebarProfile name="Aryan" role="Member · since Jul" initial="A"/>}
      />

      <div className="ns-main">
        <header className="ns-topbar">
          <div className="ns-topbar__left">
            <div className="ns-topbar__greeting">Find your Ally</div>
            <div className="ns-topbar__sub">Booking confirmed</div>
          </div>
        </header>

        <div className="ns-confirm">
          {/* Candle, lit. Something has been started. */}
          <div className="ns-confirm__candle">
            <CandleFlame size={88}/>
          </div>

          {/* check chip */}
          <div className="ns-confirm__check" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 9.5 L 7.5 13 L 14 6" stroke="#2F4C3A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Confirmed</span>
          </div>

          <h1 className="ns-confirm__title">You're booked.</h1>
          <p className="ns-confirm__body">
            A session with <strong>{ally.name}</strong> is on the way. We'll remind you the day before, and again an hour before — that's the only time you'll hear from us.
          </p>

          {/* Session details card */}
          <article className="ns-confirm__card">
            <div className="ns-confirm__card-head">
              <AllyAvatarLg ally={ally} size={48}/>
              <div>
                <div className="ns-confirm__card-name">{ally.name}</div>
                <div className="ns-confirm__card-role">{ally.role} · {ally.years} years</div>
              </div>
            </div>

            <div className="ns-confirm__when">
              <div className="ns-confirm__when-day">
                <span className="ns-confirm__when-num">22</span>
                <span className="ns-confirm__when-mon">JUL</span>
              </div>
              <div className="ns-confirm__when-meta">
                <div className="ns-confirm__when-line">Monday · 4:00 PM</div>
                <div className="ns-confirm__when-sub">{ally.sessionLength} min · Video call · IST</div>
              </div>
            </div>

            <div className="ns-confirm__detail-list">
              <div className="ns-detail-row">
                <GlobeIcon/>
                <span>Conducted in {ally.languages}</span>
              </div>
              <div className="ns-detail-row">
                <RupeeIcon/>
                <span>₹{ally.price.toLocaleString('en-IN')} · pay after the session</span>
              </div>
            </div>
          </article>

          {/* actions */}
          <div className="ns-confirm__actions">
            <button className="ns-btn ns-btn--secondary">
              <CalendarIcon size={13}/> <span>Add to calendar</span>
            </button>
            <button className="ns-btn ns-btn--ghost">
              Back to home
            </button>
          </div>

          {/* gentle aftercare microcopy */}
          <div className="ns-confirm__after">
            <p>
              <em>You've taken a real step tonight. Nothing more is asked of you until Monday.</em>
            </p>
          </div>

          {/* fallback row — tiny, quiet */}
          <p className="ns-confirm__footnote">
            Need to change the time? <a href="#" className="ns-link ns-link--quiet">Reschedule for free</a> up to 4 hours before.
          </p>
        </div>
      </div>
    </div>
  );
};

window.BookingConfirm = BookingConfirm;
