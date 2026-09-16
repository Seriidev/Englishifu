import { useState } from 'react'
import {
  createDeadline,
  formatCountdown,
  useDeadlineTimer,
  useOnDeadlineExpire,
} from '../../speaking/hooks/useDeadlineTimer'

interface WritingCountdownProps {
  timeLimitMinutes: number
  onExpire: () => void
}

export default function WritingCountdown({
  timeLimitMinutes,
  onExpire,
}: WritingCountdownProps) {
  const totalSeconds = Math.max(1, timeLimitMinutes) * 60
  const [deadline] = useState(() => createDeadline(totalSeconds))
  const timer = useDeadlineTimer(deadline, totalSeconds * 1000)
  useOnDeadlineExpire(deadline, onExpire)
  const isUrgent = timer.remainingMs > 0 && timer.remainingMs <= 60_000

  return (
    <div
      className={`rounded-full px-3 py-1.5 text-sm font-bold tabular-nums ${
        isUrgent ? 'bg-red-50 text-red-600' : 'bg-brand-light text-brand'
      }`}
    >
      {formatCountdown(timer.remainingMs)}
    </div>
  )
}
