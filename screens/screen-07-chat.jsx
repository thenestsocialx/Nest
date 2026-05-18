// NEST · Screen 07 · Chat Screen with Nila
// Three columns: app sidebar · session context rail · chat pane.
// Includes: disclaimer banner, message limit-reached state, mood + topics + help.

const MESSAGES = [
  { from: 'nila',
    text: "That kind of quiet — even when people are around — is one of the loneliest feelings there is. Tell me about today. What did it look like, hour by hour?",
    time: '10:34 pm' },
  { from: 'user',
    text: "spent most of the day at work pretending. came home and just sat in the dark for two hours. couldn't open my phone. couldn't text anyone.",
    time: '10:42 pm' },
  { from: 'nila',
    text: "That sitting in the dark — I want to honour that. It sounds like the part of you that's been holding everything together for everyone else finally needed a moment where you didn't have to be anything. That's not nothing.",
    time: '10:43 pm' },
  { from: 'user',
    text: "it just felt easier than facing how heavy it all is",
    time: '10:48 pm' },
  { from: 'nila',
    text: "That makes sense. When the weight is this big, even naming it can feel like more than you have. You don't have to figure it all out tonight — what would feel like one small kindness toward yourself, just for the next hour?",
    time: '10:50 pm' },
];

const TopicChip = ({ children }) => (
  <span className="ns-rail-chip">{children}</span>
);

const NilaBubbleAvatar = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <circle cx="14" cy="14" r="12.5" fill="#F8F0E5" stroke="#E0D5C5" strokeWidth="0.8"/>
    <circle cx="14" cy="14" r="9" fill="none" stroke="#E8C8A0" strokeWidth="0.6" opacity="0.7"/>
    <path d="M14 10 Q17 11.5 16.5 14.5 Q15.5 17 13 17 Q11 16 12 14" stroke="#2F4C3A" strokeWidth="0.9" fill="none" strokeLinecap="round"/>
    <circle cx="14" cy="14" r="1" fill="#2F4C3A"/>
  </svg>
);

const UserBubbleAvatar = () => (
  <div className="ns-bubble__user-avatar">A</div>
);

