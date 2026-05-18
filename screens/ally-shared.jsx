// NEST · Shared data + icons for the Ally flow (S09 · S10 · S11)

const ALLIES = [
  {
    id: 'priya',
    name: 'Priya Nair',
    initials: 'PN',
    pronouns: 'she / her',
    role: 'Counsellor',
    years: 7,
    location: 'Bangalore',
    sessionMode: 'Online',
    languages: 'English & Tamil',
    primarySpecialties: ['Heartbreak', 'Loneliness'],
    secondarySpecialties: ['Family pressure', 'Identity'],
    quote: "I don't believe in rushing healing. I'll meet you where you are — without any agenda.",
    bio: "I came to this work after spending most of my twenties pretending I was fine. Now I sit with people who are doing the same. I'm slow, I listen more than I speak, and I won't pretend to have your answers — but I'll stay with you while you find yours.",
    approach: "Conversational and unhurried. No homework unless you want it. We move at your pace, not the clock's. Some sessions we'll talk; some we'll just sit. Both are okay.",
    sessionLength: 60,
    price: 1200,
    nextSlot: 'Monday, 22 July · 4:00 PM',
    avatarHue: ['#E8C8A0', '#9B6651'],
  },
  {
    id: 'kabir',
    name: 'Kabir Menon',
    initials: 'KM',
    pronouns: 'he / him',
    role: 'Therapist',
    years: 9,
    location: 'Bangalore',
    sessionMode: 'Online + In person',
    languages: 'English, Hindi & Malayalam',
    primarySpecialties: ['Work & burnout', 'Identity'],
    secondarySpecialties: ['Anxiety', 'Relationships'],
    quote: "Most people show up needing to be believed first. The rest comes after.",
    bio: "I work mostly with people in their late 20s who look fine on paper and feel hollow off it. We unpack what got you here, slowly, without trying to fix you on the way.",
    approach: "Direct but warm. I'll ask hard questions when they matter. We'll find a rhythm that works — every week, or every other.",
    sessionLength: 60,
    price: 1500,
    nextSlot: 'Wednesday, 24 July · 6:30 PM',
    avatarHue: ['#5C7A66', '#2F4C3A'],
  },
  {
    id: 'meera',
    name: 'Meera Iyer',
    initials: 'MI',
    pronouns: 'she / her',
    role: 'Counsellor',
    years: 5,
    location: 'Chennai',
    sessionMode: 'Online',
    languages: 'English & Tamil',
    primarySpecialties: ['Family pressure', 'Anxiety'],
    secondarySpecialties: ['Grief', 'Self-worth'],
    quote: "The thing weighing on you is real — and it makes sense that it feels this heavy.",
    bio: "I work with young adults navigating family expectations they never agreed to. We name what's actually happening, then we figure out what you want — not what was decided for you.",
    approach: "Gentle, unhurried. We start with the day-to-day weight and work outward. No big breakthroughs promised. Just real conversations.",
    sessionLength: 50,
    price: 900,
    nextSlot: 'Friday, 26 July · 5:00 PM',
    avatarHue: ['#E8C8A0', '#5C7A66'],
  },
  {
    id: 'arjun',
    name: 'Arjun Pillai',
    initials: 'AP',
    pronouns: 'he / him',
    role: 'Psychologist',
    years: 11,
    location: 'Mumbai',
    sessionMode: 'Online',
    languages: 'English & Hindi',
    primarySpecialties: ['Heartbreak', 'Self-worth'],
    secondarySpecialties: ['Boundaries', 'Communication'],
    quote: "You don't have to come in with the right words. We'll find them together.",
    bio: "I spent a long time in clinical settings before realising people needed something less procedural. Now I work conversationally with people who've been through breakups, betrayals, and the long quiet that follows.",
    approach: "Curious and patient. I won't rush you to insight. We'll sit with the thing until it's ready to be looked at.",
    sessionLength: 60,
    price: 1400,
    nextSlot: 'Tuesday, 23 July · 7:00 PM',
    avatarHue: ['#9B6651', '#2F4C3A'],
  },
];

/* ── ICONS ── */

const VideoIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <rect x="1.5" y="4" width="8" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.2" fill="none"/>
    <path d="M9.5 6 L 12.5 4.5 V 9.5 L 9.5 8 Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none"/>
  </svg>
);

const ClockIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
    <path d="M7 4 V7 L 9.2 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const GlobeIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
    <ellipse cx="7" cy="7" rx="2.4" ry="5.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
    <path d="M1.5 7 H 12.5" stroke="currentColor" strokeWidth="1.2"/>
  </svg>
);

const RupeeIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M4 3 H 10 M4 5.5 H 10 M4 3 Q 9 3 9 5.5 Q 9 8 4 8 L 9.5 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

const ChevronLeft = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M11 4 L 6 9 L 11 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronRight = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M7 4 L 12 9 L 7 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FilterIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M2 4 H 12 M3.5 7 H 10.5 M5 10 H 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);

const CloseIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 4 L 12 12 M12 4 L 4 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

const CalendarIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <rect x="1.8" y="3" width="10.4" height="9.4" rx="1.2" stroke="currentColor" strokeWidth="1.2" fill="none"/>
    <path d="M1.8 5.5 H 12.2" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M4.5 1.8 V 4 M9.5 1.8 V 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

/* ── TWO LEAVES MEETING (ILL-12) ── */
const LeavesMeeting = () => (
  <svg width="56" height="40" viewBox="0 0 56 40" fill="none" aria-hidden="true">
    <path d="M4 20 Q12 8 24 18 Q18 26 10 25 Q4 25 4 20 Z" fill="#5C7A66" opacity="0.7" stroke="#2F4C3A" strokeWidth="1"/>
    <path d="M52 20 Q44 8 32 18 Q38 26 46 25 Q52 25 52 20 Z" fill="#E8C8A0" opacity="0.85" stroke="#2F4C3A" strokeWidth="1"/>
    <path d="M24 18 L 28 21 L 32 18" stroke="#9B6651" strokeWidth="0.9" strokeLinecap="round" fill="none"/>
  </svg>
);

/* ── CANDLE FLAME (ILL-07, larger version) ── */
const CandleFlame = ({ size = 96 }) => (
  <svg width={size} height={size * 1.3} viewBox="0 0 96 124" fill="none" aria-hidden="true">
    {/* halo */}
    <ellipse cx="48" cy="40" rx="32" ry="40" fill="#E8C8A0" opacity="0.28"/>
    <ellipse cx="48" cy="38" rx="16" ry="22" fill="#E8C8A0" opacity="0.5"/>
    {/* flame */}
    <path d="M48 22 Q54 32 51 46 Q48 54 43 50 Q41 42 48 22 Z" fill="#9B6651"/>
    <path d="M48 28 Q52 36 50 44 Q47 49 45 46 Q44 40 48 28 Z" fill="#E8C8A0"/>
    {/* wick */}
    <line x1="48" y1="54" x2="48" y2="66" stroke="#2F4C3A" strokeWidth="1.2"/>
    {/* candle body */}
    <rect x="30" y="66" width="36" height="48" rx="2" fill="#F8F0E5" stroke="#2F4C3A" strokeWidth="1.4"/>
    <ellipse cx="48" cy="66" rx="18" ry="3" fill="none" stroke="#2F4C3A" strokeWidth="1.4"/>
    <ellipse cx="48" cy="66" rx="14" ry="2" fill="#E8C8A0" opacity="0.5"/>
    {/* wax drip */}
    <path d="M34 76 Q 36 84 34 92" stroke="#9B6651" strokeWidth="0.9" opacity="0.4" fill="none"/>
  </svg>
);

/* ── ALLY AVATAR ── */
const AllyAvatarLg = ({ ally, size = 72 }) => {
  const [a, b] = ally.avatarHue || ['#E8C8A0', '#9B6651'];
  return (
    <div
      className="ns-ally-avatar ns-ally-avatar--lg"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${a}, ${b})`,
        fontSize: size * 0.32,
      }}
    >
      <span>{ally.initials}</span>
    </div>
  );
};

window.ALLIES = ALLIES;
Object.assign(window, {
  VideoIcon, ClockIcon, GlobeIcon, RupeeIcon,
  ChevronLeft, ChevronRight, FilterIcon, CloseIcon, CalendarIcon,
  LeavesMeeting, CandleFlame, AllyAvatarLg,
});
