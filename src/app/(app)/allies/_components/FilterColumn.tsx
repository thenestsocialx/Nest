'use client'

import { TOPIC_FILTERS, VIBE_FILTERS } from '@/lib/findAllies'
import type { TopicId, VibeId } from '@/types/findAllies'
import TopicChip from './TopicChip'
import VibeTile from './VibeTile'

interface Props {
  selectedTopic: TopicId | null
  selectedVibe: VibeId | null
  availableTopicIds: Set<TopicId>
  availableVibeIds: Set<VibeId>
  isSplit: boolean
  hasSelections: boolean
  onTopicPick: (id: TopicId) => void
  onVibePick: (id: VibeId) => void
  onClearAll: () => void
}

export default function FilterColumn({
  selectedTopic,
  selectedVibe,
  availableTopicIds,
  availableVibeIds,
  isSplit,
  hasSelections,
  onTopicPick,
  onVibePick,
  onClearAll,
}: Props) {
  const visibleTopics = TOPIC_FILTERS.filter(t => availableTopicIds.has(t.id))
  const visibleVibes  = VIBE_FILTERS.filter(v => availableVibeIds.has(v.id))

  return (
    <div className="fa-filter-col">

      {/* Header */}
      <div className="fa-filter-header">
        <div className={`fa-filter-headline${isSplit ? ' fa-filter-headline--compact' : ''}`}>
          {isSplit ? 'Filters' : 'What are you navigating?'}
        </div>
        <button
          type="button"
          className={`fa-clear-btn${hasSelections ? ' is-visible' : ''}`}
          onClick={onClearAll}
        >
          Clear all
        </button>
      </div>

      {/* Topics */}
      {visibleTopics.length > 0 && (
        <div className="fa-section">
          <div className="fa-section-label">What&rsquo;s on your mind</div>
          <div className={`fa-chip-group${isSplit ? ' fa-chip-group--compact' : ''}`}>
            {visibleTopics.map(t => (
              <TopicChip
                key={t.id}
                topic={t}
                selected={selectedTopic === t.id}
                compact={isSplit}
                onClick={onTopicPick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Vibes */}
      {visibleVibes.length > 0 && (
        <div className="fa-section">
          <div className="fa-section-label">What kind of support helps</div>
          <div className={`fa-vibe-group${isSplit ? ' fa-vibe-group--compact' : ''}`}>
            {visibleVibes.map(v => (
              <VibeTile
                key={v.id}
                vibe={v}
                selected={selectedVibe === v.id}
                compact={isSplit}
                onClick={onVibePick}
              />
            ))}
          </div>
        </div>
      )}


      {/* Assessment nudge */}
      <div className={`fa-nudge${isSplit ? ' fa-nudge--compact' : ''}`}>
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none" className="fa-nudge-icon" aria-hidden="true">
          <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M9 6v3.5M9 12v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
        <div>
          <div className="fa-nudge-text">
            Not sure what you need? A quick assessment helps us find your most accurate match.
          </div>
          <a href="/assessment" className="fa-nudge-link">
            Take the assessment
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </a>
        </div>
      </div>

    </div>
  )
}
