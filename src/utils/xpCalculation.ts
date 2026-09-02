export const XP_REWARDS = {
  completeReadingPassage: 15,
  completeListeningItem: 15,
  completeSpeakingTask: 20,
  completeWritingTask: 20,
  completeFullTest: 100,
  platformEntryBonus: 30,
  dailyLoginBonus: 5,
  tutorDailyBoost: 30,
  tutorLessonBoost: 30,
} as const

export function calculateLevelFromXP(totalXP: number): {
  level: number
  currentXP: number
  xpToNext: number
} {
  let level = 1
  let remaining = Math.max(0, totalXP)

  while (remaining >= level * 150) {
    remaining -= level * 150
    level++
  }

  return {
    level,
    currentXP: remaining,
    xpToNext: level * 150,
  }
}

export function totalXpForLevelProgress(
  level: number,
  currentXP: number,
): number {
  let total = currentXP
  for (let i = 1; i < level; i++) {
    total += i * 150
  }
  return total
}
