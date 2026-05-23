'use client';

import { useState } from 'react';

/* ── Types ── */
type Availability = Record<string, boolean>;

/* ── Initial state ── */
const STEP_LABELS = [
  { label: 'Identity',  sub: 'Name, photo, bio' },
  { label: 'Expertise', sub: 'Skills & approach' },
  { label: 'Sessions',  sub: 'Format & pricing' },
  { label: 'Documents', sub: 'Verification' },
  { label: 'Matching',  sub: 'Engine config' },
];

const SPECIALITIES = [
  'heartbreak', 'loneliness', 'family', 'identity', 'anxiety', 'grief',
  'self-esteem', 'career', 'trauma', 'depression', 'relationships',
  'communication', 'confidence', 'cultural', 'lgbtq+', 'anger management',
];

const MODALITIES = [
  'CBT', 'DBT', 'ACT', 'IFS', 'narrative therapy', 'person-centred',
  'somatic', 'mindfulness-based', 'EMDR', 'psychodynamic', 'integrative', 'positive psychology',
];

const AGE_GROUPS = ['18-24', '25-34', '35-45', '45+'];
const GENDERS    = ['Any gender', 'Women preferred', 'Men preferred'];
const TONES      = ['Warm & nurturing', 'Structured & goal-driven', 'Exploratory & open', 'Solution-focused', 'Quiet & reflective'];
const FORMATS    = ['🎥 Online', '📍 In-person', 'Both'];
const DURATIONS  = ['45min', '60min', '90min'];

const AVAIL_ROWS = ['Morning (9AM–12PM)', 'Afternoon (12–4PM)', 'Evening (4–9PM)'];
const AVAIL_COLS = ['Mon–Wed', 'Thu–Fri', 'Sat', 'Sun'];

const MATCH_WEIGHTS = [
  { label: 'Loneliness & disconnection', tag: 'Primary',   key: 'loneliness',  val: 90 },
  { label: 'Heartbreak & relationships', tag: 'Primary',   key: 'heartbreak',  val: 95 },
  { label: 'Family pressure & expectations', tag: 'Secondary', key: 'family',  val: 70 },
  { label: 'Work stress & future anxiety',   tag: 'Secondary', key: 'career',  val: 55 },
  { label: 'Identity & self-exploration',    tag: 'Secondary', key: 'identity',val: 65 },
  { label: 'Everything at once (overwhelm)', tag: 'Secondary', key: 'overwhelm',val:80},
];

