import type {
  CurrentCourseProgress,
  StudentGamificationState,
} from '../types/gamification'

export const mockStudentGamification = (
  userId: string,
): StudentGamificationState => ({
  userId,
  level: 3,
  currentXP: 60,
  xpToNextLevel: 450,
  cefrLevel: 'B1',
  weeklyStreak: 3,
  weeklyXP: 120,
  weeklyXPGoal: 200,
  streakFreezesAvailable: 2,
  lastActivityDate: new Date().toISOString(),
  tokens: 68,
})

export const mockCurrentCourse: CurrentCourseProgress = {
  courseId: 'toefl-foundations',
  courseTitle: 'TOEFL Foundations',
  status: 'in-progress',
  difficultyTag: 'Fundamental',
  estimatedMinutes: 30,
  overallProgressPercent: 40,
  thumbnailUrl:
    'https://images.unsplash.com/photo-1434030214590-8f0fbd996616?w=400&q=80',
  sections: [
    {
      id: 'sec-reading',
      type: 'reading',
      title: 'Reading',
      status: 'completed',
    },
    {
      id: 'sec-listening',
      type: 'listening',
      title: 'Listening',
      status: 'completed',
    },
    {
      id: 'sec-speaking',
      type: 'speaking',
      title: 'Speaking',
      status: 'in-progress',
    },
    {
      id: 'sec-writing',
      type: 'writing',
      title: 'Writing',
      status: 'locked',
    },
    {
      id: 'sec-theory',
      type: 'theory',
      title: 'TOEFL Tips',
      status: 'locked',
    },
  ],
}
