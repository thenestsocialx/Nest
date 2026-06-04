import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NestLogo from '@/components/ui/NestLogo'
import DoorIllustration from '@/components/ui/DoorIllustration'
import SignupForm from './_components/SignupForm'

export const metadata = {
  title: 'Create your account — Nest',
}

export default async function SignupPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('profile_completed, nila_onboarded')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.profile_completed) {
    redirect(profile.nila_onboarded ? '/home' : '/nila/onboarding')
  }

  const defaultName =
    (user.user_metadata?.full_name as string) ??
    (user.user_metadata?.name as string) ??
    ''
  const email = user.email ?? ''

  return (
    <main className="ns-signup">
      {/* Left — form column */}
      <div className="ns-signup__form-col">
        <nav className="ns-signup__nav" aria-label="Site navigation">
          <NestLogo size={18} color="#2F4C3A" />
          <a href="/login" className="ns-signup__signin-link">
            Already have an account? <span>Sign in</span>
          </a>
        </nav>

        <SignupForm defaultName={defaultName} email={email} />
      </div>

      {/* Right — illustration column */}
      <aside className="ns-signup__ill-col" aria-hidden="true">
        <div className="ns-signup__ill-art">
          <DoorIllustration />
        </div>
        <figure className="ns-signup__quote">
          <blockquote>
            &ldquo;The hardest part is opening the door.<br />
            You&rsquo;ve already done that.&rdquo;
          </blockquote>
          <figcaption>&mdash; someone who found their way here too</figcaption>
        </figure>
      </aside>
    </main>
  )
}
