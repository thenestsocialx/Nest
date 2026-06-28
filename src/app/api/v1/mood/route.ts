import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 })

  const body = await req.json() as { mood_index: number }
  const { mood_index } = body

  if (typeof mood_index !== 'number' || mood_index < 0 || mood_index > 4) {
    return new Response(JSON.stringify({ error: 'Invalid mood_index' }), { status: 400 })
  }

  const admin = createAdminClient()
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

  const { error } = await admin
    .from('mood_entries')
    .upsert(
      { user_id: user.id, mood_index, logged_date: today },
      { onConflict: 'user_id,logged_date' },
    )

  if (error) {
    console.error('[mood] upsert failed:', error)
    return new Response(JSON.stringify({ error: 'Save failed' }), { status: 500 })
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}
