import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'npm:web-push'

const SUPABASE_URL             = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const VAPID_PUBLIC_KEY         = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY        = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT            = Deno.env.get('VAPID_SUBJECT')!

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

const MORNING_POOL = [
  { title: 'Good morning', body: 'Take a moment before the day takes over. How are you feeling?' },
  { title: 'Hey, morning', body: "I'm here whenever you're ready. What's on your mind today?" },
  { title: 'Morning', body: 'No rush. Just checking in — how are you starting the day?' },
]

const EVENING_POOL = [
  { title: 'Hey, it\'s Nila', body: 'Long day? I\'m here. Come check in whenever you\'re ready.' },
  { title: 'Evening check-in', body: 'How are you carrying yourself tonight? I\'m listening.' },
  { title: 'Hey', body: 'What are you carrying this evening? No pressure — I\'m here.' },
]

Deno.serve(async (req) => {
  const url = new URL(req.url)
  let cohort = url.searchParams.get('cohort') as 'morning' | 'evening' | null

  if (!cohort) {
    // Derive from UTC time: 9am IST = 03:30 UTC, 8pm IST = 14:30 UTC
    const hour = new Date().getUTCHours()
    if (hour === 3) cohort = 'morning'
    else if (hour === 14) cohort = 'evening'
    else return new Response('No cohort active at this time', { status: 200 })
  }

  if (cohort !== 'morning' && cohort !== 'evening') {
    return new Response('Invalid cohort', { status: 400 })
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  const { data: users, error } = await admin
    .from('profiles')
    .select('id, nila_push_subscription')
    .eq('nila_nudge_enabled', true)
    .eq('nila_nudge_time', cohort)
    .not('nila_push_subscription', 'is', null)

  if (error) {
    console.error('[nila-push-nudge] DB error:', error)
    return new Response('DB error', { status: 500 })
  }

  const pool = cohort === 'morning' ? MORNING_POOL : EVENING_POOL
  let sent = 0

  await Promise.allSettled(
    (users ?? []).map(async (user, i) => {
      const pick = pool[i % pool.length]
      const message = { ...pick, url: '/nila' }
      try {
        await webpush.sendNotification(
          user.nila_push_subscription as webpush.PushSubscription,
          JSON.stringify(message),
        )
        sent++
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode
        // 404 / 410 = subscription expired or revoked — clear it
        if (status === 404 || status === 410) {
          await admin
            .from('profiles')
            .update({ nila_push_subscription: null })
            .eq('id', user.id)
        } else {
          console.error(`[nila-push-nudge] push failed for ${user.id}:`, err)
        }
      }
    }),
  )

  return new Response(
    JSON.stringify({ cohort, sent, total: users?.length ?? 0 }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
