'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { updateNilaSetting } from '@/actions/nila-settings'
import { clearNilaHistory } from '@/actions/nila'
import type { NilaMode } from '@/actions/nila'

interface Props {
  defaultMode: NilaMode
  language: string
  nudgeEnabled: boolean
  nudgeTime: string
  onClose: () => void
  onSettingChange?: (field: string, value: string | boolean) => void
}

const MODES: { value: NilaMode; label: string }[] = [
  { value: 'normal',        label: 'Guide' },
  { value: 'rant',          label: 'Vent' },
  { value: 'figure_it_out', label: 'Reflect' },
]

const LANGUAGES: { value: string; label: string }[] = [
  { value: 'english', label: 'English' },
  { value: 'tamil',   label: 'Tamil' },
  { value: 'hindi',   label: 'Hindi' },
]

const NUDGE_TIMES: { value: string; label: string }[] = [
  { value: 'morning', label: 'Morning (around 9am)' },
  { value: 'evening', label: 'Evening (around 8pm)' },
]

export default function NilaSettingsPanel({
  defaultMode,
  language,
  nudgeEnabled,
  nudgeTime,
  onClose,
  onSettingChange,
}: Props) {
  const [mode, setMode]       = useState<NilaMode>(defaultMode)
  const [lang, setLang]       = useState(language.toLowerCase())
  const [nudgeOn, setNudgeOn] = useState(nudgeEnabled)
  const [nudgeT, setNudgeT]   = useState(nudgeTime.toLowerCase())
  const [closing, setClosing] = useState(false)

  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [clearing, setClearing]                 = useState(false)
  const [clearSuccess, setClearSuccess]         = useState(false)

  const [dragStartY, setDragStartY]   = useState<number | null>(null)
  const [dragOffset, setDragOffset]   = useState(0)

  const panelRef = useRef<HTMLElement>(null)

  const handleClose = useCallback(() => {
    setClosing(true)
    setTimeout(onClose, 180)
  }, [onClose])

  // Focus trap + Escape key
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    function getFocusables() {
      return Array.from(
        panel!.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      )
    }

    const raf = requestAnimationFrame(() => getFocusables()[0]?.focus())

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        handleClose()
        return
      }
      if (e.key !== 'Tab') return
      const els = getFocusables()
      const first = els[0]
      const last = els[els.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus() }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [handleClose])

  // ── Per-field auto-save helper ───────────────────────────────────────────
  async function saveSetting(
    field: string,
    newValue: string | boolean,
    revert: () => void,
  ) {
    const result = await updateNilaSetting(field, newValue)
    if (result.error) {
      revert()
      toast.error('Failed to save. Try again.')
    } else {
      onSettingChange?.(field, newValue)
    }
  }

  function handleModeChange(newMode: NilaMode) {
    const prev = mode
    setMode(newMode)
    void saveSetting('nila_default_mode', newMode, () => setMode(prev))
  }

  function handleLangChange(newLang: string) {
    const prev = lang
    setLang(newLang)
    void saveSetting('nila_language', newLang, () => setLang(prev))
  }

  function handleNudgeToggle() {
    const newVal = !nudgeOn
    setNudgeOn(newVal)
    void saveSetting('nila_nudge_enabled', newVal, () => setNudgeOn(!newVal))
  }

  function handleNudgeTimeChange(newTime: string) {
    const prev = nudgeT
    setNudgeT(newTime)
    void saveSetting('nila_nudge_time', newTime, () => setNudgeT(prev))
  }

  // ── History clear ────────────────────────────────────────────────────────
  async function handleClearHistory() {
    setClearing(true)
    const { error } = await clearNilaHistory()
    setClearing(false)
    if (error) {
      toast.error('Something went wrong. Try again.')
    } else {
      setClearSuccess(true)
      setTimeout(handleClose, 1500)
    }
  }

  // ── Mobile drag-to-dismiss ───────────────────────────────────────────────
  function handleTouchStart(e: React.TouchEvent) {
    setDragStartY(e.touches[0].clientY)
  }
  function handleTouchMove(e: React.TouchEvent) {
    if (dragStartY === null) return
    setDragOffset(Math.max(0, e.touches[0].clientY - dragStartY))
  }
  function handleTouchEnd() {
    if (dragOffset > 80) {
      handleClose()
    } else {
      setDragOffset(0)
    }
    setDragStartY(null)
  }

  const panelStyle =
    dragOffset > 0 ? { transform: `translateY(${dragOffset}px)`, transition: 'none' } : {}

  return (
    <>
      {/* Backdrop */}
      <div className="ns-nila-panel__backdrop" onClick={handleClose} aria-hidden="true" />

      {/* Panel */}
      <aside
        ref={panelRef}
        className={`ns-nila-panel${closing ? ' ns-nila-panel--closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Nila settings"
        style={panelStyle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Mobile drag handle */}
        <div className="ns-nila-panel__drag-handle" aria-hidden="true" />

        {/* Header */}
        <div className="ns-nila-panel__header">
          <span className="ns-nila-panel__title">Nila settings</span>
          <button
            className="ns-chat__icon-btn"
            type="button"
            aria-label="Close settings"
            onClick={handleClose}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M3 3 L 9 9 M9 3 L 3 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="ns-nila-panel__body">
          {/* Default mode */}
          <div className="ns-nila-panel__section">
            <div className="ns-nila-panel__label">Default mode</div>
            <p className="ns-nila-panel__sub" style={{ marginBottom: 12 }}>
              Nila opens in this mode every new session
            </p>
            <div className="ns-seg">
              {MODES.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  className={`ns-seg__btn${mode === m.value ? ' is-active' : ''}`}
                  onClick={() => handleModeChange(m.value)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="ns-nila-panel__section">
            <div className="ns-nila-panel__label">Language</div>
            <p className="ns-nila-panel__sub" style={{ marginBottom: 12 }}>
              Nila will respond in this language
            </p>
            <select
              className="ns-nila-panel__select"
              value={lang}
              onChange={(e) => handleLangChange(e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          {/* Daily check-in nudge */}
          <div className="ns-nila-panel__section">
            <div className="ns-nila-panel__row ns-nila-panel__row--between">
              <div>
                <div className="ns-nila-panel__label">Daily check-in</div>
                <p className="ns-nila-panel__sub">A gentle nudge to check in with yourself</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={nudgeOn}
                className={`ns-toggle${nudgeOn ? ' is-on' : ''}`}
                onClick={handleNudgeToggle}
                aria-label="Toggle daily check-in nudge"
              />
            </div>
            {nudgeOn && (
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {NUDGE_TIMES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    className={`ns-seg__btn${nudgeT === t.value ? ' is-active' : ''}`}
                    style={{ textAlign: 'left', justifyContent: 'flex-start', padding: '9px 14px' }}
                    onClick={() => handleNudgeTimeChange(t.value)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Danger zone */}
          <div className="ns-nila-panel__danger">
            <div
              className="ns-nila-panel__label"
              style={{ color: 'var(--moss)', opacity: 0.6, marginBottom: 14 }}
            >
              Danger zone
            </div>

            {clearSuccess ? (
              <p className="ns-nila-panel__sub">Your history has been cleared.</p>
            ) : !showClearConfirm ? (
              <button
                type="button"
                className="ns-btn ns-btn--ghost ns-btn--sm"
                style={{ fontSize: 13 }}
                onClick={() => setShowClearConfirm(true)}
              >
                Clear conversation history
              </button>
            ) : (
              <div className="ns-nila-panel__confirm">
                <p className="ns-nila-panel__sub" style={{ marginBottom: 16 }}>
                  This will permanently delete all your conversations with Nila. This cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    className="ns-btn ns-btn--sm"
                    style={{
                      color: 'var(--terracotta)',
                      background: 'transparent',
                      border: '1px solid rgba(155,102,81,0.4)',
                    }}
                    disabled={clearing}
                    onClick={handleClearHistory}
                  >
                    {clearing ? 'Clearing…' : 'Yes, clear everything'}
                  </button>
                  <button
                    type="button"
                    className="ns-btn ns-btn--ghost ns-btn--sm"
                    onClick={() => setShowClearConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
