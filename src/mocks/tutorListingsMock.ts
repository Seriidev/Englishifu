import type {
  TutorAvailabilityStatus,
  TutorListingCard,
} from '../types/tutorListing'

const statuses: TutorAvailabilityStatus[] = ['online', 'busy', 'away', 'online']

const specialties = [
  ['TOEFL', 'Speaking', 'Academic English'],
  ['IELTS', 'Writing', 'Grammar'],
  ['Business English', 'Speaking'],
  ['TOEFL', 'Listening', 'Reading'],
  ['Conversation', 'Pronunciation'],
  ['Academic English', 'Writing'],
  ['IELTS', 'Speaking'],
  ['TOEFL', 'Writing', 'Grammar'],
]

const positions = [
  'TOEFL Specialist',
  'Business English Coach',
  'IELTS Expert',
  'Speaking Coach',
  'Academic Writing Tutor',
  'Conversation Partner',
  'Pronunciation Coach',
  'Exam Prep Mentor',
]

const names = [
  ['Sarah Chen', 'sarahchen'],
  ['Michael Brown', 'michaelbrown'],
  ['Sophia Lee', 'sophialee'],
  ['Elena Park', 'elenapark'],
  ['James Wilson', 'jameswilson'],
  ['Amina Hassan', 'aminahassan'],
  ['David Kim', 'davidkim'],
  ['Maria Santos', 'mariasantos'],
  ['Oliver Wright', 'oliverwright'],
  ['Yuki Tanaka', 'yukitanaka'],
  ['Noah Patel', 'noahpatel'],
  ['Emma Rossi', 'emmarossi'],
  ['Liam Okafor', 'liamokafor'],
  ['Isabella Cruz', 'isabellacruz'],
  ['Ethan Brooks', 'ethanbrooks'],
  ['Mia Nguyen', 'mianguyen'],
  ['Lucas Meier', 'lucasmeier'],
  ['Ava Johansson', 'avajohansson'],
  ['Benjamin Ali', 'benjaminali'],
  ['Chloe Dubois', 'chloedubois'],
  ['Henry Zhang', 'henryzhang'],
  ['Sofia Alvarez', 'sofiaalvarez'],
  ['Jack Thompson', 'jackthompson'],
  ['Layla Ibrahim', 'laylaibrahim'],
]

export const mockTutorListings: TutorListingCard[] = names.map(
  ([fullName, handle], i) => {
    const tags = specialties[i % specialties.length]
    const rating = Number((4.2 + (i % 8) * 0.1).toFixed(1))
    const langs =
      i % 4 === 0
        ? ['English', 'Russian']
        : i % 4 === 1
          ? ['English', 'Turkmen']
          : i % 4 === 2
            ? ['English', 'Spanish']
            : ['English']
    return {
      id: `tutor-${i + 1}`,
      handle,
      fullName,
      avatarUrl: `https://i.pravatar.cc/480?img=${(i % 70) + 1}`,
      isVerified: i % 3 !== 2,
      availabilityStatus: statuses[i % statuses.length],
      positionLabel: positions[i % positions.length],
      specialtyTags: tags,
      languages: langs,
      rating: Math.min(5, rating),
      reviewsCount: 12 + i * 7,
      pricePerHour: 20 + (i % 10) * 4,
    }
  },
)

export const TUTOR_SPECIALIZATIONS = [
  'Teacher',
  'Speaker',
  'Specialist',
  'TOEFL',
  'IELTS',
  'Business English',
  'Speaking',
  'Writing',
  'Academic English',
  'Conversation',
  'Pronunciation',
]

export const TUTOR_LANGUAGES = ['English', 'Russian', 'Turkmen', 'Spanish']

export const TUTOR_PRICE_PRESETS: { label: string; range?: [number, number] }[] =
  [
    { label: 'Any price' },
    { label: 'Under $25', range: [0, 24] },
    { label: '$25 – $40', range: [25, 40] },
    { label: '$40+', range: [40, 999] },
  ]
