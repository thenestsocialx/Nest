// NEST · Screen 09 · Ally Profile Card
// Card carousel — left/right arrows cycle through Allies.
// NO star ratings, NO review counts. This is a human, not a listing.

const AllyProfile = () => {
  const [i, setI] = React.useState(0);
  const ally = ALLIES[i];

  const prev = () => setI(p => (p - 1 + ALLIES.length) % ALLIES.length);
  const next = () => setI(p => (p + 1) % ALLIES.length);

  return (
    <div className="ns-shell">
      <Sidebar
        active="ally"
        footer={<SidebarProfile name="Aryan" role="Member · since Jul" initial="A"/>}
      />

      <div className="ns-main">
        {/* top bar */}
        <header className="ns-topbar">
          <div className="ns-topbar__left">
            <div className="ns-topbar__greeting">Find your Ally</div>
            <div className="ns-topbar__sub">
              <span className="ns-mono">{i + 1}</span> of <span className="ns-mono">{ALLIES.length}</span> · Real people, not a directory
            </div>
          </div>
          <button className="ns-btn ns-btn--ghost ns-btn--sm">
            <FilterIcon size={13}/> <span>Filter</span>
          </button>
        </header>

        <div className="ns-ally-stage">
          {/* left arrow */}
          <button className="ns-ally-nav ns-ally-nav--left" onClick={prev} aria-label="Previous Ally">
            <ChevronLeft size={20}/>
          </button>

          {/* the card */}
          <article className="ns-ally-card" key={ally.id}>
            <div className="ns-ally-card__deco" aria-hidden="true">
              <LeavesMeeting/>
            </div>

            <div className="ns-ally-card__head">
              <AllyAvatarLg ally={ally} size={84}/>
              <div className="ns-ally-card__id">
                <h2 className="ns-ally-card__name">{ally.name}</h2>
                <div className="ns-ally-card__pronouns">{ally.pronouns}</div>
                <div className="ns-ally-card__role">
                  {ally.role} · {ally.years} years · {ally.location}
                </div>
              </div>
            </div>

            <div className="ns-ally-card__chips">
              {ally.primarySpecialties.map(s => (
                <span key={s} className="ns-tag ns-tag--filled">{s}</span>
              ))}
              {ally.secondarySpecialties.map(s => (
                <span key={s} className="ns-tag ns-tag--outline">{s}</span>
              ))}
            </div>

            <blockquote className="ns-ally-card__quote">
              <p>{ally.quote}</p>
              <cite>In her own words</cite>
            </blockquote>

            <div className="ns-ally-card__details">
              <div className="ns-detail">
                <ClockIcon/> <span>{ally.sessionLength} min</span>
              </div>
              <div className="ns-detail">
                <VideoIcon/> <span>{ally.sessionMode}</span>
              </div>
              <div className="ns-detail">
                <GlobeIcon/> <span>{ally.languages}</span>
              </div>
              <div className="ns-detail">
                <RupeeIcon/> <span>{ally.price.toLocaleString('en-IN')} / session</span>
              </div>
            </div>

            <div className="ns-ally-card__slot">
              <span className="ns-ally-card__slot-label">Next available</span>
              <strong>{ally.nextSlot}</strong>
            </div>

            <div className="ns-ally-card__actions">
              <button className="ns-btn ns-btn--primary">Book a session</button>
              <button className="ns-btn ns-btn--secondary">View more about {ally.name.split(' ')[0]}</button>
            </div>
          </article>

          {/* right arrow */}
          <button className="ns-ally-nav ns-ally-nav--right" onClick={next} aria-label="Next Ally">
            <ChevronRight size={20}/>
          </button>
        </div>

        {/* pagination dots */}
        <div className="ns-ally-dots" role="tablist" aria-label="Ally pagination">
          {ALLIES.map((a, idx) => (
            <button
              key={a.id}
              className={'ns-ally-dot' + (idx === i ? ' is-active' : '')}
              onClick={() => setI(idx)}
              aria-label={a.name}
              aria-selected={idx === i}
            />
          ))}
        </div>

        <p className="ns-ally-foot">
          <em>No star ratings here. Allies are humans, not listings — read carefully, trust your gut.</em>
        </p>
      </div>
    </div>
  );
};

window.AllyProfile = AllyProfile;
