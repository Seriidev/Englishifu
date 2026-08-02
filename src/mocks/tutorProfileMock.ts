import type { PublicTutor } from '../types/user'
import type {
  TutorClassesStats,
  TutorKPI,
  TutorPublicProfile,
} from '../types/tutorProfile'
import { findTutorByHandle } from '../utils/authStorage'
import { normalizeCertifications } from '../utils/certifications'
import { generateTeachingActivity } from '../utils/activityHeatmap'

const demoSpecializations: TutorPublicProfile['specializations'] = [
  {
    id: 'spec-1',
    title: 'TOEFL Speaking Prep',
    description:
      'Interview & Listen-and-Repeat drills with scoring feedback for the 2026 format.',
    skillTag: 'speaking',
    studentsEnrolled: 34,
    rating: 4.9,
  },
  {
    id: 'spec-2',
    title: 'Business English',
    description:
      'Meetings, emails, and presentations for professionals who need clear, confident English.',
    skillTag: 'grammar',
    studentsEnrolled: 12,
    rating: 4.7,
  },
  {
    id: 'spec-3',
    title: 'Academic Writing',
    description:
      'Structure essays, discussions, and email tasks with TOEFL-style scoring rubrics.',
    skillTag: 'writing',
    studentsEnrolled: 21,
    rating: 4.8,
  },
  {
    id: 'spec-4',
    title: 'Full TOEFL Simulation',
    description:
      'End-to-end practice across Reading, Listening, Speaking, and Writing.',
    skillTag: 'toefl-full',
    studentsEnrolled: 48,
    rating: 4.9,
  },
]

const demoClassesStats: TutorClassesStats = {
  totalStudents: 142,
  totalClasses: 89,
  speakingClubSessions: 34,
}

const demoKpis: TutorKPI[] = [
  {
    id: 'kpi-sat',
    label: 'Student Satisfaction',
    value: 96,
    unit: '%',
    trend: 'up',
  },
  {
    id: 'kpi-lessons',
    label: 'Lessons This Month',
    value: 24,
    trend: 'up',
  },
  {
    id: 'kpi-response',
    label: 'Response Time',
    value: 18,
    unit: ' min',
    trend: 'neutral',
  },
]

export const mockTutorProfile: TutorPublicProfile = {
  id: 'tutor-sarah-chen',
  handle: 'sarahchen',
  fullName: 'Sarah Chen',
  position: 'Teacher',
  avatarUrl: 'https://i.pravatar.cc/240?img=5',
  aboutMe:
    "I've been teaching English for over 5 years, specializing in TOEFL Speaking and Business English. My approach is practice-first: short drills, clear feedback, and real conversation. Students often say lessons feel like coaching, not lectures — and that's exactly the goal.",
  yearsOfExperience: 5,
  certifications: [
    { id: 'cert-tefl', name: 'TEFL' },
    { id: 'cert-celta', name: 'CELTA' },
    { id: 'cert-ielts', name: 'IELTS Examiner Certified' },
  ],
  isPublicProfile: true,
  dailyStreak: 12,
  studentsCount: 142,
  reviewsCount: 89,
  averageRating: 4.8,
  specializations: demoSpecializations,
  teachingActivity: generateTeachingActivity(365, 42),
  classesStats: demoClassesStats,
  kpis: demoKpis,
}

function emptyStatsForNewTutor(): {
  classesStats: TutorClassesStats
  kpis: TutorKPI[]
} {
  return {
    classesStats: {
      totalStudents: 0,
      totalClasses: 0,
      speakingClubSessions: 0,
    },
    kpis: [
      {
        id: 'kpi-sat',
        label: 'Student Satisfaction',
        value: '—',
        trend: 'neutral',
      },
      {
        id: 'kpi-lessons',
        label: 'Lessons This Month',
        value: 0,
        trend: 'neutral',
      },
      {
        id: 'kpi-response',
        label: 'Response Time',
        value: '—',
        trend: 'neutral',
      },
    ],
  }
}

function fromRegisteredTutor(tutor: PublicTutor): TutorPublicProfile {
  const metrics = emptyStatsForNewTutor()
  return {
    id: tutor.id,
    handle: tutor.handle,
    fullName: tutor.fullName,
    position: tutor.position ?? 'Teacher',
    avatarUrl:
      tutor.avatarUrl ??
      `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(tutor.handle)}`,
    aboutMe:
      tutor.aboutMe?.trim() ||
      'This tutor is still finishing their profile. Check back soon for a full bio, certifications, and teaching focus.',
    yearsOfExperience: tutor.yearsOfExperience ?? 0,
    certifications: normalizeCertifications(tutor.certifications),
    isPublicProfile: tutor.isPublicProfile ?? true,
    dailyStreak: tutor.dailyStreak ?? 0,
    studentsCount: 0,
    reviewsCount: 0,
    averageRating: 0,
    specializations: demoSpecializations.slice(0, 2),
    teachingActivity: generateTeachingActivity(365, tutor.id.length * 17),
    ...metrics,
  }
}

export function getTutorProfileByHandle(
  handle: string,
): TutorPublicProfile | null {
  const normalized = handle.replace(/^@/, '').toLowerCase()
  const registered = findTutorByHandle(normalized)
  if (registered?.role === 'tutor') {
    return fromRegisteredTutor(registered)
  }
  if (normalized === mockTutorProfile.handle) return mockTutorProfile
  return null
}
