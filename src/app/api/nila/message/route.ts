import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getConfig, getPeriodStart, getEnabledModesForPlan } from '@/lib/nila-config'
import type { NilaMode, ConversationMessage } from '@/actions/nila'

// Re-export the system prompt builder logic inline so the route handler is
// self-contained and doesn't import server-action internals.

function getTimeOfDay(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}

const RANT_BLOCK = `CURRENT MODE: RANT
Job: listen, react, take their side. Never fix, analyze, or advise. The user chose this mode — they know what they're getting.

VOICE:
- 1–3 short lines per reply. Lowercase. No em-dashes, no semicolons, no lists, no paragraphs.
- One question max — only if genuinely curious. Not a check-in question.
- Match emotional temperature, not literal intensity (they cap → you don't cap back).
- Swearing: damn / shit / hell fine. No fuck, no Tamil swears.
- Mirror the user's English/Thanglish mix — floor of plain-English readability.

ENERGY MATCHING:
- Flat, low → "mm." / "damn da." / "still here."
- Frustrated → "yeah that's annoying." / "i'd be done too."
- Angry → "okay that's insane." / "damn, the audacity."
- Wrecked → "haiyo." / "okay. i'm here." / "take your time."

NEVER:
- Generic validation ("that sounds hard") or hedge-empathy ("it's valid to feel...")
- Recap-back ("sounds like you're feeling X because Y")
- "I hear you" · advice · "have you considered" · silver linings · reframes
- Unsolicited therapy suggestions · summarizing their message · "take a deep breath"
- Affirmation-bombing · stacked questions · "would you like to talk more?"
- Test before sending: could this exact line be ChatGPT? If yes, rewrite.

EXCEPTION — self-cruelty:
User turns cruel on themselves → one-line pushback, then hand the floor straight back.
Example: "i'm such an idiot for this" → "no. don't. you're not stupid, the situation is shit. keep going."

IF THEY ASK FOR ADVICE:
One-line redirect, back to listening — no lecture:
"lol rant mode doesn't fix things. flip the toggle and i'll actually get into it. what else is bugging you"

WRAP-UP — energy drops or they say "i'm done":
Close gently, no recap, no homework:
"glad you got it out. i'm here whenever it happens again lol"

CRISIS OVERRIDE — stay in rant-mode voice, no announcement:
1. Gentle check: "everything to stop" — i want to be careful with that. the this-week-needs-to-end tired, or the heavier kind?
2. If heavier confirmed — bridge to a real person, warm not clinical:
"okay. i don't want you sitting with that alone tonight. is there someone you can call right now? i can also point you to someone at Nest to actually talk this through."
(Standard crisis lines still apply — see CRISIS PROTOCOL above.)`

const FIGUREOUT_BLOCK = `CURRENT MODE: FIGURE IT OUT
The user is stuck on something — a decision, a pattern, a situation they can't read clearly. Your job is to help them think.

FIGURE IT OUT RULES:
- Move slowly. One question at a time.
- Ask questions that go beneath the surface.
- Map the real situation before you offer any read.
- When you've heard enough, share one honest read. One.
- Return the decision to them. Always.`

interface AssessmentContext {
  branch: string
  summary: string | null
  assessedAt: string
}

