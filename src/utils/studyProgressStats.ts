import { BookOpen, Clock3, GraduationCap, Target } from 'lucide-react'
import type { BookingRow } from '../types/booking'
import type { StudyStatData } from '../types/studyPlace'
import { vocabLearnedStats } from './vocabStorage'

const ACCURACY_KEY = 'englishcore_accuracy_log_v1'

interface AccuracyAttempt {
  userId: string
  correct: number
  total: number
  at: string
}

function weekStartMs() {
  return Date.now() - 7 * 24 * 60 * 60 * 1000
}

function readAttempts(): AccuracyAttempt[] {
  try {
    const raw = localStorage.getItem(ACCURACY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is AccuracyAttempt => {
      if (!item || typeof item !== 'object') return false
      const row = item as AccuracyAttempt
      return (
        typeof row.userId === 'string' &&
        typeof row.correct === 'number' &&
        typeof row.total === 'number' &&
        typeof row.at === 'string'
      )
    })
  } catch {
    return []
  }
}

export function recordAccuracyAttempt(
  userId: string | null,
  correct: number,
  total: number,
) {
  if (!userId || total <= 0) return
  const next = [
    ...readAttempts(),
    {
      userId,
      correct: Math.max(0, correct),
      total,
      at: new Date().toISOString(),
    },
  ].slice(-200)
  try {
    localStorage.setItem(ACCURACY_KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
}

function percent(correct: number, total: number) {
  if (total <= 0) return 0
  return Math.round((correct / total) * 100)
}

function accuracyStats(userId: string | null, since: number) {
  const mine = readAttempts().filter((row) => row.userId === (userId ?? ''))
  const allCorrect = mine.reduce((sum, row) => sum + row.correct, 0)
  const allTotal = mine.reduce((sum, row) => sum + row.total, 0)
  const recent = mine.filter((row) => new Date(row.at).getTime() >= since)
  const older = mine.filter((row) => new Date(row.at).getTime() < since)
  const recentPct = percent(
    recent.reduce((sum, row) => sum + row.correct, 0),
    recent.reduce((sum, row) => sum + row.total, 0),
  )
  const olderPct = percent(
    older.reduce((sum, row) => sum + row.correct, 0),
    older.reduce((sum, row) => sum + row.total, 0),
  )
  const delta =
    recent.length === 0 ? 0 : older.length === 0 ? recentPct : recentPct - olderPct
  return { percent: allTotal === 0 ? 0 : percent(allCorrect, allTotal), delta }
}

function isSpeakingLesson(subject: string | null) {
  const value = (subject ?? '').toLowerCase()
  return value.includes('speaking') || value.includes('conversation')
}

function hoursBetween(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime()
  if (!Number.isFinite(ms) || ms <= 0) return 0
  return ms / 3_600_000
}

function formatHours(hours: number) {
  const rounded = Math.round(hours * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

function weekLabel(delta: number, unit = '') {
  const rounded = Math.round(delta * 10) / 10
  const shown = Number.isInteger(rounded) ? String(Math.abs(rounded)) : Math.abs(rounded).toFixed(1)
  if (rounded > 0) return { text: `↑ ${shown}${unit} this week`, positive: true }
  if (rounded < 0) return { text: `↓ ${shown}${unit} this week`, positive: false }
  return { text: `0${unit} this week`, positive: true }
}

export function buildStudyStats(input: {
  userId: string | null
  bookings: BookingRow[]
}): StudyStatData[] {
  const since = weekStartMs()
  const words = vocabLearnedStats(input.userId, since)
  const completed = input.bookings.filter((row) => row.status === 'completed')
  const lessonsWeek = completed.filter(
    (row) => new Date(row.end_at).getTime() >= since,
  ).length
  const speaking = completed.filter((row) => isSpeakingLesson(row.subject))
  const speakingHours = speaking.reduce(
    (sum, row) => sum + hoursBetween(row.start_at, row.end_at),
    0,
  )
  const speakingWeek = speaking
    .filter((row) => new Date(row.end_at).getTime() >= since)
    .reduce((sum, row) => sum + hoursBetween(row.start_at, row.end_at), 0)
  const accuracy = accuracyStats(input.userId, since)
  const wordsTrend = weekLabel(words.thisWeek)
  const lessonsTrend = weekLabel(lessonsWeek)
  const speakingTrend = weekLabel(speakingWeek)
  const accuracyTrend = weekLabel(accuracy.delta, '%')

  return [
    {
      id: 'words',
      icon: BookOpen,
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
      label: 'Words learned',
      value: words.total.toLocaleString(),
      trend: wordsTrend.text,
      trendPositive: wordsTrend.positive,
      sparkline: [],
    },
    {
      id: 'lessons',
      icon: GraduationCap,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      label: 'Lessons Completed',
      value: completed.length,
      trend: lessonsTrend.text,
      trendPositive: lessonsTrend.positive,
      sparkline: [],
    },
    {
      id: 'speaking',
      icon: Clock3,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      label: 'Speaking Hours',
      value: formatHours(speakingHours),
      trend: speakingTrend.text,
      trendPositive: speakingTrend.positive,
      sparkline: [],
    },
    {
      id: 'accuracy',
      icon: Target,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      label: 'Accuracy',
      value: `${accuracy.percent}%`,
      trend: accuracyTrend.text,
      trendPositive: accuracyTrend.positive,
      sparkline: [],
    },
  ]
}
