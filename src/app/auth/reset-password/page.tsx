import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NestLogo from '@/components/ui/NestLogo'
import ResetPasswordForm from './_components/ResetPasswordForm'

export const metadata = {
  title: 'Set new password — Nest',
}

export default async function ResetPasswordPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/forgot-password?error=link_expired')
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--cream)',
        padding: '40px 24px',
      }}
    >
      <div style={{ marginBottom: 40 }}>
        <NestLogo size={18} color="#2F4C3A" />
      </div>
      <ResetPasswordForm />
    </main>
  )
}
