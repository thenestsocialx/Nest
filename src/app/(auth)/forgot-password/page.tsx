import Link from 'next/link'
import NestLogo from '@/components/ui/NestLogo'
import DoorIllustration from '@/components/ui/DoorIllustration'
import ForgotPasswordForm from './_components/ForgotPasswordForm'

export const metadata = {
  title: 'Forgot password — Nest',
}

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const expiredLink = error === 'link_expired'

  return (
    <main className="ns-split">
      <div className="ns-split__left">
        <div className="ns-split__brand">
          <Link href="/" aria-label="nest home" style={{ display: 'inline-flex' }}>
            <NestLogo size={18} color="#2F4C3A" />
          </Link>
        </div>
        <div className="ns-split__art">
          <DoorIllustration />
        </div>
        <figure className="ns-split__quote">
          <blockquote>
            &ldquo;I didn&rsquo;t expect to feel this welcomed from the first screen.&rdquo;
          </blockquote>
          <figcaption>— Riya, 26 · Mumbai</figcaption>
        </figure>
      </div>

      <div className="ns-split__right">
        <ForgotPasswordForm expiredLink={expiredLink} />
      </div>
    </main>
  )
}
