const EVENTS = [
  {
    month: 'Jul', day: 26,
    name: 'Sunday Circle — Bangalore',
    meta: 'Indiranagar · 6:00 PM · 20 capacity',
    cap: '12/20', status: 'Open',
  },
  {
    month: 'Aug', day: 2,
    name: 'Quiet Gathering — Chennai',
    meta: 'Nungambakkam · 5:30 PM · 15 capacity',
    cap: '15/15', status: 'Full', capAmber: true,
  },
  {
    month: 'Aug', day: 9,
    name: 'Evening Walk — Pune',
    meta: 'Koregaon Park · 6:30 PM · 25 capacity',
    cap: '4/25', status: 'Open',
  },
];

const POST_EVENT_TOGGLES = [
  { title: 'Send reflection email after event', desc: '2h after event ends · via Resend', on: true },
  { title: 'Nila follow-up prompt', desc: 'Next day · personalised check-in', on: true },
  { title: '24h reminder to registrants', desc: 'via Resend email', on: true },
];

export default function EventsPage() {
  return (
    <>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div className="ns-tabs">
          <button className="ns-tab ns-tab--active">Upcoming</button>
          <button className="ns-tab">Past</button>
        </div>
        <button className="ns-btn ns-btn--primary">+ Create event</button>
      </div>

      <div className="ns-two-col">
        {/* Events list */}
        <div className="ns-card">
          <div className="ns-card__label" style={{ marginBottom: 12 }}>Upcoming events</div>
          {EVENTS.map((ev, i) => (
            <div key={i} className="ns-event-row">
              <div className="ns-event-row__date">
                <div className="ns-event-row__month">{ev.month}</div>
                <div className="ns-event-row__day">{ev.day}</div>
              </div>
              <div className="ns-event-row__body">
                <div className="ns-event-row__name">{ev.name}</div>
                <div className="ns-event-row__meta">{ev.meta}</div>
              </div>
              <div className="ns-event-row__cap">
                {ev.cap}
                <span
                  className={`ns-badge ns-badge--${ev.capAmber ? 'amber' : 'green'}`}
                  style={{ marginLeft: 6 }}
                >
                  {ev.status}
                </span>
              </div>
              <button className="ns-btn ns-btn--ghost ns-btn--sm">Edit</button>
            </div>
          ))}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Mini metrics */}
          <div className="ns-card">
            <div className="ns-card__label" style={{ marginBottom: 12 }}>Event registrations</div>
            <div className="ns-two-col" style={{ gap: 12 }}>
              <div>
                <div className="ns-card__label">This month</div>
                <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--ns-ink)' }}>47</div>
                <div style={{ fontSize: 11, color: 'var(--ns-ink-4)' }}>registrations</div>
              </div>
              <div>
                <div className="ns-card__label">Waitlisted</div>
                <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--ns-amber)' }}>8</div>
                <div style={{ fontSize: 11, color: 'var(--ns-ink-4)' }}>Chennai event</div>
              </div>
            </div>
          </div>

          {/* Post-event flow */}
          <div className="ns-card">
            <div className="ns-card__label" style={{ marginBottom: 12 }}>Post-event flow</div>
            {POST_EVENT_TOGGLES.map((t, i) => (
              <div key={i} className="ns-toggle-row">
                <div className="ns-toggle-row__info">
                  <div className="ns-toggle-row__title">{t.title}</div>
                  <div className="ns-toggle-row__desc">{t.desc}</div>
                </div>
                <label className="ns-toggle">
                  <input type="checkbox" defaultChecked={t.on} />
                  <div className="ns-toggle__track" />
                  <div className="ns-toggle__thumb" />
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
