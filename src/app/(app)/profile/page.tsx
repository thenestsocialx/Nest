import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import ProfileShell from '@/components/profile/ProfileShell'
import type { ActiveSub } from '@/components/profile/ProfileShell'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Profile & Settings — Nest',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const admin = createAdminClient()

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

  // Use user client — RLS allows authenticated users to read their own subscriptions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subRow, error: subError } = await (supabase as any)
    .from('subscriptions')
    .select('id, plan_id, status, current_period_end, cancel_at_period_end')
    .eq('user_id', user.id)
    .in('status', ['active', 'authenticated', 'paused'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (subError) console.error('[ProfilePage] subscription fetch error:', subError)
  console.log('[ProfilePage] uid=', user.id, '| plan=', profile?.plan, '| subRow=', JSON.stringify(subRow))

  const firstName = profile?.display_name ?? profile?.full_name?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'there'
  const initial = firstName[0]?.toUpperCase() ?? 'A'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sub = subRow as any
  const activeSub: ActiveSub | null = sub
    ? {
        id: sub.id as string,
        status: sub.status as ActiveSub['status'],
        periodEnd: (sub.current_period_end as string | null) ?? null,
        cancelAtEnd: (sub.cancel_at_period_end as boolean) ?? false,
      }
    : null

  return (
    <div className="ns-shell ns-shell--locked">
      <Sidebar userName={firstName} userInitial={initial} />

      <div className="ns-main">
        <ProfileShell
          profile={profile}
          email={user.email ?? ''}
          userInitial={initial}
          firstName={firstName}
          activeSub={activeSub}
        />
        <BottomNav />
      </div>
    </div>
  )
}
