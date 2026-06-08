'use client'

import type { VibeFilter, VibeId } from '@/types/findAllies'

interface Props {
  vibe: VibeFilter
  selected: boolean
  compact: boolean
  onClick: (id: VibeId) => void
}

export default function VibeTile({ vibe, selected, compact, onClick }: Props) {
  return (
    <button
      type="button"
      className={[
        'fa-vibe-tile',
        selected ? 'is-selected' : '',
        compact ? 'fa-vibe-tile--compact' : '',
      ].filter(Boolean).join(' ')}
      onClick={() => onClick(vibe.id)}
      aria-pressed={selected}
    >
      <svg
        width={compact ? 15 : 18}
        height={compact ? 15 : 18}
        viewBox="0 0 18 18"
        fill="none"
        className="fa-vibe-icon"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: vibe.iconInner }}
      />
      <div>
        <div className="fa-vibe-title">{vibe.title}</div>
        <div className="fa-vibe-sub">{vibe.sub}</div>
      </div>
    </button>
  )
}
