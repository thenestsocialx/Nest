export default function Loading() {
  return (
    <div className="ns-shell">
      <div style={{ background: 'var(--deep-pine)', minHeight: '100vh' }} />
      <main className="ns-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="ns-page-spinner" />
      </main>
    </div>
  )
}
