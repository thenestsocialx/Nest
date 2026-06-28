'use client'

import { useEffect, useRef, useCallback, useReducer } from 'react'
import { useRouter } from 'next/navigation'
import type { AssessmentState, AnswerRecord, ResultData, BranchId, NextTarget, RecommendedAlly } from '@/lib/assessment/types'
import { QUESTION_TREE, BRANCH_START_MAP, ESTIMATED_TOTAL_STEPS } from '@/config/questions'
import ProgressBar from './ProgressBar'
import QuestionScreen from './QuestionScreen'
import PauseScreen from './PauseScreen'
import ResultScreen from './ResultScreen'
import CrisisScreen from './CrisisScreen'

const SESSION_ID_KEY = 'nest_session_id'
const PROGRESS_KEY   = 'nest_assessment_progress'
const RESULT_KEY     = 'nest_assessment_result'
const PENDING_KEY    = 'nest_assessment_pending'

const FIRST_QUESTION = 'Q0'

type StoredProgress = {
  currentQuestionId: string
  branch: BranchId | null
  answers: AnswerRecord[]
  history: string[]
  crisisFlag: boolean
}

// ── Reducer ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'RESTORE'; payload: StoredProgress }
  | { type: 'SELECT'; payload: { label: string; microcopy: string; next: NextTarget; branch: BranchId | null } }
  | { type: 'TEXT_SUBMIT'; payload: { text: string; microcopy: string; next: NextTarget } }
  | { type: 'ADVANCE_TO_PAUSE' }
  | { type: 'ADVANCE_TO_QUESTION'; payload: { record: AnswerRecord; nextId: string } }
  | { type: 'ADVANCE_TO_LOADING'; payload: AnswerRecord }
  | { type: 'ADVANCE_TO_CRISIS'; payload: AnswerRecord }
  | { type: 'CONTINUE_FROM_CRISIS' }
  | { type: 'SET_RESULT'; payload: ResultData }
  | { type: 'SET_RECOMMENDED_ALLIES'; payload: RecommendedAlly[] }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RETRY' }
  | { type: 'BACK' }

const initialState: AssessmentState = {
  phase: 'question',
  currentQuestionId: FIRST_QUESTION,
  branch: null,
  history: [],
  answers: [],
  currentAnswer: null,
  result: null,
  error: null,
  crisisFlag: false,
  recommendedAllies: [],
}

function reducer(state: AssessmentState, action: Action): AssessmentState {
  switch (action.type) {
    case 'RESTORE':
      return {
        ...state,
        currentQuestionId: action.payload.currentQuestionId ?? FIRST_QUESTION,
        branch: action.payload.branch ?? null,
        answers: action.payload.answers ?? [],
        history: action.payload.history ?? [],
        crisisFlag: action.payload.crisisFlag ?? false,
      }

    case 'SELECT':
      return {
        ...state,
        currentAnswer: { label: action.payload.label, microcopy: action.payload.microcopy, next: action.payload.next },
        branch: action.payload.branch ?? state.branch,
      }

    case 'TEXT_SUBMIT':
      return {
        ...state,
        currentAnswer: { label: action.payload.text, microcopy: action.payload.microcopy, next: action.payload.next },
      }

    case 'ADVANCE_TO_PAUSE':
      return { ...state, phase: 'pause' }

    case 'ADVANCE_TO_QUESTION':
      return {
        ...state,
        phase: 'question',
        currentQuestionId: action.payload.nextId,
        history: [...state.history, state.currentQuestionId],
        answers: [...state.answers, action.payload.record],
        currentAnswer: null,
      }

    case 'ADVANCE_TO_LOADING':
      return {
        ...state,
        phase: 'loading',
        answers: [...state.answers, action.payload],
        currentAnswer: null,
        error: null,
      }

    case 'ADVANCE_TO_CRISIS':
      return {
        ...state,
        phase: 'crisis',
        crisisFlag: true,
        answers: [...state.answers, action.payload],
        currentAnswer: null,
      }

    case 'CONTINUE_FROM_CRISIS':
      // After crisis screen, continue to INTENSITY question
      return {
        ...state,
        phase: 'question',
        currentQuestionId: 'INTENSITY',
        history: [...state.history, state.currentQuestionId],
      }

    case 'SET_RESULT':
      return { ...state, phase: 'result', result: action.payload }

    case 'SET_RECOMMENDED_ALLIES':
      return { ...state, recommendedAllies: action.payload }

    case 'SET_ERROR':
      return { ...state, error: action.payload }

    case 'RETRY':
      return { ...state, error: null, phase: 'loading' }

    case 'BACK': {
      if (state.history.length === 0) return state
      const prevId = state.history[state.history.length - 1]
      const prevAnswers = state.answers.slice(0, -1)
      // Restore branch: if going back to before Q1 was answered, clear branch
      const prevBranch = prevAnswers.find(a => a.questionId === 'Q1')
        ? state.branch
        : null
      return {
        ...state,
        phase: 'question',
        currentQuestionId: prevId,
        history: state.history.slice(0, -1),
        answers: prevAnswers,
        currentAnswer: null,
        error: null,
        branch: prevBranch,
      }
    }

    default:
      return state
  }
}

