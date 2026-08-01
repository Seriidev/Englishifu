interface LevelProgressBarProps {
  current: number
  max: number
  label?: string
  color?: 'green' | 'purple' | 'blue'
  showValues?: boolean
}

const trackByColor = {
  blue: 'bg-brand-light',
  green: 'bg-emerald-100',
  purple: 'bg-violet-100',
} as const

const fillByColor = {
  blue: 'bg-brand',
  green: 'bg-emerald-500',
  purple: 'bg-violet-500',
} as const

export default function LevelProgressBar({
  current,
  max,
  label,
  color = 'blue',
  showValues = true,
}: LevelProgressBarProps) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.round((current / max) * 100))

  return (
    <div>
      {(label || showValues) && (
        <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
          {label ? (
            <span className="font-medium text-muted">{label}</span>
          ) : (
            <span />
          )}
          {showValues ? (
            <span className="font-semibold text-ink">
              {current}/{max}
            </span>
          ) : null}
        </div>
      )}
      <div
        className={`h-2 overflow-hidden rounded-full ${trackByColor[color]}`}
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${fillByColor[color]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
