import type { PublicTutor } from '../types/user'
import type { TutorPublicProfile } from '../types/tutorProfile'
import { findTutorByHandle } from '../utils/authStorage'
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

export const mockTutorProfile: TutorPublicProfile = {
  id: 'tutor-sarah-chen',
  handle: 'sarahchen',
  firstName: 'Sarah',
  lastName: 'Chen',
  avatarUrl: 'https://i.pravatar.cc/240?img=5',
  aboutMe:
    "I've been teaching English for over 5 years, specializing in TOEFL Speaking and Business English. My approach is practice-first: short drills, clear feedback, and real conversation. Students often say lessons feel like coaching, not lectures — and that's exactly the goal.",
  yearsOfExperience: 5,
  certifications: ['TEFL', 'CELTA', 'TOEFL iBT Trainer'],
  studentsCount: 142,
  reviewsCount: 89,
  averageRating: 4.8,
  specializations: demoSpecializations,
  teachingActivity: generateTeachingActivity(365, 42),
}

function fromRegisteredTutor(tutor: PublicTutor): TutorPublicProfile {
  return {
    id: tutor.id,
    handle: tutor.handle,
    firstName: tutor.firstName,
    lastName: tutor.lastName,
    avatarUrl: `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(tutor.handle)}`,
    aboutMe:
      tutor.aboutMe?.trim() ||
      'This tutor is still finishing their profile. Check back soon for a full bio, certifications, and teaching focus.',
    yearsOfExperience: tutor.yearsOfExperience ?? 0,
    certifications: tutor.certifications ?? [],
    studentsCount: 0,
    reviewsCount: 0,
    averageRating: 0,
    specializations: demoSpecializations.slice(0, 2),
    teachingActivity: generateTeachingActivity(365, tutor.id.length * 17),
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
