// NEST · Screen 10 · Ally Detail Modal
// Scrollable modal over a blurred ally profile background. Same blur/scrim
// pattern as the crisis modal — but content here is read-and-decide, not urgent.

const AllyDetail = () => {
  const ally = ALLIES[0]; // Priya, by default — matches the booking confirm

  return (
    <div className="ns-detail-stage">
      {/* faux profile behind, blurred */}
      <div className="ns-detail-backdrop" aria-hidden="true">
        <div className="ns-detail-fake-card">
          <div className="ns-detail-fake-head">
            <div className="ns-detail-fake-avatar" style={{ background: `linear-gradient(135deg, ${ally.avatarHue[0]}, ${ally.avatarHue[1]})` }}>{ally.initials}</div>
            <div>
              <div className="ns-detail-fake-name">{ally.name}</div>
              <div className="ns-detail-fake-role">{ally.role} · {ally.years} years</div>
            </div>
          </div>
          <div className="ns-detail-fake-quote">"{ally.quote}"</div>
          <div className="ns-detail-fake-chips">
            <span/><span/><span/><span/>
          </div>
        </div>
      </div>

      {/* cream scrim */}
      <div className="ns-detail-scrim" aria-hidden="true"/>

      {/* modal */}
      <div className="ns-ally-modal" role="dialog" aria-modal="true" aria-labelledby="ally-modal-title">
        <button className="ns-ally-modal__close" aria-label="Close">
          <CloseIcon size={18}/>
        </button>

        <div className="ns-ally-modal__scroll">
          {/* header */}
          <div className="ns-ally-modal__head">
            <AllyAvatarLg ally={ally} size={68}/>
            <div className="ns-ally-modal__id">
              <h2 id="ally-modal-title" className="ns-ally-modal__name">{ally.name}</h2>
              <div className="ns-ally-modal__pronouns">{ally.pronouns}</div>
              <div className="ns-ally-modal__role">
                {ally.role} · {ally.years} years · {ally.location}
              </div>
            </div>
          </div>

          {/* About */}
          <section className="ns-ally-modal__section">
            <h3 className="ns-ally-modal__heading">About {ally.name.split(' ')[0]}</h3>
            <p className="ns-ally-modal__body">{ally.bio}</p>
          </section>

          {/* Her approach */}
          <section className="ns-ally-modal__section">
            <h3 className="ns-ally-modal__heading">Her approach</h3>
            <p className="ns-ally-modal__body">{ally.approach}</p>
          </section>

          {/* Specialises in */}
          <section className="ns-ally-modal__section">
            <h3 className="ns-ally-modal__heading">Specialises in</h3>
            <div className="ns-ally-modal__chips">
              {[...ally.primarySpecialties, ...ally.secondarySpecialties].map(s => (
                <span key={s} className="ns-tag ns-tag--outline">{s}</span>
              ))}
            </div>
          </section>

          {/* Session details */}
          <section className="ns-ally-modal__section">
            <h3 className="ns-ally-modal__heading">Session details</h3>
            <div className="ns-ally-modal__details">
              <div className="ns-detail-row">
                <ClockIcon/>
                <span>{ally.sessionLength}-minute sessions</span>
              </div>
              <div className="ns-detail-row">
                <VideoIcon/>
                <span>{ally.sessionMode} · video call</span>
              </div>
              <div className="ns-detail-row">
                <GlobeIcon/>
                <span>{ally.languages}</span>
              </div>
              <div className="ns-detail-row">
                <RupeeIcon/>
                <span>₹{ally.price.toLocaleString('en-IN')} per session · pay after, no card on file</span>
              </div>
            </div>
          </section>

          {/* Microcopy reassurance */}
          <div className="ns-ally-modal__micro">
            <p>If the first session doesn't feel right, you can switch Allies — no questions, no friction.</p>
          </div>
        </div>

        {/* sticky footer */}
        <footer className="ns-ally-modal__foot">
          <button className="ns-btn ns-btn--ghost">Close</button>
          <button className="ns-btn ns-btn--primary ns-btn--full">
            Book a session with {ally.name.split(' ')[0]} <Arrow size={13}/>
          </button>
        </footer>
      </div>
    </div>
  );
};

window.AllyDetail = AllyDetail;
