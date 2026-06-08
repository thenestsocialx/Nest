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
}

export default function FindAlliesShell({ allies, userName, userInitial }: Props) {
  const [selectedTopic, setSelectedTopic] = useState<TopicId | null>(null)
  const [selectedVibe,  setSelectedVibe]  = useState<VibeId  | null>(null)
  const [currentIdx,    setCurrentIdx]    = useState(0)
  const [hasSplit,      setHasSplit]      = useState(false)
  const [connectAlly,   setConnectAlly]   = useState<AllyPublicProfile | null>(null)

  // Derived filtered list
  const filteredAllies = useMemo(
    () => filterAllies(allies, selectedTopic, selectedVibe),
    [allies, selectedTopic, selectedVibe],
  )

  const hasSelections = !!(selectedTopic || selectedVibe)

  // Trigger split once on first selection (one-way latch)
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

  // Keyboard navigation (Arrow keys)
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

  // ── Animated split style ─────────────────────────────────────
  // gridTemplateRows: '1fr' forces the single row to fill all available height
  // minHeight: 0 allows the flex item to shrink below content size
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
        <div className="fa-user-chip">
          <span style={{ fontSize: 13, color: 'var(--moss)', opacity: 0.8 }}>{userName}</span>
          <div className="fa-avatar" aria-hidden="true">{userInitial}</div>
        </div>
      </header>

      {/* Workspace */}
      <div style={workspaceStyle}>

        {/* Filter column */}
        <FilterColumn
          selectedTopic={selectedTopic}
          selectedVibe={selectedVibe}
          isSplit={hasSplit}
          hasSelections={hasSelections}
          onTopicPick={handleTopicPick}
          onVibePick={handleVibePick}
          onClearAll={handleClearAll}
        />

        {/* Profile column — always mounted, opacity/pointer-events controlled by isSplit */}
        <ProfileColumn
          filteredAllies={filteredAllies}
          currentIdx={currentIdx}
          selectedTopic={selectedTopic}
          selectedVibe={selectedVibe}
          hasSelections={hasSelections}
          isSplit={hasSplit}
          onNavigate={handleNavigate}
          onConnect={setConnectAlly}
        />

      </div>

      {/* Connect modal */}
      <ConnectModal
        ally={connectAlly}
        onClose={() => setConnectAlly(null)}
      />
    </>
  )
}
