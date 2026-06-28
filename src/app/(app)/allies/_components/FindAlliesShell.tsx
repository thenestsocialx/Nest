'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { filterAllies } from '@/lib/findAllies'
import type { AllyPublicProfile, TopicId, VibeId } from '@/types/findAllies'
import FilterColumn from './FilterColumn'
import ProfileColumn from './ProfileColumn'
import ConnectModal from './ConnectModal'

interface Props {
  allies: AllyPublicProfile[]
  userName: string
  userInitial: string
  highlightId?: string | null
}

export default function FindAlliesShell({ allies, userName, userInitial, highlightId }: Props) {
  const [selectedTopic, setSelectedTopic] = useState<TopicId | null>(null)
  const [selectedVibe,  setSelectedVibe]  = useState<VibeId  | null>(null)
  const [currentIdx,    setCurrentIdx]    = useState(0)
  const [hasSplit,      setHasSplit]      = useState(false)
  const [bookingAlly,   setBookingAlly]   = useState<AllyPublicProfile | null>(null)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)

  const filteredAllies = useMemo(
    () => filterAllies(allies, selectedTopic, selectedVibe),
    [allies, selectedTopic, selectedVibe],
  )

  const hasSelections = !!(selectedTopic || selectedVibe)

  function triggerSplit() {
    if (!hasSplit) setHasSplit(true)
  }

  function handleTopicPick(id: TopicId) {
    setSelectedTopic(prev => (prev === id ? null : id))
    setCurrentIdx(0)
    triggerSplit()
  }

  function handleVibePick(id: VibeId) {
    setSelectedVibe(prev => (prev === id ? null : id))
    setCurrentIdx(0)
    triggerSplit()
  }

  function handleClearAll() {
    setSelectedTopic(null)
    setSelectedVibe(null)
    setCurrentIdx(0)
  }

  const handleNavigate = useCallback((dir: -1 | 1) => {
    setCurrentIdx(prev => {
      const next = prev + dir
      if (next < 0 || next >= filteredAllies.length) return prev
      return next
    })
  }, [filteredAllies.length])

  // Keyboard navigation
  useEffect(() => {
    if (!hasSplit) return
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowLeft')  { e.preventDefault(); handleNavigate(-1) }
      if (e.key === 'ArrowRight') { e.preventDefault(); handleNavigate(1) }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [hasSplit, handleNavigate])

  // Clamp index when filtered list shrinks
  useEffect(() => {
    if (filteredAllies.length > 0 && currentIdx >= filteredAllies.length) {
      setCurrentIdx(0)
    }
  }, [filteredAllies.length, currentIdx])

  // Scroll to and highlight an ally arriving from assessment recommendations
  useEffect(() => {
    if (!highlightId) return
    const idx = allies.findIndex(a => a.id === highlightId)
    if (idx === -1) return
    setCurrentIdx(idx)
    setHasSplit(true)
    setHighlightedId(highlightId)
    const timer = setTimeout(() => setHighlightedId(null), 3000)
    return () => clearTimeout(timer)
  }, [highlightId, allies])

  const workspaceStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: hasSplit ? '25fr 75fr' : '1fr 0fr',
    gridTemplateRows: '1fr',
    transition: 'grid-template-columns 520ms cubic-bezier(.22,.68,0,1.15)',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  }

  return (
    <>
      {/* Topbar */}
      <header style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 40px',
        background: 'var(--cream)',
        borderBottom: '1px solid var(--honey-mute)',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div className="fa-topbar-breadcrumb">connect</div>
          <h1 className="fa-topbar-title">Find your ally</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a
            href="/sessions"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--moss)',
              border: '1.5px solid var(--honey-mute)',
              borderRadius: 'var(--r-pill)',
              padding: '6px 14px',
              textDecoration: 'none',
              letterSpacing: '0.01em',
              transition: 'border-color 150ms, color 150ms',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--moss)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--deep-pine)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--honey-mute)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--moss)' }}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 2V4M11 2V4M2 6.5H14M5 9.5L7 11.5L11 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            My Sessions
          </a>
          <a href="/profile" className="fa-user-chip" aria-label={`View profile for ${userName}`}>
            <span style={{ fontSize: 13, color: 'var(--moss)', opacity: 0.8 }}>{userName}</span>
            <div className="fa-avatar" aria-hidden="true">{userInitial}</div>
          </a>
        </div>
      </header>

      {/* Workspace */}
      <div style={workspaceStyle}>

        <FilterColumn
          selectedTopic={selectedTopic}
          selectedVibe={selectedVibe}
          isSplit={hasSplit}
          hasSelections={hasSelections}
          onTopicPick={handleTopicPick}
          onVibePick={handleVibePick}
          onClearAll={handleClearAll}
        />

        <ProfileColumn
          filteredAllies={filteredAllies}
          currentIdx={currentIdx}
          selectedTopic={selectedTopic}
          selectedVibe={selectedVibe}
          hasSelections={hasSelections}
          isSplit={hasSplit}
          isHighlighted={!!(highlightedId && filteredAllies[currentIdx]?.id === highlightedId)}
          onNavigate={handleNavigate}
          onBook={setBookingAlly}
        />

      </div>

      {/* Booking modal */}
      <ConnectModal
        ally={bookingAlly}
        onClose={() => setBookingAlly(null)}
      />
    </>
  )
}
