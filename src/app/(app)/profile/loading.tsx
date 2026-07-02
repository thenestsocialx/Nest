export default function Loading() {
  return (
    <div className="ns-shell ns-shell--locked">
      <div style={{ background: 'var(--deep-pine)', height: '100vh' }} />
      <main className="ns-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="ns-page-spinner" />
      </main>
    </div>
  )
}
