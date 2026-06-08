'use server'

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getConfig } from '@/lib/nila-config'
import { redirect } from 'next/navigation'

export type NilaMode = 'normal' | 'rant' | 'figure_it_out'

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface RestoredMessage {
  id: string
  role: 'user' | 'nila'
  content: string
  sentAt: string
}

export interface RestoredConversation {
  id: string
  lastMode: NilaMode
  messages: RestoredMessage[]
}

function getTimeOfDay(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}

// ── Mode blocks ─────────────────────────────────────────────────────────────
// Appended below the base persona. CRISIS PROTOCOL stays in the base and is
// never conditional — it fires regardless of which mode is active.

const RANT_BLOCK = `CURRENT MODE: RANT
The user needs to vent. Your only job right now is to receive everything they're saying, stay completely on their side, and keep them talking.

RANT RULES:
- Short responses. Fragments are fine. Match their energy.
- Never give advice. Not even gently.
- Never reframe ("but maybe they...") — stay on the user's side.
- Never defend the other person or add perspective.
- React first — then ask one question to keep them going.
- Validate hard. "That's genuinely awful." "Yeah that's not okay." "wtf."
- Mirror their language, their intensity, their register.
- If they slow down, reflect back what they just said to keep the vent open.

WHAT YOU NEVER DO IN RANT MODE:
- Pivot to solutions, silver linings, or "have you tried..."
- Defend anyone they're venting about
- Ask them how they "really feel" or redirect toward growth
- Interrupt the vent with calm, measured wisdom`

const FIGUREOUT_BLOCK = `CURRENT MODE: FIGURE IT OUT
The user is stuck on something — a decision, a pattern, a situation they can't read clearly. Your job is to help them think. Not to solve for them — to help them see.

FIGURE IT OUT RULES:
- Move slowly. One question at a time. Let silence exist.
- Ask questions that go beneath the surface: "what's underneath that?" / "what are you most afraid of here?"
- Map the real situation before you offer any read.
- When you've heard enough, share one honest read of what you see. One. Not a list.
- Return the decision to them. Always. You map. They decide.
- Do not rush toward a resolution. The thinking IS the session.
- Sessions have three natural beats: surface the real thing → map it together → share your read + return it to them.

WHAT YOU NEVER DO IN FIGURE IT OUT MODE:
- Jump to advice before you've mapped the situation
- Give multiple options or a pros/cons list
- Make the decision sound obvious or simple
- Let the user off the hook with vague reflection — push gently for specificity`

