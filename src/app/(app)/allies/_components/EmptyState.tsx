export default function EmptyState() {
  return (
    <div className="fa-empty fa-empty--no-results">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" aria-hidden="true">
        <circle cx="24" cy="24" r="20" strokeWidth="2"/>
        <path d="M18 18l12 12M30 18L18 30" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
      <p>
        No allies match this combination yet. Try different filters, or{' '}
        <a href="/assessment" style={{ color: 'var(--terracotta)', fontWeight: 500 }}>
          take the short assessment
        </a>{' '}
        for a better match.
      </p>
    </div>
  )
}
