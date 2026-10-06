import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import NestLogo from '@/components/ui/NestLogo'
import DoorIllustration from '@/components/ui/DoorIllustration'
import LoginForm from './_components/LoginForm'

export const metadata = {
  title: 'Sign in — Nest',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/home')
  }

  const { error } = await searchParams

  return (
    <main className="ns-split">
      {/* Left — illustration column */}
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

      {/* Right — form */}
      <div className="ns-split__right">
        <LoginForm urlError={error} />
      </div>
    </main>
  )
}
