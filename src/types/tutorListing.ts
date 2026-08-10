export type TutorAvailabilityStatus = 'online' | 'busy' | 'away'

export interface TutorListingCard {
  id: string
  handle: string
  fullName: string
  avatarUrl?: string
  isVerified: boolean
  availabilityStatus: TutorAvailabilityStatus
  positionLabel: string
  specialtyTags: string[]
  languages: string[]
  rating: number
  reviewsCount: number
  pricePerHour: number
}

export type TutorSortBy =
  | 'recommended'
  | 'price-low'
  | 'price-high'
  | 'rating'
  | 'availability'

export interface TutorFilters {
  specialization?: string
  priceRange?: [number, number]
  minRating?: number
  availability?: 'online' | 'any'
  language?: string
  sortBy: TutorSortBy
}

export type TutorViewMode = 'grid' | 'list'
