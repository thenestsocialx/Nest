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

  const availableTopicIds = useMemo(
    () => new Set(allies.flatMap(a => a.specialties)) as Set<TopicId>,
    [allies],
  )

  const availableVibeIds = useMemo(
    () => new Set(allies.flatMap(a => a.user_vibes)) as Set<VibeId>,
    [allies],
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

  return (
    <>
      {/* Topbar */}
      <header className="fa-topbar">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div className="fa-topbar-breadcrumb">connect</div>
          <h1 className="fa-topbar-title">Find your ally</h1>
        </div>
        <div className="fa-topbar-right">
          <a href="/sessions" className="fa-sessions-link">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 2V4M11 2V4M2 6.5H14M5 9.5L7 11.5L11 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="fa-sessions-label">My Sessions</span>
          </a>
          <a href="/profile" className="fa-user-chip" aria-label={`View profile for ${userName}`}>
            <span className="fa-user-name">{userName}</span>
            <div className="fa-avatar" aria-hidden="true">{userInitial}</div>
          </a>
        </div>
      </header>

      {/* Mobile dimmer — sits behind the profile sheet, closes it on tap */}
      {hasSplit && <div className="fa-mobile-dimmer" onClick={() => setHasSplit(false)} />}

      {/* Workspace */}
      <div className={`fa-workspace${hasSplit ? ' fa-workspace--split' : ''}`}>

        <FilterColumn
          selectedTopic={selectedTopic}
          selectedVibe={selectedVibe}
          availableTopicIds={availableTopicIds}
          availableVibeIds={availableVibeIds}
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
          onClose={() => setHasSplit(false)}
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
