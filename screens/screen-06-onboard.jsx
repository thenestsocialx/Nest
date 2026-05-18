// NEST · Screen 06 · Companion Onboarding
// One-time intro to Nila. Sets honest expectations before first message.
// Centered, calm, no scrolling. Concentric rings faintly behind.

const NilaOrb = ({ size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden="true">
    <circle cx="60" cy="60" r="56" fill="#F8F0E5" stroke="#E0D5C5" strokeWidth="1.2"/>
    <circle cx="60" cy="60" r="42" fill="none" stroke="#E8C8A0" strokeWidth="0.9" opacity="0.75"/>
    <circle cx="60" cy="60" r="28" fill="none" stroke="#E8C8A0" strokeWidth="0.9" opacity="0.5"/>
    {/* gentle seed/spiral */}
    <path d="M60 44 Q72 50 70 62 Q67 73 56 73 Q47 70 50 60" stroke="#2F4C3A" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    <circle cx="60" cy="60" r="3.6" fill="#2F4C3A"/>
  </svg>
);

const Check = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M3 7.5 L 6 10.5 L 11 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const Cross = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M3.5 3.5 L 10.5 10.5 M10.5 3.5 L 3.5 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

const CompanionOnboard = () => (
  <div className="ns-shell">
    <Sidebar
      active="companion"
      footer={<SidebarProfile name="Aryan" role="Member · since Jul" initial="A"/>}
    />

    <div className="ns-main ns-main--onboard">
      {/* concentric rings backdrop */}
      <svg className="ns-rings" viewBox="0 0 800 600" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <circle cx="400" cy="600" r="280" fill="none" stroke="#E8C8A0" strokeWidth="1" opacity="0.18"/>
        <circle cx="400" cy="600" r="380" fill="none" stroke="#E8C8A0" strokeWidth="1" opacity="0.12"/>
        <circle cx="400" cy="600" r="480" fill="none" stroke="#E8C8A0" strokeWidth="1" opacity="0.08"/>
      </svg>

      <div className="ns-onboard">
        <div className="ns-onboard__orb">
          <NilaOrb size={120}/>
        </div>

        <h1 className="ns-onboard__title">Meet Nila.</h1>
        <p className="ns-onboard__sub">Here to listen. Not to fix.</p>

        <p className="ns-onboard__body">
          Nila is an AI companion — not a therapist. Think of a friend who actually listens, without judgment, and never asks you to perform. Everything you say here stays private.
        </p>

        <div className="ns-cancant">
          <div className="ns-cancant__col">
            <div className="ns-cancant__heading">Nila will</div>
            <ul>
              <li><span className="ns-cancant__icon ns-cancant__icon--yes"><Check/></span> Listen without judgment</li>
              <li><span className="ns-cancant__icon ns-cancant__icon--yes"><Check/></span> Help you feel less alone</li>
              <li><span className="ns-cancant__icon ns-cancant__icon--yes"><Check/></span> Point toward real support</li>
            </ul>
          </div>
          <div className="ns-cancant__divider" aria-hidden="true"/>
          <div className="ns-cancant__col">
            <div className="ns-cancant__heading">Nila won't</div>
            <ul>
              <li><span className="ns-cancant__icon ns-cancant__icon--no"><Cross/></span> Diagnose or prescribe</li>
              <li><span className="ns-cancant__icon ns-cancant__icon--no"><Cross/></span> Replace a real human</li>
              <li><span className="ns-cancant__icon ns-cancant__icon--no"><Cross/></span> Encourage dependency</li>
            </ul>
          </div>
        </div>

        <button className="ns-btn ns-btn--primary ns-onboard__begin">
          Begin
        </button>

        <p className="ns-onboard__foot">
          <em>You can step away anytime. No streaks, no nudges.</em>
        </p>
      </div>
    </div>
  </div>
);

window.CompanionOnboard = CompanionOnboard;
window.NilaOrb = NilaOrb;