// ── Helper — resolve BRANCH_START to actual first question ID ──────────────
function resolveNext(next: NextTarget, branch: BranchId | null): string | 'RESULT' | 'CRISIS' {
  if (next === 'BRANCH_START') {
    if (!branch) return 'A1' // fallback — should not happen in practice
    return BRANCH_START_MAP[branch]
  }
  return next as string | 'RESULT' | 'CRISIS'
}

// ── Component ────────────────────────────────────────────────────────────────

export default function AssessmentShell() {
  const router = useRouter()
  const [state, dispatch] = useReducer(reducer, initialState)
  const sessionIdRef   = useRef<string>('')
  const pauseTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const selectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resultFetchRef = useRef<Promise<void> | null>(null)

  // ── Mount: session ID + progress restore ──────────────────────────────────
  useEffect(() => {
    let id = sessionStorage.getItem(SESSION_ID_KEY)
    if (!id) {
      id = crypto.randomUUID()
      sessionStorage.setItem(SESSION_ID_KEY, id)
    }
    sessionIdRef.current = id

    const raw = sessionStorage.getItem(PROGRESS_KEY)
    if (raw) {
      try {
        const stored: StoredProgress = JSON.parse(raw)
        if (stored.answers.length > 0) {
          dispatch({ type: 'RESTORE', payload: stored })
        }
      } catch {
        // corrupt — start fresh
      }
    }
  }, [])

  // ── Persist progress on every answer ─────────────────────────────────────
  const persistProgress = useCallback((s: Pick<AssessmentState, 'currentQuestionId' | 'branch' | 'answers' | 'history' | 'crisisFlag'>) => {
    const stored: StoredProgress = {
      currentQuestionId: s.currentQuestionId,
      branch: s.branch,
      answers: s.answers,
      history: s.history,
      crisisFlag: s.crisisFlag,
    }
    sessionStorage.setItem(PROGRESS_KEY, JSON.stringify(stored))
  }, [])

  // ── Fetch result from API ─────────────────────────────────────────────────
  const fetchResult = useCallback(async (allAnswers: AnswerRecord[]) => {
    const controller = new AbortController()
    const timeout    = setTimeout(() => controller.abort(), 30_000)

    try {
      const [res, alliesRes] = await Promise.all([
        fetch('/api/assessment/result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            branch: state.branch,
            answers: allAnswers.map(a => ({
              questionId:   a.questionId,
              questionText: a.questionText,
              answer:       a.answer,
            })),
          }),
          signal: controller.signal,
        }),
        state.branch
          ? fetch(`/api/v1/allies/recommended?branch=${encodeURIComponent(state.branch)}&limit=3`)
          : Promise.resolve(null),
      ])

      const data: ResultData = await res.json()
      if (!res.ok) throw new Error('Result generation failed')

      sessionStorage.setItem(RESULT_KEY, JSON.stringify(data))
      dispatch({ type: 'SET_RESULT', payload: data })

      if (alliesRes?.ok) {
        const { allies } = await alliesRes.json()
        if (Array.isArray(allies) && allies.length > 0) {
          dispatch({ type: 'SET_RECOMMENDED_ALLIES', payload: allies })
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      dispatch({ type: 'SET_ERROR', payload: message })
    } finally {
      clearTimeout(timeout)
    }
  }, [state.branch])

  // ── Chip selected ─────────────────────────────────────────────────────────
  const handleSelect = useCallback((label: string) => {
    if (state.phase !== 'question') return

    const question = QUESTION_TREE[state.currentQuestionId]
    const option   = question.options.find(o => o.label === label)
    if (!option) return

    const newBranch = option.branchId ?? state.branch

    dispatch({
      type: 'SELECT',
      payload: { label: option.label, microcopy: option.microcopy, next: option.next, branch: newBranch },
    })

    persistProgress({
      currentQuestionId: state.currentQuestionId,
      branch: newBranch,
      answers: state.answers,
      history: state.history,
      crisisFlag: state.crisisFlag,
    })

    if (selectTimerRef.current) clearTimeout(selectTimerRef.current)

    // Crisis answers bypass pause — go directly to crisis screen
    if (option.next === 'CRISIS') {
      selectTimerRef.current = setTimeout(() => {
        const record: AnswerRecord = {
          questionId:   question.id,
          questionText: question.text,
          answer:       option.label,
          microcopy:    option.microcopy,
        }
        dispatch({ type: 'ADVANCE_TO_CRISIS', payload: record })
      }, 400)
      return
    }

    // All other answers — pause after 1400ms
    selectTimerRef.current = setTimeout(() => {
      dispatch({ type: 'ADVANCE_TO_PAUSE' })
    }, 1400)
  }, [state.phase, state.currentQuestionId, state.branch, state.answers, state.history, state.crisisFlag, persistProgress])

  // ── Open-text submitted ───────────────────────────────────────────────────
  const handleTextSubmit = useCallback((text: string) => {
    if (state.phase !== 'question') return

    const question = QUESTION_TREE[state.currentQuestionId]
    if (!question.textNext || !question.textMicrocopy) return

    dispatch({
      type: 'TEXT_SUBMIT',
      payload: { text: text.trim() || '—', microcopy: question.textMicrocopy, next: question.textNext },
    })

    if (selectTimerRef.current) clearTimeout(selectTimerRef.current)
    selectTimerRef.current = setTimeout(() => {
      dispatch({ type: 'ADVANCE_TO_PAUSE' })
    }, 1400)
  }, [state.phase, state.currentQuestionId])

  // ── Pause screen auto-advance ─────────────────────────────────────────────
  useEffect(() => {
    if (state.phase !== 'pause' || !state.currentAnswer) return

    const question = QUESTION_TREE[state.currentQuestionId]
    const record: AnswerRecord = {
      questionId:   question.id,
      questionText: question.text,
      answer:       state.currentAnswer.label,
      microcopy:    state.currentAnswer.microcopy,
    }

    const resolved = resolveNext(state.currentAnswer.next, state.branch)

    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current)

    pauseTimerRef.current = setTimeout(() => {
      if (resolved === 'RESULT') {
        const allAnswers = [...state.answers, record]
        dispatch({ type: 'ADVANCE_TO_LOADING', payload: record })
        resultFetchRef.current = fetchResult(allAnswers)
      } else {
        dispatch({ type: 'ADVANCE_TO_QUESTION', payload: { record, nextId: resolved } })
        persistProgress({
          currentQuestionId: resolved,
          branch: state.branch,
          answers: [...state.answers, record],
          history: [...state.history, state.currentQuestionId],
          crisisFlag: state.crisisFlag,
        })
      }
    }, 1400)

    return () => { if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current) }
  }, [state.phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Retry after error ─────────────────────────────────────────────────────
  const handleRetry = useCallback(() => {
    dispatch({ type: 'RETRY' })
    resultFetchRef.current = fetchResult(state.answers)
  }, [state.answers, fetchResult])

  // ── Save: store pending, navigate to login ────────────────────────────────
  const handleSave = useCallback(() => {
    if (!state.result) return
    const pending = {
      answers:    state.answers,
      result:     state.result,
      branch:     state.branch,
      crisisFlag: state.crisisFlag,
      sessionId:  sessionIdRef.current,
    }
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending))
    router.push('/login?redirectTo=/assessment/save')
  }, [state.result, state.answers, state.branch, state.crisisFlag, router])

  // ── Back ──────────────────────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    if (selectTimerRef.current) clearTimeout(selectTimerRef.current)
    dispatch({ type: 'BACK' })
  }, [])

  // ── Continue from crisis ──────────────────────────────────────────────────
  const handleContinueFromCrisis = useCallback(() => {
    dispatch({ type: 'CONTINUE_FROM_CRISIS' })
  }, [])

  // ── Cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (selectTimerRef.current) clearTimeout(selectTimerRef.current)
      if (pauseTimerRef.current)  clearTimeout(pauseTimerRef.current)
    }
  }, [])

  // ── Derived: progress bar ─────────────────────────────────────────────────
  const progress = state.phase === 'result'
    ? 100
    : Math.min(95, (state.answers.length / ESTIMATED_TOTAL_STEPS) * 100)

  // ── Derived: show "Almost there" hint ────────────────────────────────────
  const showHint = state.answers.length >= 8 || state.phase === 'loading' || state.phase === 'result'

  // ── Derived: back button visibility ──────────────────────────────────────
  const canGoBack = state.phase === 'question' && state.history.length > 0

  // ── Derived: step number for label ───────────────────────────────────────
  const stepNumber = state.answers.length + 1

  // ── Pause screen data ─────────────────────────────────────────────────────
  const pauseAnswer    = state.currentAnswer?.label    ?? ''
  const pauseMicrocopy = state.currentAnswer?.microcopy ?? ''

  const isResultPhase = state.phase === 'result'
  const isCrisisPhase = state.phase === 'crisis'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--cream)' }}>

      {/* Progress bar — hidden on result and crisis */}
      {!isResultPhase && !isCrisisPhase && <ProgressBar progress={progress} />}

      {/* Nav — hidden on result and crisis */}
      {!isResultPhase && !isCrisisPhase && (
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'clamp(16px, 3vw, 28px) clamp(20px, 5vw, 48px) 0',
          }}
          aria-label="Assessment navigation"
        >
          <button
            onClick={handleBack}
            aria-label="Go back to previous question"
            style={{
              fontSize: '0.8125rem',
              color: 'var(--moss)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              opacity: canGoBack ? 0.65 : 0,
              pointerEvents: canGoBack ? 'auto' : 'none',
              fontFamily: 'inherit',
              minHeight: '44px',
              padding: '0 8px',
              transition: 'opacity 200ms ease-in-out',
            }}
          >
            ‹ Back
          </button>

          <span style={{ fontSize: '0.8125rem', fontWeight: 500, letterSpacing: '0.1em', color: 'var(--deep-pine)', textTransform: 'lowercase' }}>
            nest
          </span>

          <span
            style={{
              fontSize: '11px',
              color: 'var(--moss)',
              opacity: showHint ? 0.55 : 0,
              letterSpacing: '0.02em',
              transition: 'opacity 400ms ease-in-out',
              minWidth: '80px',
              textAlign: 'right',
            }}
          >
            Almost there
          </span>
        </nav>
      )}

      {/* Screens */}
      {state.phase === 'question' && (
        <QuestionScreen
          question={QUESTION_TREE[state.currentQuestionId]}
          stepNumber={stepNumber}
          selectedLabel={state.currentAnswer?.label ?? null}
          onSelect={handleSelect}
          onTextSubmit={handleTextSubmit}
          disabled={state.currentAnswer !== null}
        />
      )}

      {(state.phase === 'pause' || state.phase === 'loading') && (
        <PauseScreen answer={pauseAnswer} microcopy={pauseMicrocopy} />
      )}

      {state.phase === 'crisis' && (
        <CrisisScreen onContinue={handleContinueFromCrisis} />
      )}

      {state.phase === 'result' && (
        <ResultScreen result={state.result} onSave={handleSave} recommendedAllies={state.recommendedAllies} />
      )}

      {/* Error overlay */}
      {state.error && state.phase === 'loading' && (
        <div
          role="alert"
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--cream)',
            border: '1px solid rgba(155,102,81,0.3)',
            borderRadius: '12px',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 4px 24px rgba(47,76,58,0.1)',
            zIndex: 300,
            maxWidth: 'calc(100vw - 48px)',
          }}
        >
          <p style={{ fontSize: '0.875rem', color: 'var(--terracotta)', margin: 0 }}>
            Something went wrong. Your answers are saved.
          </p>
          <button
            onClick={handleRetry}
            style={{
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: 'var(--deep-pine)',
              background: 'transparent',
              border: '1.5px solid var(--deep-pine)',
              borderRadius: '999px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              minHeight: '44px',
            }}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  )
}
