export interface AvailableSlot {
  startAt: string
  endAt: string
}

export interface TutorAvailabilityRow {
  id: number
  tutor_id: string
  day_of_week: number
  start_time: string
  end_time: string
  slot_duration_minutes: number
  timezone: string
  is_active: boolean
  created_at: string
}

export type BookingStatus =
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'pending_payment'

export interface BookingRow {
  id: number
  tutor_id: string
  student_id: string
  start_at: string
  end_at: string
  status: BookingStatus
  subject: string | null
  meeting_link: string | null
  created_at: string
  tutor_name?: string
  tutor_handle?: string
  student_name?: string
  student_handle?: string
  has_review?: boolean
  lesson_boosted?: boolean
}

export const BOOKING_SUBJECTS = [
  'TOEFL Speaking',
  'TOEFL Writing',
  'TOEFL Reading',
  'TOEFL Listening',
  'Business English',
  'General conversation',
  'Other',
] as const

export const WEEKDAY_LABELS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const
