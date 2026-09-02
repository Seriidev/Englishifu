export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
export const TUTOR_POSITIONS = [
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
] as const

export type TutorPosition = (typeof TUTOR_POSITIONS)[number]
export type TutorStatus = 'incomplete' | 'pending' | 'approved'

export interface TutorCertification {
  id: string
  name: string
  imageUrl?: string
  uploadedAt?: string
}

export interface AppUserRow {
  id: string
  email: string
  password_hash?: string | null
  full_name: string
  handle: string
  role: 'student' | 'tutor'
  avatar_url?: string | null
  is_public_profile?: boolean | null
  created_at?: string | Date | null
  cefr_level?: string | null
  city?: string | null
  headline?: string | null
  summary?: string | null
  xp?: number | null
  daily_streak?: number | null
  last_activity_date?: string | Date | null
  placement_completed_at?: string | Date | null
  status?: string | null
  position?: string | null
  years_of_experience?: number | null
  about_me?: string | null
  hourly_rate_usd?: string | number | null
  certifications?: unknown
  updated_at?: string | Date | null
  resume_url?: string | null
  referral_code?: string | null
  marketing_opt_in?: boolean | null
  is_suspended?: boolean | null
  email_unsubscribed?: boolean | null
}

export type PublicUserDto =
  | {
      id: string
      fullName: string
      email: string
      role: 'student'
      handle: string
      createdAt: string
      avatarUrl?: string
      city?: string
      headline?: string
      summary?: string
      isPublicProfile: boolean
      cefrLevel?: CefrLevel
      placementCompletedAt?: string
      xp: number
    }
  | {
      id: string
      fullName: string
      email: string
      role: 'tutor'
      handle: string
      createdAt: string
      status: TutorStatus
      position: TutorPosition
      avatarUrl?: string
      isPublicProfile: boolean
      dailyStreak: number
      yearsOfExperience?: number
      hourlyRateUsd?: number
      certifications?: TutorCertification[]
      aboutMe?: string
    }

function toIso(value: string | Date | null | undefined): string | undefined {
  if (!value) return undefined
  if (value instanceof Date) return value.toISOString()
  return String(value)
}

function parseCertifications(raw: unknown): TutorCertification[] {
  if (!raw) return []
  let list: unknown = raw
  if (typeof raw === 'string') {
    try {
      list = JSON.parse(raw)
    } catch {
      return []
    }
  }
  if (!Array.isArray(list)) return []
  return list.map((item, index) => {
    const c = item as Record<string, unknown>
    return {
      id: typeof c.id === 'string' ? c.id : `cert-${index}`,
      name: typeof c.name === 'string' ? c.name : 'Certificate',
      imageUrl:
        typeof c.imageUrl === 'string'
          ? c.imageUrl
          : typeof c.image_url === 'string'
            ? c.image_url
            : undefined,
      uploadedAt:
        typeof c.uploadedAt === 'string'
          ? c.uploadedAt
          : typeof c.uploaded_at === 'string'
            ? c.uploaded_at
            : undefined,
    }
  })
}

const POSITIONS: readonly TutorPosition[] = TUTOR_POSITIONS
const STATUSES: TutorStatus[] = ['incomplete', 'pending', 'approved']

export function rowToPublicUser(row: AppUserRow): PublicUserDto {
  const createdAt = toIso(row.created_at) || new Date().toISOString()
  const base = {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    handle: row.handle,
    createdAt,
    avatarUrl: row.avatar_url || undefined,
    isPublicProfile: row.is_public_profile !== false,
  }

  if (row.role === 'tutor') {
    const position = POSITIONS.includes(row.position as TutorPosition)
      ? (row.position as TutorPosition)
      : 'Teacher'
    const status = STATUSES.includes(row.status as TutorStatus)
      ? (row.status as TutorStatus)
      : 'incomplete'
    const hourly =
      row.hourly_rate_usd != null && row.hourly_rate_usd !== ''
        ? Number(row.hourly_rate_usd)
        : undefined
    return {
      ...base,
      role: 'tutor' as const,
      status,
      position,
      dailyStreak: Number(row.daily_streak ?? 0) || 0,
      yearsOfExperience:
        row.years_of_experience != null
          ? Number(row.years_of_experience)
          : undefined,
      hourlyRateUsd: Number.isFinite(hourly) ? hourly : undefined,
      certifications: parseCertifications(row.certifications),
      aboutMe: row.about_me || undefined,
    }
  }

  return {
    ...base,
    role: 'student' as const,
    city: row.city || undefined,
    headline: row.headline || undefined,
    summary: row.summary || undefined,
    cefrLevel: (row.cefr_level as CefrLevel) || undefined,
    placementCompletedAt: toIso(row.placement_completed_at),
    xp: Number(row.xp ?? 0) || 0,
  }
}

export function isTutorProfileComplete(input: {
  yearsOfExperience?: number
  certifications?: TutorCertification[]
  aboutMe?: string
}): boolean {
  return (
    input.yearsOfExperience !== undefined &&
    input.yearsOfExperience >= 0 &&
    (input.certifications?.length ?? 0) >= 1 &&
    (input.aboutMe?.trim().length ?? 0) >= 50
  )
}
