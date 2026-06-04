'use client'

import { useState, useRef, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import { sendNilaMessage } from '@/actions/nila'
import type { ConversationMessage } from '@/actions/nila'

const MESSAGE_LIMIT = 10

interface Message {
  id: string
  role: 'user' | 'nila'
  content: string
  timestamp: Date
}

interface ChatShellProps {
  userName: string
  userEmail: string
  userInitial: string
}

function formatTime(date: Date): string {
  const h = date.getHours()
  const m = date.getMinutes()
  const ampm = h >= 12 ? 'pm' : 'am'
  const hour = h % 12 || 12
  const min = m.toString().padStart(2, '0')
  return `${hour}:${min} ${ampm}`
}

const INITIAL_MESSAGE: Message = {
  id: 'init',
  role: 'nila',
  content: "Hey. I'm Nila. I'm here to listen — no rush, no judgment. What's on your mind?",
  timestamp: new Date(),
}

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

export default function ChatShell({ userName, userInitial }: ChatShellProps) {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showBanner, setShowBanner] = useState(true)
  const [sessionStartTime, setSessionStartTime] = useState(() => new Date())
  const [currentTime, setCurrentTime] = useState(() => formatTime(new Date()))
  const [sessionDuration, setSessionDuration] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const messageCount = messages.filter((m) => m.role === 'user').length
  const limitReached = messageCount >= MESSAGE_LIMIT

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

  function handleNewSession() {
    const now = new Date()
    setMessages([
      {
        id: 'init-' + now.getTime(),
        role: 'nila',
        content: "Hey. I'm Nila. I'm here to listen — no rush, no judgment. What's on your mind?",
        timestamp: now,
      },
    ])
    setSessionStartTime(now)
    setSessionDuration(0)
    setCurrentTime(formatTime(now))
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || isSending || limitReached) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setIsSending(true)

    try {
      // history = conversation BEFORE current message; server action appends it
      const history: ConversationMessage[] = messages.slice(-10).map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }))

      const { reply, error } = await sendNilaMessage(text, history)

      if (error && !reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'nila',
            content: 'Something went wrong. Please try again.',
            timestamp: new Date(),
          },
        ])
      } else if (reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'nila',
            content: reply,
            timestamp: new Date(),
          },
        ])
      }
    } finally {
      setIsSending(false)
    }
  }

  const barFillPct = Math.min(100, (messageCount / MESSAGE_LIMIT) * 100)
  const inputDisabled = limitReached || isSending
  const inputPlaceholder = limitReached
    ? 'Free messages used — come back tomorrow, or unlock more.'
    : 'Say anything. There\'s no right way to start.'

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
            {messageCount} of {MESSAGE_LIMIT} messages · {sessionDuration} min
          </div>
          <div className="ns-rail__mood">
            <span className="ns-rail__mood-glyph">😶</span>
            <span className="ns-rail__mood-label">Neutral</span>
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
              <button className="ns-link" type="button">
                View plans <ArrowIcon />
              </button>
            </div>
          )}
        </div>

        <div className="ns-rail__section">
          <div className="ns-rail__eyebrow">Topics tonight</div>
          <div className="ns-rail__chips">
            <span className="ns-rail-chip">Listening…</span>
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
            <button className="ns-chat__crisis" type="button" aria-label="Crisis line numbers">
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
            <button className="ns-chat__icon-btn" type="button" aria-label="Settings">
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
                <path
                  d="M3 3 L 9 9 M9 3 L 3 9"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
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
            <span>Tonight</span>
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
                <div className="ns-bubble__body">{m.content}</div>
                <div className="ns-bubble__time" suppressHydrationWarning>{formatTime(m.timestamp)}</div>
              </div>
            </div>
          ))}

          {isSending && <TypingIndicator />}

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
            <span>
              You&apos;ve used your free messages for today.{' '}
              <button className="ns-link" type="button">
                Pick up tomorrow, or unlock more →
              </button>
            </span>
          </div>
        )}

        {/* Input */}
        <form className="ns-chat__input-wrap" onSubmit={handleSend}>
          <div className={`ns-chat__input${inputDisabled ? ' ns-chat__input--disabled' : ''}`}>
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
            <em>Your conversation is private and stays on this device.</em>
          </p>
        </form>
      </main>

      <BottomNav />
    </div>
  )
}
