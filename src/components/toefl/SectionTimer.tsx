import { useEffect, useState } from 'react'
import { createDeadline, useDeadlineTimer, formatCountdown } from '../../speaking/hooks/useDeadlineTimer'

interface SectionTimerProps {
  totalSeconds: number
  running: boolean
  onExpire?: () => void
}

export default function SectionTimer({ totalSeconds, running, onExpire }: SectionTimerProps) {
  const [deadline, setDeadline] = useState<number | null>(null)

  useEffect(() => {
    if (!running) {
      setDeadline(null)
      return
    }
    setDeadline(createDeadline(totalSeconds))
  }, [running, totalSeconds])

  const timer = useDeadlineTimer(deadline, totalSeconds * 1000)

  useEffect(() => {
    if (running && timer.isExpired) onExpire?.()
  }, [running, timer.isExpired, onExpire])

  const label =
    deadline === null
      ? formatCountdown(totalSeconds * 1000)
      : formatCountdown(timer.remainingMs)

  return (
    <div
      className={`rounded-full px-3 py-1.5 text-sm font-bold tabular-nums ${
        timer.isUrgent ? 'bg-red-50 text-red-600' : 'bg-brand-light text-brand'
      }`}
    >
      {label}
    </div>
  )
}
