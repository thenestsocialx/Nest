import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isPhoneAuthEmail, PHONE_COUNTRY_CODES } from '@/lib/phone-auth'
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
  // Phone sign-ups carry an internal placeholder email — don't show it
  const email = isPhoneAuthEmail(user.email) ? '' : (user.email ?? '')

  // Pre-fill the number already verified by phone sign-in (stored as digits, e.g. 919876543210)
  const verifiedPhone = user.phone ? `+${user.phone}` : ''
  const verifiedCountry = [...PHONE_COUNTRY_CODES]
    .sort((a, b) => b.code.length - a.code.length)
    .find((c) => verifiedPhone.startsWith(c.code))
  const defaultCountryCode = verifiedCountry?.code ?? '+91'
  const defaultPhone = verifiedCountry ? verifiedPhone.slice(verifiedCountry.code.length) : ''

  return (
    <main className="ns-signup">
      {/* Left — form column */}
      <div className="ns-signup__form-col">
        <div className="ns-signup__nav">
          <NestLogo size={18} color="#2F4C3A" />
        </div>

        <SignupForm
          defaultName={defaultName}
          email={email}
          defaultCountryCode={defaultCountryCode}
          defaultPhone={defaultPhone}
        />
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
