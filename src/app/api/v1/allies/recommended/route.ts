// GET /api/v1/allies/recommended?branch=anxiety&limit=3
// Returns allies matched by assessment branch. No auth required.
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Maps assessment branch IDs to ally specialty values
const BRANCH_SPECIALTY: Record<string, string> = {
  anxiety:      'anxiety',
  loneliness:   'loneliness',
  'low-mood':   'depression',
  relationship: 'relationships',
  burnout:      'burnout',
  grief:        'grief',
}

const ALLY_SELECT = `
  id,
  display_name,
  primary_role,
  years_experience,
  tagline,
  quote,
  pronouns,
  specialties,
  user_vibes,
  modalities,
  approach_style,
  photo_url,
  session_price,
  intro_price,
  session_durations,
  session_formats,
  languages_spoken,
  location,
  manual_priority_score,
  zoho_embed_url
`.trim()

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const branch = searchParams.get('branch') ?? ''
  const limit  = Math.min(parseInt(searchParams.get('limit') ?? '3', 10), 6)

  const admin = createAdminClient()
  const specialty = BRANCH_SPECIALTY[branch]

  let matched: unknown[] = []

  if (specialty) {
    const { data } = await admin
      .from('allies')
      .select(ALLY_SELECT)
      .eq('is_active', true)
      .eq('onboarding_status', 'active')
      .eq('visibility_search', true)
      .is('deleted_at', null)
      .contains('specialties', [specialty])
      .order('manual_priority_score', { ascending: false })
      .limit(limit)

    matched = data ?? []
  }

  // Backfill with other active allies if branch returned fewer than 2
  if (matched.length < 2) {
    const existingIds = (matched as { id: string }[]).map(a => a.id)
    const needed = limit - matched.length

    let query = admin
      .from('allies')
      .select(ALLY_SELECT)
      .eq('is_active', true)
      .eq('onboarding_status', 'active')
      .eq('visibility_search', true)
      .is('deleted_at', null)
      .order('manual_priority_score', { ascending: false })
      .limit(needed)

    if (existingIds.length > 0) {
      query = query.not('id', 'in', `(${existingIds.join(',')})`)
    }

    const { data: backfill } = await query
    matched = [...matched, ...(backfill ?? [])]
  }

  return NextResponse.json({ allies: matched })
}
