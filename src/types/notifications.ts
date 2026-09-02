export type NotificationType =
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'tutor_approved'
  | 'new_review'
  | 'speaking_club_reminder'
  | 'booking_reminder'
  | 'xp_boost'

export interface AppNotification {
  id: number
  user_id: string
  type: NotificationType | string
  title: string
  message: string
  link_path: string | null
  is_read: boolean
  created_at: string
}

export interface TutorReview {
  id: number
  booking_id: number | null
  tutor_id: string
  student_id: string
  rating: number
  comment: string | null
  created_at: string
  student_name?: string
  student_avatar?: string | null
  student_handle?: string
}

export interface TutorReviewsResponse {
  reviews: TutorReview[]
  averageRating: number
  totalReviews: number
}
