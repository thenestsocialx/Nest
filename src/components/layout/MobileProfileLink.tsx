// Mobile-only avatar link to /profile.
// Rendered in each page's topbar. CSS hides it on desktop (≥1024px)
// where the sidebar's profile link already handles navigation.

export default function MobileProfileLink({ initial }: { initial: string }) {
  return (
    <a
      href="/profile"
      className="ns-topbar-profile"
      aria-label="View your profile"
    >
      <span aria-hidden="true">{initial}</span>
    </a>
  )
}
