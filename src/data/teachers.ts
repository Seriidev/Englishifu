export type TeacherSpecialty = 'Reading' | 'Speaking' | 'Writing' | 'Listening'

export interface Teacher {
  id: number
  name: string
  handle: string
  title: string
  photo: string
  countryFlag: string
  specialization: string
  specialty: TeacherSpecialty
  /** Short bio shown on carousel card */
  bio: string
  /** Pill badge, e.g. "180+ lessons" */
  badge: string
  experience: string
  lessonsCount: number
  isVerified: boolean
}

export const teachers: Teacher[] = [
  {
    id: 1,
    name: 'Michael Brown',
    handle: 'michaelbrown',
    title: 'IELTS, TOEFL Expert | Reading Coach',
    photo: 'https://i.pravatar.cc/600?img=12',
    countryFlag: '🇺🇸',
    specialization: 'TOEFL Expert',
    specialty: 'Reading',
    bio: 'TOEFL Reading coach with a practice-first method and clear score strategies.',
    badge: '180+ lessons',
    experience: '8+ years',
    lessonsCount: 180,
    isVerified: true,
  },
  {
    id: 2,
    name: 'Sophia Lee',
    handle: 'sophialee',
    title: 'IELTS Expert | Speaking Coach',
    photo: 'https://i.pravatar.cc/600?img=5',
    countryFlag: '🇰🇷',
    specialization: 'IELTS Expert',
    specialty: 'Speaking',
    bio: 'Speaking coach helping students sound natural, confident, and exam-ready.',
    badge: '220+ lessons',
    experience: '6+ years',
    lessonsCount: 220,
    isVerified: true,
  },
  {
    id: 3,
    name: 'Emma Johnson',
    handle: 'emmajohnson',
    title: 'Speaking Coach | Fluency Expert',
    photo: 'https://i.pravatar.cc/600?img=9',
    countryFlag: '🇬🇧',
    specialization: 'Speaking Coach',
    specialty: 'Speaking',
    bio: 'Fluency trainer for Speaking Club and TOEFL Interview-style practice.',
    badge: '310+ lessons',
    experience: '10+ years',
    lessonsCount: 310,
    isVerified: true,
  },
  {
    id: 4,
    name: 'Daniel Kim',
    handle: 'danielkim',
    title: 'TOEFL Expert | Writing Coach',
    photo: 'https://i.pravatar.cc/600?img=15',
    countryFlag: '🇨🇦',
    specialization: 'TOEFL Expert',
    specialty: 'Writing',
    bio: 'Academic Writing mentor for emails, essays, and discussion tasks.',
    badge: '95+ lessons',
    experience: '5+ years',
    lessonsCount: 95,
    isVerified: false,
  },
]
