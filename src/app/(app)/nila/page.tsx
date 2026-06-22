import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getConfig, getPeriodStart } from '@/lib/nila-config'
import { loadActiveNilaSession } from '@/actions/nila'
import ChatShell from './_components/ChatShell'

export const metadata = {
  title: 'Nila — Nest',
}

function getTimePeriod(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'morning'
  if (h >= 12 && h < 17) return 'afternoon'
  if (h >= 17 && h < 22) return 'evening'
  return 'night'
}

export default async function NilaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('nila_onboarded, display_name, full_name, nila_default_mode, nila_language, nila_nudge_enabled, nila_nudge_time, plan')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.nila_onboarded) {
    redirect('/nila/onboarding')
  }

  const displayName = profile?.display_name ?? profile?.full_name?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'You'
  const initial = displayName[0]?.toUpperCase() ?? 'Y'

  // Resolve limit key and reset period from config
  const userPlan = (profile?.plan ?? 'free') as string
  const limitKey =
    userPlan === 'premium' ? 'nila.premium_message_limit'
    : userPlan === 'core'  ? 'nila.core_message_limit'
    :                        'nila.free_daily_message_limit'

  const timePeriod = getTimePeriod()
  const [greetingPool, messageLimitStr, maxTopics, resetPeriod, initialSession] = await Promise.all([
    getConfig(`nila.greeting_pool.${timePeriod}`, "Hey. I'm Nila. I'm here to listen — no rush, no judgment. What's on your mind?"),
    getConfig(limitKey, userPlan === 'free' ? '10' : '999'),
    getConfig('nila.max_topics_displayed', '3'),
    getConfig('nila.limit_reset_period', 'daily'),
    loadActiveNilaSession(),
  ])

  const messageLimit = parseInt(messageLimitStr, 10)
  const isUnlimited = messageLimit >= 999

  // Count messages sent in the current period (skip query for unlimited plans)
  let periodMessagesSent = 0
  if (!isUnlimited) {
    const periodStart = getPeriodStart(resetPeriod)
    const { count } = await supabase
      .from('nila_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('role', 'user')
      .gte('sent_at', periodStart.toISOString())
    periodMessagesSent = count ?? 0
  }

  // Pick a random greeting from the pipe-separated pool
  const greetings = greetingPool.split('|').map((s) => s.trim()).filter(Boolean)
  const greeting = greetings[Math.floor(Math.random() * greetings.length)] ?? greetings[0]

  return (
    <ChatShell
      userName={displayName}
      userEmail={user.email ?? ''}
      userInitial={initial}
      dailyMessagesSent={periodMessagesSent}
      messageLimit={isUnlimited ? 9999 : messageLimit}
      initialGreeting={greeting}
      maxTopics={parseInt(maxTopics, 10)}
      nilaDefaultMode={(profile?.nila_default_mode as 'normal' | 'rant' | 'figure_it_out') ?? 'normal'}
      nilaLanguage={profile?.nila_language ?? 'english'}
      nilaNudgeEnabled={profile?.nila_nudge_enabled ?? false}
      nilaNudgeTime={profile?.nila_nudge_time ?? 'evening'}
      initialSession={initialSession}
    />
  )
}
