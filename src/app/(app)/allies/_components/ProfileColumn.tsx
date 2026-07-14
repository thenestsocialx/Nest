'use client'

import { getMatchQuality, getTopicLabel, getVibeTitle } from '@/lib/findAllies'
import type { AllyPublicProfile, TopicId, VibeId } from '@/types/findAllies'
import ProfileCard from './ProfileCard'
import EmptyState from './EmptyState'

interface Props {
  filteredAllies: AllyPublicProfile[]
  currentIdx: number
  selectedTopic: TopicId | null
  selectedVibe: VibeId | null
  hasSelections: boolean
  isSplit: boolean
  isHighlighted?: boolean
  bookingLoadingId?: string | null
  onNavigate: (dir: -1 | 1) => void
  onBook: (ally: AllyPublicProfile) => void
  onClose?: () => void
  isGuest?: boolean
}

export default function ProfileColumn({
  filteredAllies,
  currentIdx,
  selectedTopic,
  selectedVibe,
  hasSelections,
  isSplit,
  isHighlighted,
  bookingLoadingId,
  onNavigate,
  onBook,
  onClose,
  isGuest,
}: Props) {
  const safeIdx     = Math.min(currentIdx, Math.max(0, filteredAllies.length - 1))
  const currentAlly = filteredAllies[safeIdx] ?? null
  const total       = filteredAllies.length

  const titleText = !hasSelections
    ? 'Select a filter to begin'
    : selectedTopic
      ? `Allies for ${getTopicLabel(selectedTopic).toLowerCase()}`
      : 'All allies'

  const countText = hasSelections
    ? `${total} ${total === 1 ? 'ally' : 'allies'} found${selectedVibe ? ` · "${getVibeTitle(selectedVibe)}"` : ''}`
    : ''

  const prevDisabled = safeIdx === 0
  const nextDisabled = safeIdx >= total - 1 || total === 0

  return (
    <div className={`fa-profile-col${isSplit ? ' is-visible' : ''}`}>
      {/* Drag handle — visible only on mobile (CSS-controlled) */}
      <div className="fa-sheet-handle" aria-hidden="true" />

      <div className="fa-profile-area">

        {/* Results header */}
        <div className="fa-results-header">
          <div>
            <div className="fa-results-title">{titleText}</div>
            {countText && <div className="fa-results-count">{countText}</div>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Progress dots */}
            {total > 0 && (
              <div className="fa-progress-row" role="tablist" aria-label="Profile pages">
                {filteredAllies.map((_, i) => (
                  <div
                    key={i}
                    className={`fa-dot${i === safeIdx ? ' is-on' : ''}`}
                    role="tab"
                    aria-selected={i === safeIdx}
                    aria-label={`Profile ${i + 1}`}
                  />
                ))}
                <span className="fa-page-label">{safeIdx + 1} of {total}</span>
              </div>
            )}

            {/* Close button — visible only on mobile (CSS-controlled) */}
            {onClose && (
              <button type="button" className="fa-sheet-close" onClick={onClose} aria-label="Close">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Card area */}
        <div className="fa-card-wrapper">
          <button
            type="button"
            className={`fa-nav-btn${prevDisabled ? ' is-disabled' : ''}`}
            onClick={() => onNavigate(-1)}
            aria-label="Previous ally"
            disabled={prevDisabled}
          >
            <svg width="20" height="20" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M11 4l-5 5 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>

          <div className="fa-card-slot" style={isHighlighted ? { outline: '2.5px solid var(--deep-pine, #2F4C3A)', outlineOffset: '4px', borderRadius: '20px', transition: 'outline 300ms' } : undefined}>
            {!hasSelections ? null : total === 0 ? (
              <EmptyState />
            ) : currentAlly ? (
              <ProfileCard
                key={currentAlly.id}
                ally={currentAlly}
                quality={getMatchQuality(currentAlly, selectedTopic, selectedVibe)}
                showNext={total > 1}
                onNext={() => onNavigate(1)}
                onBook={onBook}
                isBookingLoading={bookingLoadingId === currentAlly.id}
                isGuest={isGuest}
              />
            ) : null}
          </div>

          <button
            type="button"
            className={`fa-nav-btn${nextDisabled ? ' is-disabled' : ''}`}
            onClick={() => onNavigate(1)}
            aria-label="Next ally"
            disabled={nextDisabled}
          >
            <svg width="20" height="20" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

      </div>
    </div>
  )
}
