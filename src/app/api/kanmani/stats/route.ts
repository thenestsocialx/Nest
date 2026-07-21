import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const revalidate = 0

export async function GET() {
  const admin = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (admin as any)
    .from('kanmani_stats')
    .select('total_raised_inr, sessions_funded')
    .maybeSingle()

  return NextResponse.json(
    data ?? { total_raised_inr: 0, sessions_funded: 0 },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