const ChatScreen = () => {
  const [showBanner, setShowBanner] = React.useState(true);
  const scrollRef = React.useRef(null);

  // pin chat scroll to the end on mount so the most recent message is visible
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  return (
    <div className="ns-chat-shell">
      {/* COL 1 — NEST app sidebar */}
      <Sidebar
        active="companion"
        footer={<SidebarProfile name="Aryan" role="Member · since Jul" initial="A"/>}
      />

      {/* COL 2 — Session rail */}
      <aside className="ns-rail">
        <div className="ns-rail__section">
          <div className="ns-rail__eyebrow">Session</div>
          <div className="ns-rail__time">10:34 pm</div>
          <div className="ns-rail__meta">10 of 10 messages · 18 min</div>
          <div className="ns-rail__mood">
            <span className="ns-rail__mood-glyph">😕</span>
            <span className="ns-rail__mood-label">Heavy</span>
          </div>
        </div>

        <div className="ns-rail__section">
          <div className="ns-rail__eyebrow">Messages used</div>
          <div className="ns-rail__bar">
            <div className="ns-rail__bar-fill"/>
          </div>
          <div className="ns-rail__limit-row">
            <span className="ns-rail__limit-label">Limit reached</span>
            <a href="#" className="ns-link">View plans <Arrow size={11}/></a>
          </div>
        </div>

        <div className="ns-rail__section">
          <div className="ns-rail__eyebrow">Topics tonight</div>
          <div className="ns-rail__chips">
            <TopicChip>Loneliness</TopicChip>
            <TopicChip>Work stress</TopicChip>
            <TopicChip>Heartbreak</TopicChip>
          </div>
        </div>

        <div className="ns-rail__section">
          <div className="ns-rail__eyebrow">Need someone now</div>

          <div className="ns-rail__help">
            <div className="ns-rail__help-name">iCall</div>
            <div className="ns-rail__help-number">9152 987 821</div>
            <div className="ns-rail__help-hours">Mon–Sat · 8am–10pm · Free</div>
          </div>

          <div className="ns-rail__help">
            <div className="ns-rail__help-name">Vandrevala</div>
            <div className="ns-rail__help-number">1860 2662 345</div>
            <div className="ns-rail__help-hours">24 / 7 · Free</div>
          </div>
        </div>

        <div className="ns-rail__foot">
          <p className="ns-rail__disclaim">
            Nila is an AI, not a licensed therapist. She's a place to be heard — not a substitute for professional care.
          </p>
          <button className="ns-rail__new">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2.5 7 Q 2.5 3 7 3 Q 10 3 11 5.5 M11 3 V 5.5 H 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M11.5 7 Q 11.5 11 7 11 Q 4 11 3 8.5 M3 11 V 8.5 H 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            <span>New session</span>
          </button>
        </div>
      </aside>

      {/* COL 3 — Chat pane */}
      <main className="ns-chat">
        {/* Header */}
        <header className="ns-chat__header">
          <div className="ns-chat__id">
            <NilaBubbleAvatar/>
            <div className="ns-chat__id-text">
              <div className="ns-chat__name">
                Nila
                <span className="ns-chat__dot" aria-label="online"/>
              </div>
              <div className="ns-chat__role">AI companion · here to listen</div>
            </div>
          </div>
          <div className="ns-chat__actions">
            <button className="ns-chat__crisis">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 4 Q3 3 4 3 H5.5 Q6 3 6.2 3.5 L 7 5.8 Q 7.2 6.3 6.8 6.6 L 5.8 7.6 Q 7 10 9 11 L 10 10 Q 10.5 9.7 11 9.9 L 13.3 10.7 Q 13.8 10.9 13.8 11.5 V 12.8 Q 13.8 13.5 13 13.5 Q 7 13.5 4 10.5 Q 3 7.5 3 4 Z" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinejoin="round"/>
              </svg>
              <span>Crisis line</span>
            </button>
            <button className="ns-chat__icon-btn" aria-label="Settings">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="1.6" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                <path d="M7 1 V3 M7 11 V13 M1 7 H3 M11 7 H13 M2.8 2.8 L 4.3 4.3 M9.7 9.7 L 11.2 11.2 M2.8 11.2 L 4.3 9.7 M9.7 4.3 L 11.2 2.8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </header>

        {/* Disclaimer banner */}
        {showBanner && (
          <div className="ns-chat__banner">
            <span className="ns-chat__banner-icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                <path d="M7 4.2 V7.5 M7 9.5 V9.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </span>
            <p className="ns-chat__banner-text">
              <strong>Nila is an AI</strong>, not a licensed therapist. If you're in crisis, please call iCall <a href="#" className="ns-link">9152 987 821</a> or Vandrevala <a href="#" className="ns-link">1860 2662 345</a>.
            </p>
            <button className="ns-chat__banner-close" aria-label="Dismiss" onClick={() => setShowBanner(false)}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 3 L 9 9 M9 3 L 3 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="ns-chat__messages" ref={scrollRef}>
          <div className="ns-chat__day-divider">
            <span>Tonight</span>
          </div>

          {MESSAGES.map((m, i) => (
            <div key={i} className={`ns-bubble ns-bubble--${m.from}`}>
              <div className="ns-bubble__avatar">
                {m.from === 'nila' ? <NilaBubbleAvatar/> : <UserBubbleAvatar/>}
              </div>
              <div className="ns-bubble__col">
                <div className="ns-bubble__body">{m.text}</div>
                <div className="ns-bubble__time">{m.time}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Limit-reached strip */}
        <div className="ns-chat__limit-strip">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
            <path d="M7 4 V7.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            <circle cx="7" cy="9.4" r="0.6" fill="currentColor"/>
          </svg>
          <span>You've used your free messages for today. <a href="#" className="ns-link">Pick up tomorrow, or unlock more →</a></span>
        </div>

        {/* Input bar (disabled state) */}
        <div className="ns-chat__input-wrap">
          <div className="ns-chat__input ns-chat__input--disabled">
            <input
              type="text"
              placeholder="Free messages used — come back tomorrow, or unlock more to keep going."
              disabled
            />
            <button className="ns-chat__send" disabled aria-label="Send">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8 H 12 M8 4 L 12 8 L 8 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <p className="ns-chat__footer-note">
            <em>Your conversation is private and stays on this device.</em>
          </p>
        </div>
      </main>
    </div>
  );
};

window.ChatScreen = ChatScreen;
