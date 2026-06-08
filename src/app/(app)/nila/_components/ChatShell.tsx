'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import { switchNilaMode, endNilaSession } from '@/actions/nila'
import type { NilaMode, RestoredConversation } from '@/actions/nila'
import ModeSwitcher from './ModeSwitcher'
import NilaSettingsPanel from './NilaSettingsPanel'

// ── Mood inference ───────────────────────────────────────────────────────────

const MOOD_MAP: { emoji: string; label: string; keywords: string[] }[] = [
  { emoji: '😰', label: 'Anxious',    keywords: ['anxious', 'panic', 'scared', 'nervous', 'worried', 'anxiety'] },
  { emoji: '😔', label: 'Low',        keywords: ['sad', 'crying', 'hopeless', 'numb', 'empty', 'depressed', 'cry'] },
  { emoji: '😤', label: 'Frustrated', keywords: ['angry', 'pissed', 'furious', 'hate', 'unfair', 'frustrated', 'anger'] },
  { emoji: '😮‍💨', label: 'Relieved',   keywords: ['better', 'lighter', 'thanks', 'helped', 'relieved', 'calmer', 'thank'] },
]

function inferMood(msgs: string[]): { emoji: string; label: string } {
  const text = msgs.join(' ').toLowerCase()
  let best = { emoji: '😶', label: 'Neutral', count: 0 }
  for (const m of MOOD_MAP) {
    const count = m.keywords.filter((k) => text.includes(k)).length
    if (count > best.count) best = { ...m, count }
  }
  return { emoji: best.emoji, label: best.label }
}

// ── Topic extraction ─────────────────────────────────────────────────────────

const TOPIC_MAP: { label: string; keywords: string[] }[] = [
  { label: 'Loneliness',  keywords: ['lonely', 'alone', 'isolated', 'no one'] },
  { label: 'Heartbreak',  keywords: ['breakup', 'break up', 'ex', 'heartbreak', 'relationship ended'] },
  { label: 'Anxiety',     keywords: ['anxious', 'anxiety', 'nervous', 'panic', 'worried'] },
  { label: 'Burnout',     keywords: ['burned out', 'exhausted', 'no energy', 'drained', 'overworked'] },
  { label: 'Family',      keywords: ['family', 'parents', 'mom', 'dad', 'siblings', 'mother', 'father'] },
  { label: 'Self-worth',  keywords: ['not good enough', 'worthless', 'hate myself', 'failure', 'useless'] },
  { label: 'Grief',       keywords: ['lost', 'grief', 'died', 'miss them', 'gone', 'passed away'] },
  { label: 'Stress',      keywords: ['stress', 'stressed', 'overwhelmed', 'pressure', 'too much'] },
  { label: 'Trust',       keywords: ['trust', 'betrayed', 'lied', 'cheated', 'backstabbed'] },
]

function extractTopics(msgs: string[], maxTopics: number): string[] {
  const text = msgs.join(' ').toLowerCase()
  const matched: string[] = []
  for (const t of TOPIC_MAP) {
    if (matched.length >= maxTopics) break
    if (t.keywords.some((k) => text.includes(k))) matched.push(t.label)
  }
  return matched
}

// ── Session restore signal detection ────────────────────────────────────────

const FRESH_START_SIGNALS = ['new', 'fresh', 'start over', 'something else', 'different', 'no']

function wantsFreshStart(text: string): boolean {
  const lower = text.toLowerCase().trim()
  return FRESH_START_SIGNALS.some((s) => lower.includes(s))
}

// ── Helpers ──────────────────────────────────────────────────────────────────

interface Message {
  id: string
  role: 'user' | 'nila'
  content: string
  timestamp: Date
  isRetryable?: boolean
}

interface ChatShellProps {
  userName: string
  userEmail: string
  userInitial: string
  dailyMessagesSent: number
  messageLimit: number
  initialGreeting: string
  maxTopics: number
  nilaDefaultMode: NilaMode
  nilaLanguage: string
  nilaNudgeEnabled: boolean
  nilaNudgeTime: string
  initialSession: RestoredConversation | null
}

