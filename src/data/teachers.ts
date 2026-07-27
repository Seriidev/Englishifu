export type TeacherSpecialty = 'Reading' | 'Speaking' | 'Writing' | 'Listening'

export interface Teacher {
  id: number
  name: string
  title: string
  photo: string
  countryFlag: string
  specialization: string
  specialty: TeacherSpecialty
  experience: string
  lessonsCount: number
  isVerified: boolean
}

export const teachers: Teacher[] = [
  {
    id: 1,
    name: 'Michael Brown',
    title: 'IELTS, TOEFL Expert | Reading Coach',
    photo: 'https://i.pravatar.cc/300?img=12',
    countryFlag: '🇺🇸',
    specialization: 'TOEFL Expert',
    specialty: 'Reading',
    experience: '8+ years',
    lessonsCount: 180,
    isVerified: true,
  },
  {
    id: 2,
    name: 'Sophia Lee',
    title: 'IELTS Expert | Speaking Coach',
    photo: 'https://i.pravatar.cc/300?img=5',
    countryFlag: '🇰🇷',
    specialization: 'IELTS Expert',
    specialty: 'Speaking',
    experience: '6+ years',
    lessonsCount: 220,
    isVerified: true,
  },
  {
    id: 3,
    name: 'Emma Johnson',
    title: 'Speaking Coach | Fluency Expert',
    photo: 'https://i.pravatar.cc/300?img=9',
    countryFlag: '🇬🇧',
    specialization: 'Speaking Coach',
    specialty: 'Speaking',
    experience: '10+ years',
    lessonsCount: 310,
    isVerified: true,
  },
  {
    id: 4,
    name: 'Daniel Kim',
    title: 'TOEFL Expert | Writing Coach',
    photo: 'https://i.pravatar.cc/300?img=15',
    countryFlag: '🇨🇦',
    specialization: 'TOEFL Expert',
    specialty: 'Writing',
    experience: '5+ years',
    lessonsCount: 95,
    isVerified: false,
  },
]
