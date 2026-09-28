import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NestLogo from '@/components/ui/NestLogo'
import DoorIllustration from '@/components/ui/DoorIllustration'
import RegisterForm from './_components/RegisterForm'

export const metadata = {
  title: 'Create account — Nest',
}

export default async function RegisterPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect('/home')

  return (
    <main className="ns-split">
      <div className="ns-split__left">
        <div className="ns-split__brand">
          <NestLogo size={18} color="#2F4C3A" />
        </div>
        <div className="ns-split__art">
          <DoorIllustration />
        </div>
        <figure className="ns-split__quote">
          <blockquote>
            &ldquo;The hardest part is opening the door. You&rsquo;ve already done that.&rdquo;
          </blockquote>
          <figcaption>— someone who found their way here too</figcaption>
        </figure>
      </div>

      <div className="ns-split__right">
        <RegisterForm />
      </div>
    </main>
  )
}
