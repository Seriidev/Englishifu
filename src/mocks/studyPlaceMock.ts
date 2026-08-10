import { BookOpen, Clock3, Target, GraduationCap } from 'lucide-react'
import type {
  BookingItem,
  ContinueSelfStudyData,
  StudyStatData,
} from '../types/studyPlace'

export const mockContinueSelfStudy: ContinueSelfStudyData = {
  courseName: 'TOEFL Foundations',
  unitLabel: 'Unit 8: Reading for Academic Success',
  progressPercent: 56,
  estimatedMinutes: 18,
}

/** Set to `null` to preview the empty self-study CTA. */
export const mockSelfStudyProgress: ContinueSelfStudyData | null =
  mockContinueSelfStudy

export const mockTutorAvatars = [
  'https://i.pravatar.cc/64?img=5',
  'https://i.pravatar.cc/64?img=12',
  'https://i.pravatar.cc/64?img=32',
  'https://i.pravatar.cc/64?img=47',
]

export const mockSpeakingAvatars = [
  'https://i.pravatar.cc/64?img=15',
  'https://i.pravatar.cc/64?img=20',
  'https://i.pravatar.cc/64?img=33',
]

export const mockUpcomingBookings: BookingItem[] = [
  {
    id: 'bk-1',
    date: 'TOMORROW',
    dateSubtext: 'Aug 7, Thu',
    time: '4:00 PM',
    type: 'tutor-lesson',
    title: '1:1 Lesson with Sarah Chen',
    subtitle: 'TOEFL Speaking',
    avatarUrl: 'https://i.pravatar.cc/64?img=5',
    meetingStatus: 'link-available',
    canJoin: true,
    daysUntil: 1,
  },
  {
    id: 'bk-2',
    date: 'FRIDAY',
    dateSubtext: 'Aug 8, Fri',
    time: '6:30 PM',
    type: 'speaking-club',
    title: 'Speaking Club: Business English',
    subtitle: 'Hosted by Mike Torres',
    avatarUrl: 'https://i.pravatar.cc/64?img=15',
    meetingStatus: 'spots-info',
    spotsInfo: '4 / 8 spots filled',
    canJoin: true,
    daysUntil: 2,
  },
  {
    id: 'bk-3',
    date: 'MONDAY',
    dateSubtext: 'Aug 11, Mon',
    time: '2:00 PM',
    type: 'tutor-lesson',
    title: '1:1 Lesson with Elena Park',
    subtitle: 'Reading Strategies',
    avatarUrl: 'https://i.pravatar.cc/64?img=32',
    meetingStatus: 'upcoming',
    canJoin: false,
    daysUntil: 5,
  },
]

export const mockStudyStats: StudyStatData[] = [
  {
    id: 'words',
    icon: BookOpen,
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    label: 'Words Learned',
    value: '1,240',
    trend: '↑ 24 this week',
    trendPositive: true,
    sparkline: [42, 48, 45, 55, 62, 58, 70, 76, 72, 88],
  },
  {
    id: 'lessons',
    icon: GraduationCap,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    label: 'Lessons Completed',
    value: 48,
    trend: '↑ 3 this week',
    trendPositive: true,
    sparkline: [10, 12, 11, 14, 16, 15, 18, 20, 19, 22],
  },
  {
    id: 'speaking',
    icon: Clock3,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    label: 'Speaking Hours',
    value: '12.5',
    trend: '↑ 1.5 this week',
    trendPositive: true,
    sparkline: [2, 3, 2.5, 4, 5, 4.5, 6, 7, 6.5, 8],
  },
  {
    id: 'accuracy',
    icon: Target,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    label: 'Accuracy',
    value: '86%',
    trend: '↑ 2% this week',
    trendPositive: true,
    sparkline: [72, 74, 73, 78, 80, 79, 82, 84, 83, 86],
  },
]

export const mockStudyHeaderStats = {
  xp: 520,
  streakDays: 12,
  level: 8,
  hasNotifications: true,
}
