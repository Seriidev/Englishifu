import { formatCountdown } from '../hooks/useDeadlineTimer'

interface CountdownRingProps {
  progress: number
  remainingMs: number
  isUrgent: boolean
  size?: number
}

export default function CountdownRing({
  progress,
  remainingMs,
  isUrgent,
  size = 88,
}: CountdownRingProps) {
  const stroke = 6
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c * (1 - progress)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={isUrgent ? '#ef4444' : '#4f7cff'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-100 ease-linear"
        />
      </svg>
      <span
        className={`absolute text-xl font-bold tabular-nums ${
          isUrgent ? 'text-red-500' : 'text-ink'
        }`}
      >
        {formatCountdown(remainingMs)}
      </span>
    </div>
  )
}
