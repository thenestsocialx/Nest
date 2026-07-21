interface Entry {
  id:         string
  entry_text: string
  detail?:    string | null
  created_at: string
}

interface Props {
  entries: Entry[]
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
  })
}

export default function KanmaniProofOfLife({ entries }: Props) {
  return (
    <section className="kf-section kf-section--light">
      <span className="kf-eyebrow" data-kf-reveal>What Happens Next</span>

      {entries.length === 0 ? (
        <div className="kf-proof-empty" data-kf-reveal>
          <p className="kf-proof-line">
            &ldquo;Someone else&apos;s Kanmani needed this today.&rdquo;
          </p>
          <p className="kf-proof-desc">
            Nothing here yet. The first entry appears the moment the first session
            gets funded — no names, no identifying detail, just what actually changed.
          </p>
        </div>
      ) : (
        <div className="kf-entries-grid">
          {entries.map((entry, i) => (
            <div
              key={entry.id}
              className="kf-entry-card"
              data-kf-reveal
              data-kf-delay={String(Math.min(i + 1, 5))}
            >
              <p className="kf-entry-card__text">&ldquo;{entry.entry_text}&rdquo;</p>
              {entry.detail && (
                <p className="kf-entry-card__detail">{entry.detail}</p>
              )}
              <p className="kf-entry-card__date">{formatDate(entry.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