function formatTime(date: Date): string {
  const h = date.getHours()
  const m = date.getMinutes()
  const ampm = h >= 12 ? 'pm' : 'am'
  const hour = h % 12 || 12
  const min = m.toString().padStart(2, '0')
  return `${hour}:${min} ${ampm}`
}

function getSessionPeriod(): string {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'This morning'
  if (h >= 12 && h < 17) return 'This afternoon'
  if (h >= 17 && h < 21) return 'Tonight'
  return 'Late night'
}

function makeInitialMessage(greeting: string): Message {
  return {
    id: 'init',
    role: 'nila',
    content: greeting,
    timestamp: new Date(),
  }
}

const RESTORE_PROMPT = "Hey, you're back. We left off on something — want to pick up where we were, or start somewhere new?"

function NilaBubbleAvatar() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="12.5" fill="#F8F0E5" stroke="#E0D5C5" strokeWidth="0.8" />
      <circle cx="14" cy="14" r="9" fill="none" stroke="#E8C8A0" strokeWidth="0.6" opacity="0.7" />
      <path
        d="M14 10 Q17 11.5 16.5 14.5 Q15.5 17 13 17 Q11 16 12 14"
        stroke="#2F4C3A"
        strokeWidth="0.9"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="14" cy="14" r="1" fill="#2F4C3A" />
    </svg>
  )
}

function TypingIndicator() {
  return (
    <div className="ns-bubble ns-bubble--nila">
      <div className="ns-bubble__avatar">
        <NilaBubbleAvatar />
      </div>
      <div className="ns-bubble__col">
        <div className="ns-bubble__body">
          <div className="ns-typing">
            <div className="ns-typing__dot" />
            <div className="ns-typing__dot" />
            <div className="ns-typing__dot" />
          </div>
        </div>
      </div>
    </div>
  )
}

function RefreshIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M2.5 7 Q 2.5 3 7 3 Q 10 3 11 5.5 M11 3 V 5.5 H 8.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M11.5 7 Q 11.5 11 7 11 Q 4 11 3 8.5 M3 11 V 8.5 H 5.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M3 7 H 11 M8 4 L 11 7 L 8 10"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ChatShell({
  userName,
  userEmail,
  userInitial,
  dailyMessagesSent,
  messageLimit,
  initialGreeting,
  maxTopics,
  nilaDefaultMode,
  nilaLanguage,
  nilaNudgeEnabled,
  nilaNudgeTime,
  initialSession,
}: ChatShellProps) {
  const router = useRouter()

  // Session restore state
  const isRestoring = initialSession !== null
  const restoredMessages: Message[] = isRestoring
    ? [
        ...initialSession!.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.sentAt),
        })),
        {
          id: 'restore-prompt',
          role: 'nila' as const,
          content: RESTORE_PROMPT,
          timestamp: new Date(),
        },
      ]
    : [makeInitialMessage(initialGreeting)]

  const [messages, setMessages] = useState<Message[]>(restoredMessages)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showBanner, setShowBanner] = useState(true)
  const [showCrisisPanel, setShowCrisisPanel] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState(() => new Date())
  const [currentTime, setCurrentTime] = useState(() => formatTime(new Date()))
  const [sessionDuration, setSessionDuration] = useState(0)
  const [sessionPeriod] = useState(() => getSessionPeriod())
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [mode, setMode] = useState<NilaMode>(
    isRestoring ? initialSession!.lastMode : nilaDefaultMode,
  )
  const [conversationId, setConversationId] = useState<string | null>(
    isRestoring ? initialSession!.id : null,
  )
  const [messageCount, setMessageCount] = useState(dailyMessagesSent)
  const limitReached = messageCount >= messageLimit

  const [mood, setMood] = useState<{ emoji: string; label: string }>({ emoji: '😶', label: 'Neutral' })
  const [topics, setTopics] = useState<string[]>([])

  // Pending retry
  const [failedMessage, setFailedMessage] = useState<string | null>(null)

  // Whether the first user message in a restored session might want fresh start
  const [awaitingRestoreDecision, setAwaitingRestoreDecision] = useState(isRestoring)

  // Mutable settings (updated by NilaSettingsPanel without page reload)
  const [currentLanguage, setCurrentLanguage]       = useState(nilaLanguage)
  const [currentDefaultMode, setCurrentDefaultMode] = useState(nilaDefaultMode)
  const [currentNudgeEnabled, setCurrentNudgeEnabled] = useState(nilaNudgeEnabled)
  const [currentNudgeTime, setCurrentNudgeTime]     = useState(nilaNudgeTime)

  const nilaLanguageRef = useRef(currentLanguage)
  nilaLanguageRef.current = currentLanguage

  function handleSettingChange(field: string, value: string | boolean) {
    if (field === 'nila_language')      setCurrentLanguage(value as string)
    if (field === 'nila_default_mode')  setCurrentDefaultMode(value as NilaMode)
    if (field === 'nila_nudge_enabled') setCurrentNudgeEnabled(value as boolean)
    if (field === 'nila_nudge_time')    setCurrentNudgeTime(value as string)
  }

  useEffect(() => {
    const tick = () => {
      setCurrentTime(formatTime(new Date()))
      setSessionDuration((prev) => {
        const mins = Math.floor((Date.now() - sessionStartTime.getTime()) / 60000)
        return mins !== prev ? mins : prev
      })
    }
    const id = setInterval(tick, 60000)
    return () => clearInterval(id)
  }, [sessionStartTime])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSending])

  function updateSidebarAfterReply(userMsgs: string[]) {
    setMood(inferMood(userMsgs))
    const extracted = extractTopics(userMsgs, maxTopics)
    if (extracted.length > 0) setTopics(extracted)
  }

  async function handleNewSession() {
    if (conversationId) void endNilaSession(conversationId)
    const now = new Date()
    setMessages([makeInitialMessage(initialGreeting)])
    setMode(currentDefaultMode)
    setConversationId(null)
    setSessionStartTime(now)
    setSessionDuration(0)
    setCurrentTime(formatTime(now))
    setTopics([])
    setMood({ emoji: '😶', label: 'Neutral' })
    setFailedMessage(null)
    setAwaitingRestoreDecision(false)
  }

  async function handleModeSwitch(newMode: NilaMode) {
    if (newMode === mode || isSending) return
    if (conversationId === null) {
      setMode(newMode)
      return
    }
    setIsSending(true)
    try {
      const { openingLine, error } = await switchNilaMode(conversationId, newMode)
      if (!error && openingLine) {
        setMode(newMode)
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), role: 'nila', content: openingLine, timestamp: new Date() },
        ])
      }
    } finally {
      setIsSending(false)
    }
  }

  const doSend = useCallback(async (text: string) => {
    if (!text || isSending || limitReached) return

    // Restore-decision handling: if user wants to start fresh, reset
    if (awaitingRestoreDecision) {
      setAwaitingRestoreDecision(false)
      if (wantsFreshStart(text)) {
        if (conversationId) void endNilaSession(conversationId)
        const now = new Date()
        setMessages([makeInitialMessage(initialGreeting)])
        setMode(currentDefaultMode)
        setConversationId(null)
        setSessionStartTime(now)
        setSessionDuration(0)
        setCurrentTime(formatTime(now))
        return
      }
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setMessageCount((prev) => prev + 1)
    setFailedMessage(null)
    setIsSending(true)

    const streamingId = (Date.now() + 1).toString()
    let bubbleAdded = false
    let accumulatedContent = ''

    try {
      const contextLimit = mode === 'figure_it_out' ? 20 : 10
      const history = messages.slice(-contextLimit).map((m) => ({
        role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.content,
      }))

      const response = await fetch('/api/nila/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
          mode,
          conversationId,
          language: nilaLanguageRef.current,
        }),
      })

      if (!response.ok) {
        const data = await response.json() as { error?: string; conversationId?: string }
        if (data.conversationId) setConversationId(data.conversationId)
        if (data.error === 'daily_limit_reached') {
          setMessageCount(messageLimit)
        } else {
          setFailedMessage(text)
          setMessageCount((prev) => Math.max(0, prev - 1))
          setMessages((prev) => [
            ...prev,
            { id: streamingId, role: 'nila', content: 'Something went wrong. Tap to retry.', timestamp: new Date(), isRetryable: true },
          ])
        }
        return
      }

      if (!response.body) return

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6)) as {
              token?: string
              done?: boolean
              conversationId?: string
              error?: string
            }

            if (data.token) {
              accumulatedContent += data.token
              if (!bubbleAdded) {
                bubbleAdded = true
                setMessages((prev) => [
                  ...prev,
                  { id: streamingId, role: 'nila', content: data.token!, timestamp: new Date() },
                ])
              } else {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === streamingId ? { ...m, content: accumulatedContent } : m,
                  ),
                )
              }
            }

            if (data.done) {
              if (data.conversationId) setConversationId(data.conversationId)
              const recentUserMsgs = [...messages, userMsg]
                .filter((m) => m.role === 'user')
                .slice(-3)
                .map((m) => m.content)
              updateSidebarAfterReply(recentUserMsgs)
            }

            if (data.error) {
              setFailedMessage(text)
              setMessageCount((prev) => Math.max(0, prev - 1))
              if (!bubbleAdded) {
                setMessages((prev) => [
                  ...prev,
                  { id: streamingId, role: 'nila', content: 'Something went wrong. Tap to retry.', timestamp: new Date(), isRetryable: true },
                ])
              } else {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === streamingId
                      ? { ...m, content: 'Something went wrong. Tap to retry.', isRetryable: true }
                      : m,
                  ),
                )
              }
            }
          } catch { /* skip malformed SSE lines */ }
        }
      }
    } finally {
      setIsSending(false)
    }
  }, [isSending, limitReached, awaitingRestoreDecision, conversationId, messages, mode, messageLimit, currentDefaultMode, initialGreeting])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    setInput('')
    await doSend(text)
  }

  async function handleRetry() {
    if (!failedMessage) return
    const text = failedMessage
    // Remove the error bubble first
    setMessages((prev) => prev.filter((m) => !m.isRetryable))
    setInput('')
    await doSend(text)
  }

  const barFillPct = Math.min(100, (messageCount / messageLimit) * 100)
  const inputDisabled = limitReached || isSending
  const inputModeClass = mode === 'rant' ? ' ns-chat__input--rant' : mode === 'figure_it_out' ? ' ns-chat__input--figureout' : ''
  const inputPlaceholder = limitReached
    ? "You've had a full conversation today. Come back tomorrow."
    : "Say anything. There's no right way to start."

  return (
    <div className="ns-chat-shell">
      {/* COL 1 — Sidebar */}
      <Sidebar userName={userName} userInitial={userInitial} />

      {/* COL 2 — Session rail */}
      <aside className="ns-rail">
        <div className="ns-rail__section">
          <div className="ns-rail__eyebrow">Session</div>
          <div className="ns-rail__time">{currentTime}</div>
          <div className="ns-rail__meta">
            {messageCount} of {messageLimit} messages · {sessionDuration} min
          </div>
          <div className="ns-rail__mood">
            <span className="ns-rail__mood-glyph">{mood.emoji}</span>
            <span className="ns-rail__mood-label">{mood.label}</span>
          </div>
        </div>

        <div className="ns-rail__section">
          <div className="ns-rail__eyebrow">Messages used</div>
          <div className="ns-rail__bar">
            <div className="ns-rail__bar-fill" style={{ width: `${barFillPct}%` }} />
          </div>
          {limitReached && (
            <div className="ns-rail__limit-row">
              <span className="ns-rail__limit-label">Limit reached</span>
              <button
                className="ns-link"
                type="button"
                style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 3 }}
                onClick={() => router.push('/plans')}
              >
                View plans <ArrowIcon />
              </button>
            </div>
          )}
        </div>

        <div className="ns-rail__section">
          <div className="ns-rail__eyebrow">Topics tonight</div>
          <div className="ns-rail__chips">
            {topics.length > 0
              ? topics.map((t) => <span key={t} className="ns-rail-chip">{t}</span>)
              : <span className="ns-rail-chip">Listening…</span>
            }
          </div>
        </div>

        <div className="ns-rail__section">
          <div className="ns-rail__eyebrow">Need someone now</div>
          <div className="ns-rail__help">
            <div className="ns-rail__help-name">iCall</div>
            <div className="ns-rail__help-number">9152 987 821</div>
            <div className="ns-rail__help-hours">Mon–Sat · 8am–10pm · Free</div>
          </div>
          <div className="ns-rail__help">
            <div className="ns-rail__help-name">Vandrevala</div>
            <div className="ns-rail__help-number">1860 2662 345</div>
            <div className="ns-rail__help-hours">24 / 7 · Free</div>
          </div>
        </div>

        <div className="ns-rail__foot">
          <p className="ns-rail__disclaim">
            Nila is an AI, not a licensed therapist. She&apos;s a place to be heard — not a
            substitute for professional care.
          </p>
          <button className="ns-rail__new" type="button" onClick={handleNewSession}>
            <RefreshIcon />
            <span>New session</span>
          </button>
        </div>
      </aside>

      {/* COL 3 — Chat pane */}
      <main className="ns-chat">
        {/* Header */}
        <header className="ns-chat__header">
          <div className="ns-chat__id">
            <NilaBubbleAvatar />
            <div className="ns-chat__id-text">
              <div className="ns-chat__name">
                Nila
                <span className="ns-chat__dot" aria-label="online" />
              </div>
              <div className="ns-chat__role">AI companion · here to listen</div>
            </div>
          </div>
          <div className="ns-chat__actions">
            <div style={{ position: 'relative' }}>
              <button
                className="ns-chat__crisis"
                type="button"
                aria-label="Crisis line numbers"
                aria-expanded={showCrisisPanel}
                onClick={() => setShowCrisisPanel((p) => !p)}
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path
                    d="M3 4 Q3 3 4 3 H5.5 Q6 3 6.2 3.5 L 7 5.8 Q 7.2 6.3 6.8 6.6 L 5.8 7.6 Q 7 10 9 11 L 10 10 Q 10.5 9.7 11 9.9 L 13.3 10.7 Q 13.8 10.9 13.8 11.5 V 12.8 Q 13.8 13.5 13 13.5 Q 7 13.5 4 10.5 Q 3 7.5 3 4 Z"
                    stroke="currentColor"
                    strokeWidth="1.1"
                    fill="none"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Crisis line</span>
              </button>
              {showCrisisPanel && (
                <div className="ns-crisis-panel">
                  <div className="ns-crisis-panel__item">
                    <div className="ns-crisis-panel__name">iCall</div>
                    <div className="ns-crisis-panel__number">9152 987 821</div>
                    <div className="ns-crisis-panel__hours">Mon–Sat · 8am–10pm · Free</div>
                  </div>
                  <div className="ns-crisis-panel__item">
                    <div className="ns-crisis-panel__name">Vandrevala</div>
                    <div className="ns-crisis-panel__number">1860 2662 345</div>
                    <div className="ns-crisis-panel__hours">24 / 7 · Free</div>
                  </div>
                </div>
              )}
            </div>
            <button
              className="ns-chat__icon-btn"
              type="button"
              aria-label="Settings"
              onClick={() => setShowSettings(true)}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="1.6" stroke="currentColor" strokeWidth="1.2" fill="none" />
                <path
                  d="M7 1 V3 M7 11 V13 M1 7 H3 M11 7 H13 M2.8 2.8 L 4.3 4.3 M9.7 9.7 L 11.2 11.2 M2.8 11.2 L 4.3 9.7 M9.7 4.3 L 11.2 2.8"
                  stroke="currentColor"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </header>

        {/* Disclaimer banner */}
        {showBanner && (
          <div className="ns-chat__banner">
            <span className="ns-chat__banner-icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
                <path
                  d="M7 4.2 V7.5 M7 9.5 V9.7"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <p className="ns-chat__banner-text">
              <strong>Nila is an AI</strong>, not a licensed therapist. If you&apos;re in crisis,
              call iCall <span className="ns-mono">9152 987 821</span> or Vandrevala{' '}
              <span className="ns-mono">1860 2662 345</span>.
            </p>
            <button
              className="ns-chat__banner-close"
              type="button"
              aria-label="Dismiss disclaimer"
              onClick={() => setShowBanner(false)}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M3 3 L 9 9 M9 3 L 3 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}

        {/* Messages */}
        <div
          className="ns-chat__messages"
          role="log"
          aria-live="polite"
          aria-label="Conversation with Nila"
        >
          <div className="ns-chat__day-divider">
            <span>{sessionPeriod}</span>
          </div>

          {messages.map((m) => (
            <div
              key={m.id}
              className={`ns-bubble ns-bubble--${m.role === 'nila' ? 'nila' : 'user'}`}
            >
              <div className="ns-bubble__avatar">
                {m.role === 'nila' ? (
                  <NilaBubbleAvatar />
                ) : (
                  <div className="ns-bubble__user-avatar" aria-hidden="true">
                    {userInitial}
                  </div>
                )}
              </div>
              <div className="ns-bubble__col">
                {m.isRetryable ? (
                  <button
                    className="ns-bubble__body ns-bubble__body--retryable"
                    type="button"
                    onClick={handleRetry}
                  >
                    {m.content}
                  </button>
                ) : (
                  <div className="ns-bubble__body">{m.content}</div>
                )}
                <div className="ns-bubble__time" suppressHydrationWarning>{formatTime(m.timestamp)}</div>
              </div>
            </div>
          ))}

          {isSending && messages[messages.length - 1]?.role !== 'nila' && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>

        {/* Limit strip */}
        {limitReached && (
          <div className="ns-chat__limit-strip">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
              <path d="M7 4 V7.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="7" cy="9.4" r="0.6" fill="currentColor" />
            </svg>
            <span>You&apos;ve had a full conversation today. Come back tomorrow — Nila will be here.</span>
            <a
              href="/plans"
              className="ns-link"
              style={{ marginLeft: 'auto', whiteSpace: 'nowrap', fontSize: 12 }}
            >
              Unlock more →
            </a>
          </div>
        )}

        {/* Input */}
        <form className="ns-chat__input-wrap" onSubmit={handleSend}>
          <ModeSwitcher
            mode={mode}
            disabled={inputDisabled}
            onChange={handleModeSwitch}
          />
          <div className={`ns-chat__input${inputModeClass}${inputDisabled ? ' ns-chat__input--disabled' : ''}`}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={inputPlaceholder}
              disabled={inputDisabled}
              aria-label="Message Nila"
              style={{ fontSize: 16 }}
            />
            <button
              type="submit"
              className="ns-chat__send"
              disabled={inputDisabled || !input.trim()}
              aria-label="Send message"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M3 8 H 12 M8 4 L 12 8 L 8 12"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <p className="ns-chat__footer-note">
            <em>Your conversation is stored privately on Nest&apos;s servers.</em>
          </p>
        </form>
      </main>

      {/* Settings panel overlay */}
      {showSettings && (
        <NilaSettingsPanel
          defaultMode={currentDefaultMode}
          language={currentLanguage}
          nudgeEnabled={currentNudgeEnabled}
          nudgeTime={currentNudgeTime}
          onClose={() => setShowSettings(false)}
          onSettingChange={handleSettingChange}
        />
      )}

      <BottomNav />
    </div>
  )
}
