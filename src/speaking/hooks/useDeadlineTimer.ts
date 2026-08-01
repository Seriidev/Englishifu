import { useCallback, useEffect, useRef, useState } from 'react'

export interface DeadlineTimerState {
  /** Milliseconds remaining until deadline */
  remainingMs: number
  /** 0–1 progress (1 = full time left, 0 = expired) */
  progress: number
  isExpired: boolean
  isUrgent: boolean
}

/**
 * Timer based on absolute deadline timestamp so it stays accurate
 * across tab throttling / background lag.
 */
export function useDeadlineTimer(
  deadlineTs: number | null,
  totalMs: number,
): DeadlineTimerState {
  const [now, setNow] = useState(() => Date.now())
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (deadlineTs === null) {
      setNow(Date.now())
      return
    }

    const tick = () => {
      setNow(Date.now())
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [deadlineTs])

  if (deadlineTs === null || totalMs <= 0) {
    return {
      remainingMs: totalMs,
      progress: 1,
      isExpired: false,
      isUrgent: false,
    }
  }

  const remainingMs = Math.max(0, deadlineTs - now)
  const progress = Math.min(1, Math.max(0, remainingMs / totalMs))
  const isExpired = remainingMs <= 0
  const isUrgent = remainingMs > 0 && remainingMs <= 3000

  return { remainingMs, progress, isExpired, isUrgent }
}

export function formatCountdown(ms: number): string {
  const totalSec = Math.ceil(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  if (m > 0) return `${m}:${s.toString().padStart(2, '0')}`
  return `${totalSec}`
}

export function createDeadline(seconds: number): number {
  return Date.now() + seconds * 1000
}

/** Imperative helper for one-shot expiry callback */
export function useOnDeadlineExpire(
  deadlineTs: number | null,
  onExpire: () => void,
): void {
  const calledRef = useRef(false)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    calledRef.current = false
  }, [deadlineTs])

  useEffect(() => {
    if (deadlineTs === null) return

    const check = () => {
      if (!calledRef.current && Date.now() >= deadlineTs) {
        calledRef.current = true
        onExpireRef.current()
      }
    }

    check()
    const id = window.setInterval(check, 100)
    return () => clearInterval(id)
  }, [deadlineTs])
}

export function useStableCallback<T extends (...args: never[]) => void>(fn: T): T {
  const ref = useRef(fn)
  ref.current = fn
  return useCallback(((...args: never[]) => ref.current(...args)) as T, [])
}
