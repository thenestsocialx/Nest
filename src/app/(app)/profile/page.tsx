import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import ProfileShell from '@/components/profile/ProfileShell'

export const metadata = {
  title: 'Profile & Settings — Nest',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      full_name, display_name, phone, phone_country_code, preferred_language,
      city, plan, subscription_status, avatar_url,
      nila_tone, nila_memory_enabled, nila_limit_reminder,
      notify_email_updates, notify_event_reminders, notify_ally_reminders,
      anonymous_mode
    `)
    .eq('id', user.id)
    .maybeSingle()

  const firstName = profile?.display_name ?? profile?.full_name?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'there'
  const initial = firstName[0]?.toUpperCase() ?? 'A'

  return (
    <div className="ns-shell ns-shell--locked">
      <Sidebar userName={firstName} userInitial={initial} />

      <div className="ns-main">
        <ProfileShell
          profile={profile}
          email={user.email ?? ''}
          userInitial={initial}
          firstName={firstName}
        />
        <BottomNav />
      </div>
    </div>
  )
}