function buildNilaSystemPrompt(mode: NilaMode, userEmail: string, timeOfDay: string, language = 'english'): string {
  // Figure It Out needs more context to work through a slowly-evolving situation.
  const contextWindow = mode === 'figure_it_out' ? 20 : 10

  const base = `You are Nila — an AI emotional companion on Nest, a platform that helps people going through loneliness, breakups, relationship issues, anxiety, stress, depression, and trust issues.

WHAT YOU ARE:
A warm, non-judgmental presence. Not a therapist, not a coach, not an advice machine. A companion who listens, reflects, and helps people feel less alone.

YOUR VOICE:
- Warm elder sibling — caring, direct, never preachy
- Speak in the user's language and emotional register
- Simple words, real sentences — no jargon, no clinical terms
- Short responses (2-4 sentences) unless the situation calls for more
- Never use bullet points or numbered lists
- Never start a response with "I" — vary your sentence starters
- Never say "I understand how you feel" or "That must be hard" as openers — show understanding through what you say, not by announcing it
- End with one question or a gentle reflection — never two questions at once

WHAT YOU DO:
- Listen first, reflect what you hear before anything else
- Validate before you perspective-give (which should be rare)
- Ask one curious question that opens the conversation deeper
- Notice what isn't being said as much as what is
- Gently notice patterns over time if the user mentions them
- Point toward human support (Allies, crisis lines) when needed — not as a dismissal, as care

WHAT YOU NEVER DO:
- Diagnose, prescribe, or give medical advice
- Tell someone what they should feel or do
- Rush toward solutions or silver linings
- Encourage the user to rely on you instead of people in their life
- Minimize what someone is going through
- Give generic positive affirmations ("You're so strong!", "This too shall pass")

SCOPE — topics you are equipped to hold:
  loneliness, feeling misunderstood, heartbreak, relationship breakdown, family pressure,
  communication struggles, anxiety, worry, burnout, work stress, identity, self-worth,
  grief, trust issues, detachment, depression, feeling numb, social anxiety,
  struggling to open up, feeling stuck, life transitions

SCOPE — topics outside your lane (redirect gently):
  - Medical symptoms, medication: "That's worth talking to a doctor about — is there something underneath that's weighing on you?"
  - Legal advice: redirect warmly
  - Financial advice: redirect warmly
  - Requests for specific diagnoses: "I'm not able to diagnose, but I can sit with you in whatever you're experiencing — what does it feel like from the inside?"

CRISIS PROTOCOL — if user mentions suicide, self-harm, or being in danger:
  Respond with warmth, not alarm. Say:
  "What you're carrying sounds really heavy — and I don't want you to hold it alone right now. There are people trained for exactly this moment who want to help. iCall is available Mon–Sat 8am–10pm at 9152 987 821, and Vandrevala Foundation is available 24/7 at 1860 2662 345. Would you be open to reaching out to them?"
  Do not continue the conversation as if this wasn't said. Stay present.

CONVERSATION MEMORY:
  You receive the last ${contextWindow} messages as context. Reference earlier parts of the conversation naturally when relevant — "You mentioned earlier that..." This creates continuity and makes the user feel heard.

Current user: ${userEmail}
Time of day: ${timeOfDay}
${language !== 'english' ? `Language preference: Respond in ${language}. Mirror the language the user writes in — if they switch to English mid-conversation, follow them.` : ''}`

  if (mode === 'rant') return base + '\n\n' + RANT_BLOCK
  if (mode === 'figure_it_out') return base + '\n\n' + FIGUREOUT_BLOCK
  return base
}

// ── Opening line pools ───────────────────────────────────────────────────────
// Selected at random on mode switch. Hard-coded rather than model-generated so
// the gear-shift is instant and predictable — the mode-injected system prompt
// handles all subsequent tone from the first real exchange onward.

const RANT_OPENINGS = [
  "okay. rant mode. dump everything.",
  "solu da. what's pissing you off today.",
  "go. I'm here.",
]

const FIGUREOUT_OPENINGS = [
  "okay. bring the thing.",
  "okay. now let's actually look at it properly.",
  "alright. what are we untangling.",
]

const NORMAL_OPENINGS = [
  "okay. we're back.",
  "sure. take it wherever you need.",
  "back to just listening.",
]

// ── Server actions ───────────────────────────────────────────────────────────

export async function markNilaOnboarded(): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Use admin client so upsert works even if the profile row doesn't exist yet
  // (RLS has no INSERT policy for regular users, but the row must exist after this)
  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .upsert({ id: user.id, nila_onboarded: true }, { onConflict: 'id' })

  if (error) console.error('[markNilaOnboarded] upsert failed:', error)

  redirect('/nila')
}

