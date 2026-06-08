'use client'

import type { TopicFilter, TopicId } from '@/types/findAllies'

interface Props {
  topic: TopicFilter
  selected: boolean
  compact: boolean
  onClick: (id: TopicId) => void
}

export default function TopicChip({ topic, selected, compact, onClick }: Props) {
  return (
    <button
      type="button"
      className={[
        'fa-chip-btn',
        selected ? 'is-selected' : '',
        compact ? 'fa-chip-btn--compact' : '',
      ].filter(Boolean).join(' ')}
      onClick={() => onClick(topic.id)}
      aria-pressed={selected}
    >
      <svg
        width={compact ? 13 : 14}
        height={compact ? 13 : 14}
        viewBox="0 0 18 18"
        fill="none"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: topic.iconInner }}
      />
      {topic.label}
    </button>
  )
}
