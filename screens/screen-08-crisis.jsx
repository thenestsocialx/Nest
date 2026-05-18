// NEST · Screen 08 · Crisis Modal
// Cream-tinted backdrop (75%) + blur. Modal centered. NOT alarming red.
// "We're here with you." + iCall + Vandrevala + ghost return link.

const TwoHandsIllust = () => (
  <svg width="120" height="64" viewBox="0 0 120 64" fill="none" aria-hidden="true">
    {/* soft halo behind */}
    <ellipse cx="60" cy="38" rx="50" ry="20" fill="#E8C8A0" opacity="0.35"/>
    {/* left hand */}
    <path d="M14 56 Q18 28 32 26 Q38 25 42 30 Q46 25 52 26 Q54 26 56 28"
          stroke="#2F4C3A" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
    <path d="M22 42 L 20 30 M30 38 L 29 26 M40 36 L 41 24 M50 34 L 51 26"
          stroke="#2F4C3A" strokeWidth="1.5" strokeLinecap="round"/>
    {/* right hand */}
    <path d="M106 56 Q102 28 88 26 Q82 25 78 30 Q74 25 68 26 Q66 26 64 28"
          stroke="#2F4C3A" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
    <path d="M98 42 L 100 30 M90 38 L 91 26 M80 36 L 79 24 M70 34 L 69 26"
          stroke="#2F4C3A" strokeWidth="1.5" strokeLinecap="round"/>
    {/* small warm light between */}
    <circle cx="60" cy="36" r="3" fill="#E8C8A0"/>
    <circle cx="60" cy="36" r="5" fill="#E8C8A0" opacity="0.4"/>
  </svg>
);

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 4 Q3 3 4 3 H5.5 Q6 3 6.2 3.5 L 7 6 Q 7.2 6.5 6.8 7 L 5.8 8 Q 7 10.5 9 11.5 L 10 10.5 Q 10.5 10.2 11 10.4 L 13.5 11.2 Q 14 11.4 14 12 V13.5 Q 14 14 13 14 Q 7 14 4 11 Q 3 8 3 4 Z"
          stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round"/>
  </svg>
);

const CrisisModal = () => (
  <div className="ns-crisis-stage">
    {/* faux chat backdrop, blurred */}
    <div className="ns-crisis-backdrop" aria-hidden="true">
      <div className="ns-crisis-fake-chat">
        <div className="ns-crisis-fake-bubble ns-crisis-fake-bubble--ai">I hear you. That sounds like a lot to carry on your own…</div>
        <div className="ns-crisis-fake-bubble ns-crisis-fake-bubble--user">i don't know what to do anymore</div>
        <div className="ns-crisis-fake-bubble ns-crisis-fake-bubble--ai">Thank you for telling me. Before we go further — I want to make sure you have real support right now…</div>
        <div className="ns-crisis-fake-bubble ns-crisis-fake-bubble--user">i feel like everything is falling apart</div>
      </div>
    </div>

    {/* cream-tinted scrim */}
    <div className="ns-crisis-scrim" aria-hidden="true"/>

    {/* modal */}
    <div className="ns-modal" role="dialog" aria-modal="true" aria-labelledby="crisis-title">
      <div className="ns-modal__illust">
        <TwoHandsIllust/>
      </div>

      <h2 id="crisis-title" className="ns-modal__title">We're here with you.</h2>
      <p className="ns-modal__body">
        You don't have to figure this out alone right now. Real support is one call away — kind people on the other end, trained for exactly this.
      </p>

      {/* iCall — primary card */}
      <article className="ns-crisis-card ns-crisis-card--primary">
        <div className="ns-crisis-card__head">
          <div>
            <h3 className="ns-crisis-card__name">iCall</h3>
            <p className="ns-crisis-card__hours">Mon–Sat · 8am to 10pm</p>
          </div>
          <span className="ns-tag ns-tag--accent">Free</span>
        </div>
        <button className="ns-btn ns-btn--primary ns-btn--full">
          <PhoneIcon/> <span>Call 9152987821</span>
        </button>
      </article>

      {/* Vandrevala — secondary card */}
      <article className="ns-crisis-card">
        <div className="ns-crisis-card__head">
          <div>
            <h3 className="ns-crisis-card__name">Vandrevala Foundation</h3>
            <p className="ns-crisis-card__hours">Open 24 hours · 7 days a week</p>
          </div>
          <span className="ns-tag ns-tag--outline">24 / 7</span>
        </div>
        <button className="ns-btn ns-btn--secondary ns-btn--full">
          <PhoneIcon/> <span>Call 1860 2662 345</span>
        </button>
      </article>

      <button className="ns-crisis-return">
        I'm okay — return to my conversation
      </button>
    </div>
  </div>
);

window.CrisisModal = CrisisModal;
