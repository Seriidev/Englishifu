import type { TeachingActivityDay } from '../types/tutorProfile'

/** Light-theme greens (GitHub-style contribution levels) */
export function getActivityColor(lessonsCount: number): string {
  if (lessonsCount <= 0) return '#ebedf0'
  if (lessonsCount === 1) return '#c6e0ff'
  if (lessonsCount <= 3) return '#7eb6ff'
  if (lessonsCount <= 5) return '#4f7cff'
  return '#2f5fe0'
}

function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

/**
 * Pads / slices activity into complete weeks (Sun→Sat columns like GitHub),
 * returning an array of weeks, each with 7 days.
 */
export function groupByWeek(
  data: TeachingActivityDay[],
  weeksCount = 53,
): TeachingActivityDay[][] {
  const byDate = new Map(data.map((d) => [d.date, d.lessonsCount]))
  const today = startOfDay(new Date())

  // Align end to Saturday of current week (GitHub ends on today)
  const end = today
  const dayOfWeek = end.getDay() // 0 Sun … 6 Sat
  const start = new Date(end)
  start.setDate(end.getDate() - (weeksCount * 7 - 1) - dayOfWeek)

  // Snap start to Sunday
  const startDow = start.getDay()
  start.setDate(start.getDate() - startDow)

  const weeks: TeachingActivityDay[][] = []
  const cursor = new Date(start)

  while (cursor <= end || weeks.length < weeksCount) {
    const week: TeachingActivityDay[] = []
    for (let i = 0; i < 7; i++) {
      const iso = toISODate(cursor)
      week.push({
        date: iso,
        lessonsCount: byDate.get(iso) ?? 0,
      })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
    if (weeks.length >= weeksCount && cursor > end) break
    if (weeks.length > 60) break
  }

  return weeks.slice(-weeksCount)
}

export function totalLessons(data: TeachingActivityDay[]): number {
  return data.reduce((sum, d) => sum + d.lessonsCount, 0)
}

/** Realistic mock: more lessons on weekdays, sparse weekends */
export function generateTeachingActivity(
  days = 365,
  seed = 42,
): TeachingActivityDay[] {
  let s = seed
  const rand = () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }

  const result: TeachingActivityDay[] = []
  const today = startOfDay(new Date())

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dow = d.getDay()
    const weekend = dow === 0 || dow === 6
    const r = rand()

    let lessonsCount = 0
    if (weekend) {
      if (r > 0.78) lessonsCount = r > 0.95 ? 2 : 1
    } else if (r > 0.35) {
      if (r > 0.9) lessonsCount = 5 + Math.floor(rand() * 3)
      else if (r > 0.7) lessonsCount = 3 + Math.floor(rand() * 2)
      else if (r > 0.5) lessonsCount = 2
      else lessonsCount = 1
    }

    result.push({ date: toISODate(d), lessonsCount })
  }

  return result
}