/* ── Completion ring SVG ── */
function CompletionRing({ step }: { step: number }) {
  const pct = step * 20;
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="ob-completion">
      <svg className="ob-ring-svg" width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={radius} fill="none" stroke="var(--ob-hm)" strokeWidth="4" />
        <circle
          cx="28" cy="28" r={radius}
          fill="none"
          stroke="var(--ob-dp)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 28 28)"
          style={{ transition: 'stroke-dashoffset 400ms ease' }}
        />
        <text x="28" y="33" textAnchor="middle" fontSize="11" fontWeight="500" fill="var(--ob-dp)">{pct}%</text>
      </svg>
      <div>
        <div className="ob-completion__pct">{pct}%</div>
        <div className="ob-completion__label">Profile complete</div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function OnboardAllyPage() {
  const [step, setStep] = useState(1);

  // Form state
  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [tagline, setTagline] = useState('');
  const [ownWords, setOwnWords] = useState('');
  const [bio, setBio] = useState('');

  // Chip selections
  const [selectedSpecialities, setSelectedSpecialities] = useState<string[]>(['heartbreak', 'loneliness']);
  const [selectedModalities, setSelectedModalities] = useState<string[]>(['CBT', 'ACT']);
  const [selectedAges, setSelectedAges] = useState<string[]>(['18-24', '25-34']);
  const [selectedGenders, setSelectedGenders] = useState<string[]>(['Any gender']);
  const [selectedTones, setSelectedTones] = useState<string[]>(['Warm & nurturing']);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['🎥 Online']);
  const [selectedDurations, setSelectedDurations] = useState<string[]>(['60min']);

  // Availability grid
  const [avail, setAvail] = useState<Availability>({
    'Morning (9AM–12PM)_Mon–Wed': true,
    'Afternoon (12–4PM)_Thu–Fri': true,
    'Afternoon (12–4PM)_Sat': true,
    'Evening (4–9PM)_Mon–Wed': true,
    'Evening (4–9PM)_Thu–Fri': true,
  });

  // Match weights
  const [weights, setWeights] = useState<Record<string, number>>(
    Object.fromEntries(MATCH_WEIGHTS.map((m) => [m.key, m.val]))
  );

  // Toggles step 3
  const [visibility, setVisibility] = useState({ search: false, bookings: false, matching: true, featured: false });
  const [price, setPrice] = useState(1200);
  const [experience, setExperience] = useState(7);
  const [maxClients, setMaxClients] = useState(12);

  const goToStep = (n: number) => setStep(n);

  const toggleChip = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const toggleAvail = (row: string, col: string) => {
    const key = `${row}_${col}`;
    setAvail((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Derived values for preview
  const previewName    = fullName || 'Ally Name';
  const previewInitials= fullName ? fullName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() : '?';
  const previewTagline = tagline  || 'Role · Experience · City';
  const previewQuote   = ownWords || 'Their words will appear here…';

  // Preview tags: first 2 selected = filled, rest = outline
  const previewTags = [...selectedSpecialities].slice(0, 4);

  return (
    <div>
      {/* Step progress */}
      <nav className="ob-step-progress" aria-label="Onboarding steps" role="tablist">
        {STEP_LABELS.map((s, i) => {
          const n = i + 1;
          const isActive = n === step;
          const isDone   = n < step;
          return (
            <button
              key={n}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => goToStep(n)}
              className={`ob-step-item${isActive ? ' ob-step-item--active' : ''}${isDone ? ' ob-step-item--done' : ''}`}
              style={{ border: 'none', background: 'none', cursor: 'pointer', textAlign: 'center' }}
            >
              <div className="ob-step-item__num">{isDone ? '✓' : n}</div>
              <div className="ob-step-item__label">{s.label}</div>
              <div className="ob-step-item__sub">{s.sub}</div>
            </button>
          );
        })}
      </nav>

      {/* Content grid */}
      <div className="ob-content-grid">

        {/* ── FORM PANEL ── */}
        <div>
          <div className="ob-form-panel">

            {/* ═══════ STEP 1 — Personal Identity ═══════ */}
            {step === 1 && (
              <>
                <div className="ob-panel-header">
                  <div>
                    <div className="ob-panel-header__eyebrow">Step 1 of 5</div>
                    <div className="ob-panel-header__title">Personal Identity</div>
                    <div className="ob-panel-header__sub">
                      This is what clients see first — the face, the name, the words that make them feel safe enough to book.
                    </div>
                  </div>
                </div>

                {/* Core identity */}
                <div className="ob-form-section">
                  <div className="ob-section-title">Core identity</div>
                  <div className="ob-grid-2">
                    <div className="ob-field">
                      <label className="ob-field__label">Full name <span style={{ color: 'var(--ob-terra)' }}>*</span></label>
                      <input className="ob-field__input" placeholder="e.g. Priya Nair" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </div>
                    <div className="ob-field">
                      <label className="ob-field__label">Display name</label>
                      <div className="ob-field__hint">Shown on the card. Defaults to first name.</div>
                      <input className="ob-field__input" placeholder="e.g. Priya" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                    </div>
                    <div className="ob-field">
                      <label className="ob-field__label">Pronouns <span style={{ color: 'var(--ob-terra)' }}>*</span></label>
                      <select className="ob-field__select">
                        <option value="">Select pronouns</option>
                        <option>she / her</option>
                        <option>he / him</option>
                        <option>they / them</option>
                        <option>she / they</option>
                        <option>he / they</option>
                        <option>any pronouns</option>
                        <option>prefer not to say</option>
                      </select>
                    </div>
                    <div className="ob-field">
                      <label className="ob-field__label">City / Location <span style={{ color: 'var(--ob-terra)' }}>*</span></label>
                      <input className="ob-field__input" placeholder="e.g. Bangalore" />
                    </div>
                  </div>
                </div>

                {/* Profile photo */}
                <div className="ob-form-section">
                  <div className="ob-section-title">Profile photo</div>
                  <div className="ob-photo-upload">
                    <div className="ob-photo-preview">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="8" r="4" stroke="#5C7A66" strokeWidth="1.3"/>
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#5C7A66" strokeWidth="1.3" strokeLinecap="round"/>
                      </svg>
                      <span className="ob-photo-preview__label">Photo</span>
                    </div>
                    <div className="ob-photo-meta">
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ob-dp)' }}>Upload profile photo</div>
                      <div style={{ fontSize: 11, color: 'var(--ob-moss)', opacity: 0.6, lineHeight: 1.5 }}>
                        Square, at least 400×400px. JPEG or PNG.
                      </div>
                      <button type="button" className="ob-btn-upload">
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1v9M3 5l4-4 4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        Choose file
                      </button>
                    </div>
                  </div>
                </div>

                {/* Voice & bio */}
                <div className="ob-form-section">
                  <div className="ob-section-title">Voice &amp; bio</div>
                  <div className="ob-grid-1">
                    <div className="ob-field">
                      <label className="ob-field__label">Short tagline <span style={{ color: 'var(--ob-terra)' }}>*</span></label>
                      <input
                        className="ob-field__input" maxLength={80}
                        placeholder="Counsellor · 7 years · Bangalore"
                        value={tagline} onChange={(e) => setTagline(e.target.value)}
                      />
                      <div className="ob-char-counter">{tagline.length}/80</div>
                    </div>
                    <div className="ob-field">
                      <label className="ob-field__label">In their own words <span style={{ color: 'var(--ob-terra)' }}>*</span></label>
                      <div className="ob-field__hint">Personal quote shown on profile card</div>
                      <textarea
                        className="ob-field__textarea" maxLength={200}
                        placeholder="A personal quote that appears on the ally card…"
                        rows={3} value={ownWords} onChange={(e) => setOwnWords(e.target.value)}
                      />
                      <div className="ob-char-counter">{ownWords.length}/200</div>
                    </div>
                    <div className="ob-field">
                      <label className="ob-field__label">Full bio</label>
                      <div className="ob-field__hint">3-4 sentences for expanded profile</div>
                      <textarea
                        className="ob-field__textarea" maxLength={600}
                        placeholder="3-4 sentences about background, approach, and what makes this ally unique…"
                        rows={4} value={bio} onChange={(e) => setBio(e.target.value)}
                      />
                      <div className="ob-char-counter">{bio.length}/600</div>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="ob-form-section">
                  <div className="ob-section-title">Contact &amp; onboarding</div>
                  <div className="ob-grid-2">
                    <div className="ob-field">
                      <label className="ob-field__label">Email <span style={{ color: 'var(--ob-terra)' }}>*</span></label>
                      <input className="ob-field__input" type="email" placeholder="ally@example.com" />
                    </div>
                    <div className="ob-field">
                      <label className="ob-field__label">Phone <span style={{ color: 'var(--ob-terra)' }}>*</span></label>
                      <input className="ob-field__input" type="tel" placeholder="+91 98765 43210" />
                    </div>
                    <div className="ob-field">
                      <label className="ob-field__label">WhatsApp number</label>
                      <div className="ob-field__hint">Used for session reminders</div>
                      <input className="ob-field__input" type="tel" placeholder="+91 98765 43210" />
                    </div>
                    <div className="ob-field">
                      <label className="ob-field__label">Emergency / Admin contact</label>
                      <div className="ob-field__hint">Internal use only</div>
                      <input className="ob-field__input" placeholder="Name · number" />
                    </div>
                  </div>
                </div>

                <div className="ob-panel-footer">
                  <div className="ob-panel-footer__left">Auto-saved</div>
                  <div className="ob-footer-actions">
                    <button type="button" className="ob-btn ob-btn--ghost ob-btn--sm">Save draft</button>
                    <button type="button" className="ob-btn ob-btn--primary" onClick={() => goToStep(2)}>
                      Next: Expertise →
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ═══════ STEP 2 — Expertise ═══════ */}
            {step === 2 && (
              <>
                <div className="ob-panel-header">
                  <div>
                    <div className="ob-panel-header__eyebrow">Step 2 of 5</div>
                    <div className="ob-panel-header__title">Expertise &amp; Approach</div>
                    <div className="ob-panel-header__sub">
                      This powers the matching engine. The more precisely defined, the better the client–ally fit.
                    </div>
                  </div>
                </div>

                {/* Credentials */}
                <div className="ob-form-section">
                  <div className="ob-section-title">Credentials</div>
                  <div className="ob-grid-2">
                    <div className="ob-field">
                      <label className="ob-field__label">Primary role</label>
                      <select className="ob-field__select">
                        <option>Counsellor</option>
                        <option>Psychologist (RCI Registered)</option>
                        <option>Clinical Psychologist</option>
                        <option>Therapist</option>
                        <option>Life Coach (Certified)</option>
                        <option>Peer Support Specialist</option>
                        <option>Ally (Trained Listener)</option>
                      </select>
                    </div>
                    <div className="ob-field">
                      <label className="ob-field__label">Years of experience</label>
                      <div className="ob-range-row">
                        <input type="range" min={0} max={30} value={experience} onChange={(e) => setExperience(Number(e.target.value))} />
                        <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--ob-dp)', minWidth: 48, textAlign: 'right' }}>
                          {experience} yrs
                        </span>
                      </div>
                    </div>
                    <div className="ob-field">
                      <label className="ob-field__label">Highest qualification</label>
                      <input className="ob-field__input" placeholder="e.g. M.Phil Clinical Psychology, NIMHANS" />
                    </div>
                    <div className="ob-field">
                      <label className="ob-field__label">License / Registration no</label>
                      <input className="ob-field__input" placeholder="e.g. RCI/2019/KA/04821" />
                    </div>
                    <div className={`ob-field ob-field--span2`}>
                      <label className="ob-field__label">Additional certifications</label>
                      <textarea className="ob-field__textarea" rows={2} placeholder="List any additional certifications…" />
                    </div>
                  </div>
                </div>

                {/* Specialisations */}
                <div className="ob-form-section">
                  <div className="ob-section-title">Specialisations</div>
                  <div className="ob-notice ob-notice--info" style={{ marginBottom: 14 }}>
                    <svg className="ob-notice__icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--ob-moss)" strokeWidth="1.4" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 7v4M8 5.5V6"/></svg>
                    <div className="ob-notice__body">First 2 selected specialities appear as filled tags on the ally card</div>
                  </div>
                  <div className="ob-chip-group">
                    {SPECIALITIES.map((s) => (
                      <button
                        key={s} type="button"
                        className={`ob-chip-opt${selectedSpecialities.includes(s) ? ' selected' : ''}`}
                        onClick={() => toggleChip(selectedSpecialities, setSelectedSpecialities, s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Modalities */}
                <div className="ob-form-section">
                  <div className="ob-section-title">Therapeutic modalities</div>
                  <div className="ob-chip-group">
                    {MODALITIES.map((m) => (
                      <button
                        key={m} type="button"
                        className={`ob-chip-opt${selectedModalities.includes(m) ? ' selected' : ''}`}
                        onClick={() => toggleChip(selectedModalities, setSelectedModalities, m)}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Client fit */}
                <div className="ob-form-section">
                  <div className="ob-section-title">Client fit</div>
                  <div className="ob-grid-2">
                    <div className="ob-field">
                      <label className="ob-field__label">Age groups</label>
                      <div className="ob-chip-group" style={{ padding: 10 }}>
                        {AGE_GROUPS.map((a) => (
                          <button key={a} type="button"
                            className={`ob-chip-opt${selectedAges.includes(a) ? ' selected' : ''}`}
                            onClick={() => toggleChip(selectedAges, setSelectedAges, a)}
                          >
                            {a}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="ob-field">
                      <label className="ob-field__label">Gender preference</label>
                      <div className="ob-chip-group" style={{ padding: 10 }}>
                        {GENDERS.map((g) => (
                          <button key={g} type="button"
                            className={`ob-chip-opt${selectedGenders.includes(g) ? ' selected' : ''}`}
                            onClick={() => toggleChip(selectedGenders, setSelectedGenders, g)}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="ob-field">
                      <label className="ob-field__label">Languages spoken</label>
                      <input className="ob-field__input" defaultValue="English, Tamil" />
                    </div>
                    <div className="ob-field">
                      <label className="ob-field__label">Languages for therapy</label>
                      <input className="ob-field__input" defaultValue="English & Tamil" />
                    </div>
                  </div>
                </div>

                {/* Approach style */}
                <div className="ob-form-section">
                  <div className="ob-section-title">Approach style</div>
                  <div className="ob-grid-1">
                    <div className="ob-field">
                      <label className="ob-field__label">Session style description</label>
                      <textarea className="ob-field__textarea" rows={3} placeholder="Describe your approach to sessions…" />
                    </div>
                    <div className="ob-field">
                      <label className="ob-field__label">Session tone</label>
                      <div className="ob-chip-group">
                        {TONES.map((t) => (
                          <button key={t} type="button"
                            className={`ob-chip-opt${selectedTones.includes(t) ? ' selected' : ''}`}
                            onClick={() => toggleChip(selectedTones, setSelectedTones, t)}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ob-panel-footer">
                  <div className="ob-panel-footer__left">Auto-saved</div>
                  <div className="ob-footer-actions">
                    <button type="button" className="ob-btn ob-btn--ghost ob-btn--sm" onClick={() => goToStep(1)}>Back</button>
                    <button type="button" className="ob-btn ob-btn--ghost ob-btn--sm">Save draft</button>
                    <button type="button" className="ob-btn ob-btn--primary" onClick={() => goToStep(3)}>
                      Next: Sessions →
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ═══════ STEP 3 — Session Format ═══════ */}
            {step === 3 && (
              <>
                <div className="ob-panel-header">
                  <div>
                    <div className="ob-panel-header__eyebrow">Step 3 of 5</div>
                    <div className="ob-panel-header__title">Session Format &amp; Availability</div>
                    <div className="ob-panel-header__sub">
                      This controls what clients see on the booking card and what the scheduler uses to surface available slots.
                    </div>
                  </div>
                </div>

                {/* Format & pricing */}
                <div className="ob-form-section">
                  <div className="ob-section-title">Format &amp; pricing</div>
                  <div className="ob-grid-2">
                    <div className="ob-field">
                      <label className="ob-field__label">Session format</label>
                      <div className="ob-chip-group" style={{ padding: 10 }}>
                        {FORMATS.map((f) => (
                          <button key={f} type="button"
                            className={`ob-chip-opt${selectedFormats.includes(f) ? ' selected' : ''}`}
                            onClick={() => toggleChip(selectedFormats, setSelectedFormats, f)}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="ob-field">
                      <label className="ob-field__label">Session duration</label>
                      <div className="ob-chip-group" style={{ padding: 10 }}>
                        {DURATIONS.map((d) => (
                          <button key={d} type="button"
                            className={`ob-chip-opt${selectedDurations.includes(d) ? ' selected' : ''}`}
                            onClick={() => toggleChip(selectedDurations, setSelectedDurations, d)}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="ob-field">
                      <label className="ob-field__label">Session price (₹)</label>
                      <div className="ob-price-row">
                        <div className="ob-price-prefix">₹</div>
                        <input
                          className="ob-field__input" type="number"
                          value={price} onChange={(e) => setPrice(Number(e.target.value))}
                          style={{ borderRadius: '0 9px 9px 0' }}
                        />
                      </div>
                    </div>
                    <div className="ob-field">
                      <label className="ob-field__label">Intro session price (₹) <span style={{ fontSize: 11, color: 'var(--ob-moss)', opacity: 0.6 }}>optional</span></label>
                      <div className="ob-price-row">
                        <div className="ob-price-prefix">₹</div>
                        <input className="ob-field__input" type="number" placeholder="800" style={{ borderRadius: '0 9px 9px 0' }} />
                      </div>
                    </div>
                    <div className="ob-field">
                      <label className="ob-field__label">Max clients / week</label>
                      <div className="ob-range-row">
                        <input type="range" min={1} max={30} value={maxClients} onChange={(e) => setMaxClients(Number(e.target.value))} />
                        <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--ob-dp)', minWidth: 48, textAlign: 'right' }}>
                          {maxClients}
                        </span>
                      </div>
                    </div>
                    <div className="ob-field">
                      <label className="ob-field__label">Buffer between sessions</label>
                      <select className="ob-field__select">
                        <option>10 min</option>
                        <option selected>15 min</option>
                        <option>30 min</option>
                        <option>45 min</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Availability grid */}
                <div className="ob-form-section">
                  <div className="ob-section-title">Typical weekly availability</div>
                  <div className="ob-avail-grid">
                    {/* Header row */}
                    <div className="ob-avail-cell header" />
                    {AVAIL_COLS.map((col) => (
                      <div key={col} className="ob-avail-cell header">{col}</div>
                    ))}
                    {/* Data rows */}
                    {AVAIL_ROWS.map((row) => (
                      <>
                        <div key={`${row}-label`} className="ob-avail-cell day-header">{row}</div>
                        {AVAIL_COLS.map((col) => {
                          const key = `${row}_${col}`;
                          return (
                            <div
                              key={key}
                              className={`ob-avail-cell${avail[key] ? ' selected' : ''}`}
                              onClick={() => toggleAvail(row, col)}
                            >
                              {avail[key] ? '✓ Available' : 'Tap to add'}
                            </div>
                          );
                        })}
                      </>
                    ))}
                  </div>
                </div>

                {/* Visibility toggles */}
                <div className="ob-form-section">
                  <div className="ob-section-title">Platform visibility settings</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { key: 'search',   label: 'Visible in search results',      desc: 'Toggle off during onboarding review' },
                      { key: 'bookings', label: 'Accepting new bookings',          desc: 'Enable once documents are verified' },
                      { key: 'matching', label: 'Include in matching algorithm',   desc: 'Shows up in post-assessment suggestions' },
                      { key: 'featured', label: 'Featured ally',                   desc: 'Shown at top of match results with a subtle highlight' },
                    ].map((t) => (
                      <div key={t.key} className="ob-toggle-row">
                        <div className="ob-toggle-row__info">
                          <div className="ob-toggle-row__title">{t.label}</div>
                          <div className="ob-toggle-row__desc">{t.desc}</div>
                        </div>
                        <label className="ns-toggle">
                          <input
                            type="checkbox"
                            checked={visibility[t.key as keyof typeof visibility]}
                            onChange={(e) => setVisibility((v) => ({ ...v, [t.key]: e.target.checked }))}
                          />
                          <div className="ns-toggle__track" />
                          <div className="ns-toggle__thumb" />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="ob-panel-footer">
                  <div className="ob-panel-footer__left">Auto-saved</div>
                  <div className="ob-footer-actions">
                    <button type="button" className="ob-btn ob-btn--ghost ob-btn--sm" onClick={() => goToStep(2)}>Back</button>
                    <button type="button" className="ob-btn ob-btn--ghost ob-btn--sm">Save draft</button>
                    <button type="button" className="ob-btn ob-btn--primary" onClick={() => goToStep(4)}>
                      Next: Documents →
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ═══════ STEP 4 — Documents ═══════ */}
            {step === 4 && (
              <>
                <div className="ob-panel-header">
                  <div>
                    <div className="ob-panel-header__eyebrow">Step 4 of 5</div>
                    <div className="ob-panel-header__title">Document Verification</div>
                    <div className="ob-panel-header__sub">
                      Required before the ally goes live. Marked documents are mandatory — others are strongly recommended.
                    </div>
                  </div>
                </div>

                {/* Identity & credentials */}
                <div className="ob-form-section">
                  <div className="ob-section-title">Identity &amp; credentials</div>
                  <div className="ob-doc-grid">
                    <div className="ob-doc-card uploaded">
                      <div className="ob-doc-required">Required</div>
                      <div className="ob-doc-card__icon">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><rect x="3" y="1" width="10" height="14" rx="1.5"/><path d="M6 5h4M6 8h4M6 11h2"/></svg>
                      </div>
                      <div className="ob-doc-card__name">Government ID</div>
                      <div className="ob-doc-card__meta">Aadhaar / PAN / Passport. Both sides if Aadhaar.</div>
                      <div className="ob-doc-card__status ob-doc-card__status--ok">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 5l2.5 2.5 3.5-4"/></svg>
                        Uploaded
                      </div>
                    </div>
                    <div className="ob-doc-card">
                      <div className="ob-doc-required">Required</div>
                      <div className="ob-doc-card__icon">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><rect x="3" y="1" width="10" height="14" rx="1.5"/><path d="M6 5h4M6 8h4M6 11h2"/></svg>
                      </div>
                      <div className="ob-doc-card__name">Degree Certificate / Transcript</div>
                      <div className="ob-doc-card__meta">Highest relevant qualification. Certified copy accepted.</div>
                      <div className="ob-doc-card__status ob-doc-card__status--pending">Pending upload</div>
                    </div>
                    <div className="ob-doc-card">
                      <div className="ob-doc-required">Required</div>
                      <div className="ob-doc-card__icon">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><rect x="3" y="1" width="10" height="14" rx="1.5"/><path d="M6 5h4M6 8h4M6 11h2"/></svg>
                      </div>
                      <div className="ob-doc-card__name">Professional License / RCI No.</div>
                      <div className="ob-doc-card__meta">Registration certificate from relevant body.</div>
                      <div className="ob-doc-card__status ob-doc-card__status--pending">Pending upload</div>
                    </div>
                    <div className="ob-doc-card">
                      <div className="ob-doc-card__icon">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><rect x="3" y="1" width="10" height="14" rx="1.5"/><path d="M6 5h4M6 8h4M6 11h2"/></svg>
                      </div>
                      <div className="ob-doc-card__name">Additional Certifications</div>
                      <div className="ob-doc-card__meta">Optional. Any supplementary credentials.</div>
                      <div className="ob-doc-card__status ob-doc-card__status--pending">Pending upload</div>
                    </div>
                  </div>
                </div>

                {/* Safety & compliance */}
                <div className="ob-form-section">
                  <div className="ob-section-title">Safety &amp; compliance</div>
                  <div className="ob-doc-grid">
                    <div className="ob-doc-card">
                      <div className="ob-doc-required">Required</div>
                      <div className="ob-doc-card__icon">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><path d="M8 2Q12 3 13 7Q13 11 8 14Q3 11 3 7Q4 3 8 2Z"/></svg>
                      </div>
                      <div className="ob-doc-card__name">Background Check Consent</div>
                      <div className="ob-doc-card__meta">Signed consent form for police verification.</div>
                      <div className="ob-doc-card__status ob-doc-card__status--pending">Pending upload</div>
                    </div>
                    <div className="ob-doc-card">
                      <div className="ob-doc-card__icon">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><path d="M8 2Q12 3 13 7Q13 11 8 14Q3 11 3 7Q4 3 8 2Z"/></svg>
                      </div>
                      <div className="ob-doc-card__name">Professional Indemnity Insurance</div>
                      <div className="ob-doc-card__meta">Optional. Strongly recommended for clinical roles.</div>
                      <div className="ob-doc-card__status ob-doc-card__status--pending">Pending upload</div>
                    </div>
                    <div className="ob-doc-card ob-field--span2" style={{ gridColumn: '1 / -1' }}>
                      <div className="ob-doc-required">Required</div>
                      <div className="ob-doc-card__icon">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><rect x="3" y="1" width="10" height="14" rx="1.5"/><path d="M6 5h4M6 8h4M6 11h2"/></svg>
                      </div>
                      <div className="ob-doc-card__name">Signed Platform Agreement &amp; Code of Conduct</div>
                      <div className="ob-doc-card__meta">Awaiting review stage — will be sent via email once Step 4 is complete.</div>
                      <div className="ob-doc-card__status ob-doc-card__status--pending">Awaiting review stage</div>
                    </div>
                  </div>
                </div>

                {/* Admin notes */}
                <div className="ob-form-section">
                  <div className="ob-section-title">Admin notes (internal)</div>
                  <div className="ob-field">
                    <textarea
                      className="ob-field__textarea" rows={4}
                      placeholder="Internal notes about this application. Not visible to the ally or clients."
                    />
                    <div className="ob-field__hint">Internal only. Not visible to the ally or clients.</div>
                  </div>
                </div>

                <div className="ob-panel-footer">
                  <div className="ob-panel-footer__left">2 of 6 documents uploaded</div>
                  <div className="ob-footer-actions">
                    <button type="button" className="ob-btn ob-btn--ghost ob-btn--sm" onClick={() => goToStep(3)}>Back</button>
                    <button type="button" className="ob-btn ob-btn--ghost ob-btn--sm">Save draft</button>
                    <button type="button" className="ob-btn ob-btn--primary" onClick={() => goToStep(5)}>
                      Next: Matching →
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ═══════ STEP 5 — Matching Engine ═══════ */}
            {step === 5 && (
              <>
                <div className="ob-panel-header">
                  <div>
                    <div className="ob-panel-header__eyebrow">Step 5 of 5</div>
                    <div className="ob-panel-header__title">Matching Engine Configuration</div>
                    <div className="ob-panel-header__sub">
                      These weights tell the algorithm how strongly to surface this ally for specific assessment outcomes.
                    </div>
                  </div>
                </div>

                {/* Match weights */}
                <div className="ob-form-section">
                  <div className="ob-section-title">Assessment → Ally match weights</div>
                  <div className="ob-notice ob-notice--info" style={{ marginBottom: 16 }}>
                    <svg className="ob-notice__icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--ob-moss)" strokeWidth="1.4" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 7v4M8 5.5V6"/></svg>
                    <div className="ob-notice__body">
                      Higher weights increase the likelihood this ally appears for users whose assessment matches that category.
                      Weights are relative, not absolute thresholds.
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {MATCH_WEIGHTS.map((m) => (
                      <div key={m.key} className="ob-match-row">
                        <div className="ob-match-row__label">{m.label}</div>
                        <span className={`ob-match-row__tag ${m.tag === 'Primary' ? 'ob-tag-primary' : 'ob-tag-secondary'}`}>
                          {m.tag}
                        </span>
                        <div className="ob-match-bar">
                          <input
                            type="range" min={0} max={100}
                            value={weights[m.key]}
                            onChange={(e) => setWeights((prev) => ({ ...prev, [m.key]: Number(e.target.value) }))}
                            style={{ flex: 1, height: 4, borderRadius: 4, outline: 'none', cursor: 'pointer' }}
                          />
                          <span style={{ fontSize: 11, color: 'var(--ob-moss)', width: 36, textAlign: 'right', opacity: 0.8 }}>
                            {weights[m.key]}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tiebreaker */}
                <div className="ob-form-section">
                  <div className="ob-section-title">Tiebreaker preferences</div>
                  <div className="ob-grid-2">
                    <div className="ob-field">
                      <label className="ob-field__label">Sort order priority</label>
                      <select className="ob-field__select">
                        <option>Earliest availability</option>
                        <option>Lowest price</option>
                        <option>Featured status</option>
                        <option>Random</option>
                      </select>
                    </div>
                    <div className="ob-field">
                      <label className="ob-field__label">Manual priority score (0–10)</label>
                      <div className="ob-field__hint">Boosts ranking slightly when scores are equal</div>
                      <input className="ob-field__input" type="number" min={0} max={10} defaultValue={7} />
                    </div>
                  </div>
                </div>

                {/* Review */}
                <div className="ob-form-section">
                  <div className="ob-section-title">Review &amp; activate</div>
                  <div className="ob-notice ob-notice--warn">
                    <svg className="ob-notice__icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--ob-terra)" strokeWidth="1.4" strokeLinecap="round"><path d="M8 3v5M8 10.5V11"/><path d="M3 13L8 3l5 10H3z"/></svg>
                    <div className="ob-notice__body">
                      <strong>Not yet live.</strong> This ally profile is saved as a draft. To make them visible to clients,
                      toggle &apos;Visible in search results&apos; and &apos;Accepting new bookings&apos; on step 3 after all required documents are verified.
                    </div>
                  </div>
                </div>

                <div className="ob-panel-footer">
                  <div className="ob-panel-footer__left">Draft · Not yet published</div>
                  <div className="ob-footer-actions">
                    <button type="button" className="ob-btn ob-btn--ghost ob-btn--sm" onClick={() => goToStep(4)}>Back</button>
                    <button type="button" className="ob-btn ob-btn--secondary">Save as draft</button>
                    <button type="button" className="ob-btn ob-btn--primary">Submit for review →</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── PREVIEW COLUMN ── */}
        <div className="ob-preview-col">
          {/* Completion ring */}
          <CompletionRing step={step} />

          {/* Profile card preview */}
          <div className="ob-preview-card">
            <div className="ob-preview-left">
              <div className="ob-preview-avatar">{previewInitials}</div>
              <div className="ob-preview-name">{previewName}</div>
              <div className="ob-preview-role">{previewTagline}</div>
              <div className="ob-preview-badges">
                <span className="ob-preview-badge">she / her</span>
                <span className="ob-preview-badge">Bangalore</span>
              </div>
            </div>
            <div className="ob-preview-right">
              <div>
                <div className="ob-preview-label">Specialises in</div>
                <div className="ob-preview-tags">
                  {previewTags.slice(0, 2).map((t) => (
                    <span key={t} className="ob-preview-tag ob-preview-tag--filled">{t}</span>
                  ))}
                  {previewTags.slice(2).map((t) => (
                    <span key={t} className="ob-preview-tag ob-preview-tag--outline">{t}</span>
                  ))}
                </div>
              </div>
              {previewQuote !== 'Their words will appear here…' && (
                <div className="ob-preview-quote">&ldquo;{previewQuote}&rdquo;</div>
              )}
              <div className="ob-preview-divider" />
              <div className="ob-preview-row">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><rect x="2" y="2" width="12" height="12" rx="2"/><path d="M8 5v4M6 9h4"/></svg>
                {selectedDurations[0] ?? '60min'}
              </div>
              <div className="ob-preview-row">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><path d="M8 2a4 4 0 0 1 4 4c0 5-4 8-4 8S4 11 4 6a4 4 0 0 1 4-4z"/><circle cx="8" cy="6" r="1.5"/></svg>
                {selectedFormats[0]?.replace('🎥 ', '').replace('📍 ', '') ?? 'Online'}
              </div>
              <div className="ob-preview-row">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg>
                ₹{price.toLocaleString()}/session
              </div>
            </div>
          </div>

          {/* Match strength preview */}
          <div className="ob-match-score">
            <div className="ob-match-score__title">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6L13 13M3 13l1.4-1.4M11.6 4.4L13 3"/></svg>
              Match strength preview
            </div>
            <div className="ob-match-bar-row">
              {[
                { label: 'Loneliness', key: 'loneliness' },
                { label: 'Heartbreak', key: 'heartbreak' },
                { label: 'Family',     key: 'family' },
                { label: 'Overwhelm',  key: 'overwhelm' },
              ].map((m) => (
                <div key={m.key} className="ob-match-bar-item">
                  <div className="ob-match-bar-label">{m.label}</div>
                  <div className="ob-match-bar-track">
                    <div className="ob-match-bar-fill" style={{ width: `${weights[m.key] ?? 0}%` }} />
                  </div>
                  <div className="ob-match-bar-pct">{weights[m.key] ?? 0}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