function buildSystemPrompt(
  mode: NilaMode,
  userEmail: string,
  language = 'english',
  assessmentContext?: AssessmentContext,
  hasUnacknowledgedSession?: boolean,
): string {
  const contextWindow = mode === 'figure_it_out' ? 20 : 10
  const timeOfDay = getTimeOfDay()

  const assessmentBlock = assessmentContext
    ? `\nUser context: When they came to Nest, they were working through ${assessmentContext.branch}.${assessmentContext.summary ? ` Their snapshot: "${assessmentContext.summary}"` : ''}
Keep this in the background — don't reference it directly unless the user brings it up.`
    : ''

  const followUpBlock = hasUnacknowledgedSession
    ? `\nSession follow-up: The user recently completed a session with one of their allies. Open gently with a check-in like "How did your session go?" — but only if they haven't brought it up already. Don't force it if they arrive with something urgent.`
    : ''

  const base = `You are Nila — an AI emotional companion on Nest, a platform that helps people going through loneliness, breakups, relationship issues, anxiety, stress, depression, and trust issues.

YOUR VOICE:
- Warm elder sibling — caring, direct, never preachy
- Simple words, real sentences — no jargon
- Short responses (2-4 sentences) unless the situation calls for more
- Never use bullet points or numbered lists
- Never start a response with "I"
- End with one question or a gentle reflection

CRISIS PROTOCOL — if user mentions suicide, self-harm, or being in danger:
  Say: "What you're carrying sounds really heavy — and I don't want you to hold it alone right now. iCall is available Mon–Sat 8am–10pm at 9152 987 821, and Vandrevala Foundation is available 24/7 at 1860 2662 345."
  Do not continue as if this wasn't said.

CONVERSATION MEMORY: You receive the last ${contextWindow} messages as context.

Current user: ${userEmail}
Time of day: ${timeOfDay}
${language !== 'english' ? `Language preference: Respond in ${language}. Mirror the language the user writes in.` : ''}${assessmentBlock}${followUpBlock}`

  if (mode === 'rant') return base + '\n\n' + RANT_BLOCK
  if (mode === 'figure_it_out') return base + '\n\n' + FIGUREOUT_BLOCK
  return base
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 })
  }

  const body = await req.json() as {
    message: string
    history: ConversationMessage[]
    mode: NilaMode
    conversationId: string | null
    language?: string
  }

  const { message, history, mode, conversationId, language = 'english' } = body

  if (!message?.trim()) {
    return new Response(JSON.stringify({ error: 'Empty message' }), { status: 400 })
  }

  const admin = createAdminClient()
  let activeConversationId = conversationId

  // Create conversation row on first message
  if (!activeConversationId) {
    const { data: convo, error: convoError } = await admin
      .from('nila_conversations')
      .insert({ user_id: user.id, last_mode: mode })
      .select('id')
      .single()

    if (convoError) {
      console.error('[nila/message] conversation create failed:', convoError)
    } else {
      activeConversationId = (convo as { id: string }).id
    }
  }

  // Plan-aware, period-aware limit check + assessment context + session follow-up
  const [profileResult, completedSessionResult] = await Promise.all([
    admin
      .from('profiles')
      .select('plan, last_assessment_branch, last_assessment_at, last_assessment_summary')
      .eq('id', user.id)
      .maybeSingle(),
    admin
      .from('sessions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .eq('nila_followup_sent', false)
      .limit(1),
  ])

  const profileData = profileResult.data
  const userPlan = (profileData?.plan ?? 'free') as string

  // Mode access guard — prevents using a mode not enabled for this plan
  const enabledModes = await getEnabledModesForPlan(userPlan)
  if (!enabledModes.includes(mode)) {
    return new Response(
      JSON.stringify({ error: 'mode_not_available', conversationId: activeConversationId }),
      { status: 403, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const unacknowledgedSessions = completedSessionResult.data ?? []
  const hasUnacknowledgedSession = unacknowledgedSessions.length > 0

  // Only use assessment context if taken within the last 90 days
  const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000
  const assessedAt = profileData?.last_assessment_at
  const assessmentContext: AssessmentContext | undefined =
    profileData?.last_assessment_branch && assessedAt && (Date.now() - new Date(assessedAt).getTime()) < NINETY_DAYS_MS
      ? {
          branch:     profileData.last_assessment_branch,
          summary:    profileData.last_assessment_summary ?? null,
          assessedAt,
        }
      : undefined
  const limitKey =
    userPlan === 'premium' ? 'nila.premium_message_limit'
    : userPlan === 'core'  ? 'nila.core_message_limit'
    :                        'nila.free_daily_message_limit'

  const [limitStr, resetPeriod] = await Promise.all([
    getConfig(limitKey, userPlan === 'free' ? '20' : '999'),
    getConfig('nila.limit_reset_period', 'daily'),
  ])

  const limit = parseInt(limitStr, 10)

  if (limit < 999) {
    const periodStart = getPeriodStart(resetPeriod)
    const { count: periodCount } = await admin
      .from('nila_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('role', 'user')
      .gte('sent_at', periodStart.toISOString())

    if ((periodCount ?? 0) >= limit) {
      return new Response(
        JSON.stringify({ error: 'daily_limit_reached', conversationId: activeConversationId }),
        { status: 429, headers: { 'Content-Type': 'application/json' } },
      )
    }
  }

  // Persist user message
  if (activeConversationId) {
    await admin.from('nila_messages').insert({
      conversation_id: activeConversationId,
      user_id: user.id,
      role: 'user',
      content: message,
      mode,
    })

    // Mark any completed sessions as follow-up acknowledged
    if (hasUnacknowledgedSession) {
      const sessionIds = unacknowledgedSessions.map((s: { id: string }) => s.id)
      await admin
        .from('sessions')
        .update({ nila_followup_sent: true })
        .in('id', sessionIds)
    }

    const { count: userMsgCount } = await admin
      .from('nila_messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', activeConversationId)
      .eq('role', 'user')

    await admin
      .from('nila_conversations')
      .update({ message_count: userMsgCount ?? 0, last_mode: mode, updated_at: new Date().toISOString() })
      .eq('id', activeConversationId)

    const { data: prof } = await admin
      .from('profiles')
      .select('nila_message_count')
      .eq('id', user.id)
      .maybeSingle()

    if (prof !== null) {
      await admin
        .from('profiles')
        .update({ nila_message_count: ((prof as { nila_message_count: number | null }).nila_message_count ?? 0) + 1 })
        .eq('id', user.id)
    }
  }

  // Build context messages
  const contextLimit = mode === 'figure_it_out' ? 20 : 10
  const contextMessages = history.slice(-contextLimit).map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))
  contextMessages.push({ role: 'user', content: message })

  // Stream from Claude
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const stream = new ReadableStream({
    async start(controller) {
      let fullReply = ''

      try {
        const claudeStream = await client.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 512,
          system: buildSystemPrompt(mode, user.email ?? '', language, assessmentContext, hasUnacknowledgedSession),
          messages: contextMessages,
        })

        for await (const chunk of claudeStream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            const token = chunk.delta.text
            fullReply += token
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ token })}\n\n`))
          }
        }

        // Persist Nila's reply
        if (activeConversationId && fullReply) {
          await admin.from('nila_messages').insert({
            conversation_id: activeConversationId,
            user_id: user.id,
            role: 'assistant',
            content: fullReply,
            mode,
          })
          await admin
            .from('nila_conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', activeConversationId)
        }

        controller.enqueue(
          new TextEncoder().encode(
            `data: ${JSON.stringify({ done: true, conversationId: activeConversationId })}\n\n`,
          ),
        )
      } catch (err) {
        console.error('[nila/message] stream error:', err)
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
