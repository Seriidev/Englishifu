import type { TutorKpiChart, TutorKpiChartPoint } from '../types/tutorProfile'

function seededRand(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** ~31-day dual series for the KPI area chart (lessons + hours). */
export function generateTutorKpiChart(
  seed = 42,
  days = 31,
  empty = false,
): TutorKpiChart {
  const rand = seededRand(seed * 9973 + 11)
  const end = new Date()
  end.setHours(0, 0, 0, 0)
  const points: TutorKpiChartPoint[] = []

  let primary = empty ? 0 : 20 + rand() * 3
  let secondary = empty ? 0 : 14 + rand() * 2

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end)
    d.setDate(end.getDate() - i)

    if (!empty) {
      primary = Math.max(
        12,
        Math.min(26, primary + (rand() - 0.48) * 2.4),
      )
      secondary = Math.max(
        8,
        Math.min(20, secondary + (rand() - 0.5) * 1.8),
      )
    }

    points.push({
      date: toISODate(d),
      primary: empty ? 0 : Math.round(primary * 10) / 10,
      secondary: empty ? 0 : Math.round(secondary * 10) / 10,
    })
  }

  return {
    title: 'TEACHING ACTIVITY',
    primaryLabel: 'Lessons',
    secondaryLabel: 'Hours',
    points,
  }
}