export async function sendNilaMessage(
  message: string,
  history: ConversationMessage[],
  mode: NilaMode,
  conversationId: string | null,
  language = 'english',
): Promise<{ reply: string; conversationId: string | null; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { reply: '', conversationId: null, error: 'Not authenticated' }

  if (!message?.trim()) return { reply: '', conversationId: null, error: 'Empty message' }

  const admin = createAdminClient()
  let activeConversationId = conversationId

  // Create a new conversation row on the first message of a session
  if (!activeConversationId) {
    const { data: convo, error: convoError } = await admin
      .from('nila_conversations')
      .insert({ user_id: user.id, last_mode: mode })
      .select('id')
      .single()

    if (convoError) {
      console.error('[sendNilaMessage] conversation create failed:', convoError)
    } else {
      activeConversationId = (convo as { id: string }).id
    }
  }

  // Server-side daily limit check — spans all sessions, guards against UI bypass
  const dailyLimit = parseInt(await getConfig('nila.free_daily_message_limit', '10'), 10)
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { count: todayCount } = await admin
    .from('nila_messages')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('role', 'user')
    .gte('sent_at', todayStart.toISOString())

  if ((todayCount ?? 0) >= dailyLimit) {
    return { reply: '', conversationId: activeConversationId, error: 'daily_limit_reached' }
  }

  // Persist the user's message
  if (activeConversationId) {
    const { error: msgError } = await admin.from('nila_messages').insert({
      conversation_id: activeConversationId,
      user_id: user.id,
      role: 'user',
      content: message,
      mode,
    })
    if (msgError) console.error('[sendNilaMessage] user message insert failed:', msgError)

    // Update conversation message_count using the actual DB count (authoritative source)
    const { count: userMsgCount } = await admin
      .from('nila_messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', activeConversationId)
      .eq('role', 'user')

    await admin
      .from('nila_conversations')
      .update({
        message_count: userMsgCount ?? 0,
        last_mode: mode,
        updated_at: new Date().toISOString(),
      })
      .eq('id', activeConversationId)

    // Increment lifetime nila_message_count on the user's profile
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

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

    const contextLimit = mode === 'figure_it_out' ? 20 : 10
    const contextMessages = history.slice(-contextLimit).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))
    contextMessages.push({ role: 'user', content: message })

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: buildNilaSystemPrompt(mode, user.email ?? '', getTimeOfDay(), language),
      messages: contextMessages,
    })

    const reply = response.content[0].type === 'text' ? response.content[0].text : ''

    if (activeConversationId) {
      await admin.from('nila_messages').insert({
        conversation_id: activeConversationId,
        user_id: user.id,
        role: 'assistant',
        content: reply,
        mode,
      })

      await admin
        .from('nila_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', activeConversationId)
    }

    return { reply, conversationId: activeConversationId }
  } catch (error) {
    console.error('[sendNilaMessage] error:', error)
    return { reply: '', conversationId: activeConversationId, error: 'Something went wrong. Please try again.' }
  }
}

export async function switchNilaMode(
  conversationId: string,
  newMode: NilaMode,
): Promise<{ openingLine: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { openingLine: '', error: 'Not authenticated' }

  const pool =
    newMode === 'rant' ? RANT_OPENINGS :
    newMode === 'figure_it_out' ? FIGUREOUT_OPENINGS :
    NORMAL_OPENINGS

  const openingLine = pool[Math.floor(Math.random() * pool.length)]

  const admin = createAdminClient()

  // Persist the opening line — non-fatal if this fails, UI still shows it
  const { error: msgError } = await admin.from('nila_messages').insert({
    conversation_id: conversationId,
    user_id: user.id,
    role: 'assistant',
    content: openingLine,
    mode: newMode,
    is_mode_opening: true,
  })
  if (msgError) console.error('[switchNilaMode] opening line insert failed:', msgError)

  const { error: convError } = await admin
    .from('nila_conversations')
    .update({ last_mode: newMode, updated_at: new Date().toISOString() })
    .eq('id', conversationId)
  if (convError) console.error('[switchNilaMode] conversation update failed:', convError)

  return { openingLine }
}

export async function endNilaSession(conversationId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const admin = createAdminClient()
  const { error } = await admin
    .from('nila_conversations')
    .update({ ended_at: new Date().toISOString() })
    .eq('id', conversationId)
    .eq('user_id', user.id)

  if (error) console.error('[endNilaSession] failed:', error)
}

export async function loadActiveNilaSession(): Promise<RestoredConversation | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const restoreWindowHours = parseInt(
    await getConfig('nila.session_restore_window_hours', '24'),
    10,
  )
  const cutoff = new Date(Date.now() - restoreWindowHours * 60 * 60 * 1000).toISOString()

  const admin = createAdminClient()

  // Find the most recent open conversation within the restore window
  const { data: convo, error: convoError } = await admin
    .from('nila_conversations')
    .select('id, last_mode')
    .eq('user_id', user.id)
    .is('ended_at', null)
    .is('deleted_at', null)
    .gte('created_at', cutoff)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (convoError || !convo) return null

  const { data: msgs, error: msgsError } = await admin
    .from('nila_messages')
    .select('id, role, content, sent_at')
    .eq('conversation_id', convo.id)
    .is('deleted_at', null)
    .order('sent_at', { ascending: true })

  if (msgsError) return null

  return {
    id: (convo as { id: string; last_mode: string }).id,
    lastMode: (convo as { id: string; last_mode: string }).last_mode as NilaMode,
    messages: (msgs ?? []).map((m) => ({
      id: (m as { id: string; role: string; content: string; sent_at: string }).id,
      role: (m as { id: string; role: string; content: string; sent_at: string }).role === 'user' ? 'user' : 'nila',
      content: (m as { id: string; role: string; content: string; sent_at: string }).content,
      sentAt: (m as { id: string; role: string; content: string; sent_at: string }).sent_at,
    })),
  }
}

