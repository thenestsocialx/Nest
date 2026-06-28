'use client'

import type { NilaMode } from '@/actions/nila'

interface ModeSwitcherProps {
  mode: NilaMode
  disabled: boolean
  onChange: (mode: NilaMode) => void
  enabledModes: NilaMode[]
}

const ALL_MODES: { value: NilaMode; label: string; variant?: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'rant', label: 'Rant', variant: 'rant' },
  { value: 'figure_it_out', label: 'Figure It Out', variant: 'figureout' },
]

export default function ModeSwitcher({ mode, disabled, onChange, enabledModes }: ModeSwitcherProps) {
  const visibleModes = ALL_MODES.filter(({ value }) => enabledModes.includes(value))
  return (
    <div className="ns-mode-strip" role="group" aria-label="Conversation mode">
      {visibleModes.map(({ value, label, variant }) => (
        <button
          key={value}
          type="button"
          className={[
            'ns-mode-chip',
            variant ? `ns-mode-chip--${variant}` : '',
            mode === value ? 'is-active' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-pressed={mode === value}
          disabled={disabled}
          onClick={() => onChange(value)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
