import type { StudentGamificationState } from '../types/gamification'

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function updateStreakOnActivity(
  state: StudentGamificationState,
  now = new Date(),
): StudentGamificationState {
  const today = startOfDay(now)
  const lastActivity = startOfDay(new Date(state.lastActivityDate))
  const daysSinceLastActivity = Math.floor(
    (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
  )

  if (daysSinceLastActivity === 0) {
    return state
  }

  if (daysSinceLastActivity === 1) {
    return {
      ...state,
      lastActivityDate: now.toISOString(),
      weeklyStreak: state.weeklyStreak + 1,
    }
  }

  if (daysSinceLastActivity > 1 && state.streakFreezesAvailable > 0) {
    return {
      ...state,
      lastActivityDate: now.toISOString(),
      streakFreezesAvailable: state.streakFreezesAvailable - 1,
    }
  }

  return {
    ...state,
    weeklyStreak: 1,
    lastActivityDate: now.toISOString(),
  }
}
