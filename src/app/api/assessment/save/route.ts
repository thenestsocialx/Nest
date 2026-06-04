import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { AnswerRecord, ResultData, BranchId } from '@/lib/assessment/types'

interface SaveRequest {
  sessionId:  string
  answers:    AnswerRecord[]
  result:     ResultData
  branch:     BranchId | null
  crisisFlag: boolean
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHENTICATED', message: 'You must be signed in to save your results.' } },
      { status: 401 }
    )
  }

  let body: SaveRequest
  try {
    body = await request.json()
    if (!body.sessionId || !Array.isArray(body.answers) || !body.result) {
      return NextResponse.json(
        { error: { code: 'INVALID_PAYLOAD', message: 'Missing required fields.' } },
        { status: 400 }
      )
    }
  } catch {
    return NextResponse.json(
      { error: { code: 'INVALID_JSON', message: 'Request body is not valid JSON.' } },
      { status: 400 }
    )
  }

  const admin = createAdminClient()

  const { data, error } = await admin
    .from('assessment_responses')
    .insert({
      user_id:    user.id,
      session_id: body.sessionId,
      branch:     body.branch ?? null,
      crisis_flag: body.crisisFlag ?? false,
      answers:    body.answers,
      result:     body.result,
      created_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) {
    console.error('[assessment/save]', error.message)
    return NextResponse.json(
      { error: { code: 'SAVE_FAILED', message: error.message } },
      { status: 500 }
    )
  }

  return NextResponse.json({ id: data.id })
}
