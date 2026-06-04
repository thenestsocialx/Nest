'use client'

import { useState, useRef, useEffect } from 'react'
import type { Question } from '@/lib/assessment/types'
import AnswerChip from './AnswerChip'

interface QuestionScreenProps {
  question: Question
  stepNumber: number
  selectedLabel: string | null
  onSelect: (label: string) => void
  onTextSubmit: (text: string) => void
  disabled?: boolean
}

export default function QuestionScreen({
  question,
  stepNumber,
  selectedLabel,
  onSelect,
  onTextSubmit,
  disabled,
}: QuestionScreenProps) {
  const [textValue, setTextValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Reset text when question changes
  useEffect(() => {
    setTextValue('')
    if (question.type === 'text' && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [question.id, question.type])

  const isText = question.type === 'text'
  const canSubmitText = textValue.trim().length > 0 && !disabled

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px 80px',
        position: 'relative',
      }}
    >
      <div style={{ width: '100%', maxWidth: '560px' }}>

        {/* Step label */}
        <p
          style={{
            fontSize: '10px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--moss)',
            opacity: 0.7,
            marginBottom: '22px',
          }}
        >
          Question {stepNumber}
        </p>

        {/* Question headline */}
        <h1
          style={{
            fontSize: 'clamp(1.25rem, 3vw, 1.6875rem)',
            lineHeight: 1.3,
            fontWeight: 400,
            color: 'var(--deep-pine)',
            marginBottom: '10px',
            letterSpacing: '-0.01em',
          }}
        >
          {question.text}
        </h1>

        {/* Subtext */}
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--moss)',
            lineHeight: 1.65,
            marginBottom: '36px',
            opacity: 0.85,
          }}
        >
          {question.subtext}
        </p>

        {/* Chip grid */}
        {!isText && (
          <div
            role="group"
            aria-label="Answer options"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))',
              gap: '10px',
            }}
          >
            {question.options.map((option) => (
              <AnswerChip
                key={option.label}
                label={option.label}
                selected={selectedLabel === option.label}
                onClick={() => onSelect(option.label)}
                disabled={disabled}
              />
            ))}
          </div>
        )}

        {/* Open-text input for type === 'text' questions */}
        {isText && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <textarea
              ref={textareaRef}
              value={textValue}
              onChange={e => setTextValue(e.target.value)}
              disabled={disabled}
              rows={5}
              placeholder="Type your answer here…"
              aria-label={question.text}
              style={{
                width: '100%',
                padding: '16px 20px',
                fontFamily: 'inherit',
                fontSize: '0.9375rem',
                lineHeight: 1.65,
                color: 'var(--deep-pine)',
                background: 'var(--cream)',
                border: '1.5px solid rgba(224, 213, 197, 0.9)',
                borderRadius: '12px',
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 200ms ease-in-out',
                opacity: disabled ? 0.6 : 1,
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--moss)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(224, 213, 197, 0.9)' }}
            />
            <button
              onClick={() => { if (canSubmitText) onTextSubmit(textValue) }}
              disabled={!canSubmitText}
              style={{
                alignSelf: 'flex-start',
                display: 'inline-flex',
                alignItems: 'center',
                fontFamily: 'inherit',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: canSubmitText ? 'var(--cream)' : 'var(--moss)',
                background: canSubmitText ? 'var(--terracotta)' : 'rgba(224,213,197,0.5)',
                border: 'none',
                borderRadius: '999px',
                padding: '12px 28px',
                cursor: canSubmitText ? 'pointer' : 'default',
                minHeight: '44px',
                transition: 'background 200ms ease-in-out, color 200ms ease-in-out',
              }}
              onMouseEnter={e => { if (canSubmitText) (e.currentTarget as HTMLElement).style.background = '#8a5a48' }}
              onMouseLeave={e => { if (canSubmitText) (e.currentTarget as HTMLElement).style.background = 'var(--terracotta)' }}
            >
              Continue →
            </button>
          </div>
        )}
      </div>

      {/* ILL-02 · Leaf — ambient corner, tablet+ only */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '52px',
          right: '52px',
          pointerEvents: 'none',
          opacity: 0.65,
          display: 'var(--leaf-display, none)',
        }}
      >
        <style>{`@media (min-width: 768px) { :root { --leaf-display: block; } }`}</style>
        <svg width="62" height="80" viewBox="0 0 80 100" fill="none">
          <path d="M40 92 Q40 50 40 12" stroke="#2F4C3A" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />
          <path d="M40 12 Q14 22 18 56 Q22 82 40 88 Q58 82 62 56 Q66 22 40 12 Z" fill="#5C7A66" opacity="0.38" stroke="#2F4C3A" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M40 20 Q30 38 28 56" stroke="#E8C8A0" strokeWidth="1" fill="none" opacity="0.55" />
          <path d="M40 24 Q50 40 52 58" stroke="#E8C8A0" strokeWidth="1" fill="none" opacity="0.55" />
          <path d="M40 36 L34 43 M40 50 L34 57 M40 36 L46 43 M40 50 L46 57" stroke="#E8C8A0" strokeWidth="0.8" opacity="0.45" />
        </svg>
      </div>
    </div>
  )
}