export interface NilaSettings {
  nila_default_mode: string
  nila_language: string
  nila_nudge_enabled: boolean
  nila_nudge_time: string
}

export async function updateNilaSettings(settings: NilaSettings): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({
      nila_default_mode: settings.nila_default_mode,
      nila_language: settings.nila_language,
      nila_nudge_enabled: settings.nila_nudge_enabled,
      nila_nudge_time: settings.nila_nudge_time,
    })
    .eq('id', user.id)

  if (error) {
    console.error('[updateNilaSettings] failed:', error)
    return { error: 'Failed to save settings' }
  }
  return {}
}

export async function clearNilaHistory(): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const now = new Date().toISOString()
  const admin = createAdminClient()

  // Soft-delete all conversations — cascades via FK reference at query level
  const { data: convos } = await admin
    .from('nila_conversations')
    .select('id')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  if (!convos?.length) return {}

  const ids = (convos as { id: string }[]).map((c) => c.id)

  await admin
    .from('nila_messages')
    .update({ deleted_at: now })
    .in('conversation_id', ids)

  const { error } = await admin
    .from('nila_conversations')
    .update({ deleted_at: now })
    .eq('user_id', user.id)
    .is('deleted_at', null)

  if (error) {
    console.error('[clearNilaHistory] failed:', error)
    return { error: 'Failed to clear history' }
  }
  return {}
}

export interface HistoryItem {
  id: string
  startedAt: string
  endedAt: string | null
  lastMode: NilaMode
  messageCount: number
  firstUserMessage: string | null
}

export async function loadNilaHistory(): Promise<HistoryItem[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const admin = createAdminClient()

  const { data: convos, error } = await admin
    .from('nila_conversations')
    .select('id, started_at, ended_at, last_mode, message_count')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('started_at', { ascending: false })
    .limit(50)

  if (error || !convos?.length) return []

  const items: HistoryItem[] = await Promise.all(
    (convos as { id: string; started_at: string; ended_at: string | null; last_mode: string; message_count: number }[]).map(async (c) => {
      const { data: firstMsg } = await admin
        .from('nila_messages')
        .select('content')
        .eq('conversation_id', c.id)
        .eq('role', 'user')
        .is('deleted_at', null)
        .order('sent_at', { ascending: true })
        .limit(1)
        .maybeSingle()

      return {
        id: c.id,
        startedAt: c.started_at,
        endedAt: c.ended_at,
        lastMode: c.last_mode as NilaMode,
        messageCount: c.message_count,
        firstUserMessage: firstMsg ? (firstMsg as { content: string }).content.slice(0, 60) : null,
      }
    }),
  )

  return items
}

export async function loadNilaSessionMessages(conversationId: string): Promise<RestoredMessage[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const admin = createAdminClient()

  const { data: msgs, error } = await admin
    .from('nila_messages')
    .select('id, role, content, sent_at')
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('sent_at', { ascending: true })

  if (error) return []

  return (msgs ?? []).map((m) => ({
    id: (m as { id: string; role: string; content: string; sent_at: string }).id,
    role: (m as { id: string; role: string; content: string; sent_at: string }).role === 'user' ? 'user' : 'nila',
    content: (m as { id: string; role: string; content: string; sent_at: string }).content,
    sentAt: (m as { id: string; role: string; content: string; sent_at: string }).sent_at,
  }))
}

export async function softDeleteNilaConversation(conversationId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const now = new Date().toISOString()
  const admin = createAdminClient()

  await admin
    .from('nila_messages')
    .update({ deleted_at: now })
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)

  const { error } = await admin
    .from('nila_conversations')
    .update({ deleted_at: now })
    .eq('id', conversationId)
    .eq('user_id', user.id)

  if (error) return { error: 'Failed to delete' }
  return {}
}
