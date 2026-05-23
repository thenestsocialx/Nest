const PUBLISHED = [
  { icon: '🎵', title: 'For nights when quiet feels too loud', tags: ['Loneliness', 'Healing'] },
  { icon: '📄', title: 'Why feeling lonely in a crowd is real', tags: ['Loneliness', 'Anxiety'] },
  { icon: '🎬', title: 'Past Lives — a film about letting go', tags: ['Heartbreak', 'Healing'] },
  { icon: '🎧', title: 'Rain on leaves · ambient sound', tags: ['Anxiety', 'Calm'] },
  { icon: '📄', title: 'Talking to someone you trust — how to start', tags: ['Relationships'] },
];

const DRAFTS = [
  { title: 'Morning stillness playlist' },
  { title: 'On trust after betrayal' },
];

const MOOD_TAGS = [
  { tag: 'Loneliness', count: 9 },
  { tag: 'Healing',    count: 7 },
  { tag: 'Anxiety',   count: 6 },
  { tag: 'Heartbreak',count: 5 },
  { tag: 'Calm',      count: 4 },
  { tag: 'Grief',     count: 3 },
  { tag: 'Relationships', count: 3 },
  { tag: 'Trust',     count: 2 },
];

export default function ResourcesPage() {
  return (
    <>
      {/* Header row */}
      <div className="ns-search-row">
        <div className="ns-search-input-wrap">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
            <circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/>
          </svg>
          <input className="ns-search-input" placeholder="Search resources…" />
        </div>
        <select className="ns-select" style={{ width: 140 }}>
          <option>All types</option>
          <option>Audio</option>
          <option>Article</option>
          <option>Video</option>
        </select>
        <select className="ns-select" style={{ width: 140 }}>
          <option>All moods</option>
          {MOOD_TAGS.map((m) => <option key={m.tag}>{m.tag}</option>)}
        </select>
        <button className="ns-btn ns-btn--primary ns-btn--sm">+ Add resource</button>
      </div>

      <div className="ns-two-col">
        {/* Published */}
        <div className="ns-card">
          <div className="ns-card__head">
            <div className="ns-card__label">Published resources</div>
            <span className="ns-badge ns-badge--green">24 resources</span>
          </div>
          {PUBLISHED.map((r, i) => (
            <div key={i} className="ns-resource-row">
              <div className="ns-resource-row__type">{r.icon}</div>
              <div className="ns-resource-row__body">
                <div className="ns-resource-row__title">{r.title}</div>
                <div className="ns-resource-row__tags">
                  {r.tags.map((t) => <span key={t} className="ns-tag">{t}</span>)}
                </div>
              </div>
              <button className="ns-btn ns-btn--ghost ns-btn--sm">Edit</button>
            </div>
          ))}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Drafts */}
          <div className="ns-card">
            <div className="ns-card__head">
              <div className="ns-card__label">Drafts</div>
              <span className="ns-badge ns-badge--amber">3 unpublished</span>
            </div>
            {DRAFTS.map((d, i) => (
              <div key={i} className="ns-resource-row">
                <div className="ns-resource-row__body">
                  <div className="ns-resource-row__title">{d.title}</div>
                </div>
                <button className="ns-btn ns-btn--primary ns-btn--sm">Publish</button>
              </div>
            ))}
          </div>

          {/* Mood tags */}
          <div className="ns-card">
            <div className="ns-card__head">
              <div className="ns-card__label">Mood tags</div>
              <span className="ns-badge ns-badge--gray">Used by Nila</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {MOOD_TAGS.map((m) => (
                <button key={m.tag} className="ns-btn ns-btn--ghost ns-btn--sm" style={{ borderRadius: 20 }}>
                  {m.tag} <span style={{ color: 'var(--ns-ink-4)' }}>·{m.count}</span>
                </button>
              ))}
            </div>
            <button className="ns-btn ns-btn--ghost ns-btn--sm">+ Add tag</button>
          </div>
        </div>
      </div>
    </>
  );
}
