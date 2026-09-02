async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string }
    if (data?.error) return data.error
  } catch {
    /* ignore */
  }
  if (res.status === 431) {
    return 'Request failed (431). Clear this site’s cookies and sign in again — the old session token was too large.'
  }
  return `Request failed (${res.status})`
}

async function adminFetch(path: string, init?: RequestInit) {
  const res = await fetch(path, {
    credentials: 'include',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<Record<string, unknown>>
}

export interface AdminBanner {
  id: number
  title: string
  subtitle?: string | null
  image_url?: string | null
  cta_label?: string | null
  cta_link?: string | null
  background_color?: string | null
  is_active: boolean
  display_order: number
  starts_at?: string | null
  ends_at?: string | null
}

export interface AdminNewsPost {
  id: number
  title: string
  body: string
  cover_image_url?: string | null
  is_published: boolean
  published_at?: string | null
  created_at?: string
}

export interface AdminStudentRow {
  id: string
  full_name: string
  email: string
  handle: string
  cefr_level?: string | null
  xp: number
  daily_streak: number
  is_suspended?: boolean
  marketing_opt_in?: boolean
  best_toefl_score?: number | string | null
  created_at?: string
}

export interface AdminTutorDirRow {
  id: string
  handle: string
  full_name: string
  email: string
  avatar_url?: string | null
  city?: string | null
  status: string
  is_suspended?: boolean
  price_per_hour?: number | string | null
  resume_url?: string | null
  average_rating?: number | string
  reviews_count?: number
}

export async function fetchAdminOverview() {
  return adminFetch('/api/admin/overview') as Promise<{
    students: number
    tutors: number
    pendingApplications: number
    bookingsThisWeek: number
    newConsultationRequests: number
    pendingReferrals: number
    revenue: number | null
  }>
}

export async function fetchAdminBanners(): Promise<AdminBanner[]> {
  const data = await adminFetch('/api/admin/banners')
  return (data.banners as AdminBanner[]) || []
}

export async function saveAdminBanner(
  input: Partial<AdminBanner> & { image_url?: string | null },
  id?: number,
): Promise<AdminBanner> {
  const payload = {
    title: input.title || 'Poster',
    subtitle: input.subtitle,
    imageUrl: input.image_url,
    ctaLabel: input.cta_label,
    ctaLink: input.cta_link,
    backgroundColor: input.background_color,
    isActive: input.is_active,
    displayOrder: input.display_order,
    startsAt: input.starts_at,
    endsAt: input.ends_at,
  }
  if (id) {
    const data = await adminFetch(`/api/admin/banners/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
    return data.banner as AdminBanner
  }
  const data = await adminFetch('/api/admin/banners', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return data.banner as AdminBanner
}

export async function deleteAdminBanner(id: number) {
  await adminFetch(`/api/admin/banners/${id}`, { method: 'DELETE' })
}

export async function reorderAdminBanners(order: number[]) {
  await adminFetch('/api/admin/banners', {
    method: 'POST',
    body: JSON.stringify({ order }),
  })
}

export async function fetchAdminReferrals(status = 'all') {
  return adminFetch(
    `/api/admin/referrals?status=${encodeURIComponent(status)}`,
  ) as Promise<{
    referrals: Array<Record<string, unknown>>
    stats: { total: number; converted: number; pending: number }
  }>
}

export async function fetchAdminTutorsDirectory(params: {
  q?: string
  city?: string
  minRating?: number
  minPrice?: number
  maxPrice?: number
  sort?: string
}): Promise<AdminTutorDirRow[]> {
  const qs = new URLSearchParams()
  if (params.q) qs.set('q', params.q)
  if (params.city) qs.set('city', params.city)
  if (params.minRating) qs.set('minRating', String(params.minRating))
  if (params.minPrice != null) qs.set('minPrice', String(params.minPrice))
  if (params.maxPrice != null) qs.set('maxPrice', String(params.maxPrice))
  if (params.sort) qs.set('sort', params.sort)
  const data = await adminFetch(`/api/admin/tutors?${qs.toString()}`)
  return (data.tutors as AdminTutorDirRow[]) || []
}

export async function patchAdminTutor(
  id: string,
  input: { status?: string; isSuspended?: boolean; city?: string },
) {
  await adminFetch(`/api/admin/tutors/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export async function fetchAdminStudents(params: {
  q?: string
  sort?: string
}): Promise<AdminStudentRow[]> {
  const qs = new URLSearchParams()
  if (params.q) qs.set('q', params.q)
  if (params.sort) qs.set('sort', params.sort)
  const data = await adminFetch(`/api/admin/students?${qs.toString()}`)
  return (data.students as AdminStudentRow[]) || []
}

export async function suspendAdminUser(id: string, isSuspended: boolean) {
  await adminFetch(`/api/admin/users/${encodeURIComponent(id)}/suspend`, {
    method: 'PATCH',
    body: JSON.stringify({ isSuspended }),
  })
}

export async function fetchAdminNews(): Promise<AdminNewsPost[]> {
  const data = await adminFetch('/api/admin/news')
  return (data.posts as AdminNewsPost[]) || []
}

export async function saveAdminNews(
  input: Partial<AdminNewsPost> & { title: string; body: string },
  id?: number,
): Promise<AdminNewsPost> {
  const payload = {
    title: input.title,
    body: input.body,
    coverImageUrl: input.cover_image_url,
    isPublished: input.is_published,
  }
  if (id) {
    const data = await adminFetch(`/api/admin/news/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
    return data.post as AdminNewsPost
  }
  const data = await adminFetch('/api/admin/news', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return data.post as AdminNewsPost
}

export async function deleteAdminNews(id: number) {
  await adminFetch(`/api/admin/news/${id}`, { method: 'DELETE' })
}

export interface AdminLibraryBook {
  id: number
  title: string
  author: string
  category: string
  level: string
  rating: number | string
  minutes: number
  description: string
  cover_image_url?: string | null
  cover_headline?: string | null
  pdf_url?: string | null
  pdf_file_name?: string | null
  is_published: boolean
  display_order: number
}

export async function fetchAdminLibraryBooks(): Promise<AdminLibraryBook[]> {
  const data = await adminFetch('/api/admin/library')
  return (data.books as AdminLibraryBook[]) || []
}

export async function saveAdminLibraryBook(
  input: {
    title: string
    author: string
    category: string
    level: string
    rating: number
    minutes?: number
    description?: string
    coverImageUrl?: string | null
    coverHeadline?: string | null
    pdfUrl?: string | null
    pdfFileName?: string | null
    isPublished?: boolean
  },
  id?: number,
): Promise<AdminLibraryBook> {
  const payload = {
    title: input.title,
    author: input.author,
    category: input.category,
    level: input.level,
    rating: input.rating,
    minutes: input.minutes,
    description: input.description ?? '',
    coverImageUrl: input.coverImageUrl,
    coverHeadline: input.coverHeadline,
    pdfUrl: input.pdfUrl,
    pdfFileName: input.pdfFileName,
    isPublished: input.isPublished !== false,
  }
  if (id) {
    const data = await adminFetch(`/api/admin/library/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
    return data.book as AdminLibraryBook
  }
  const data = await adminFetch('/api/admin/library', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return data.book as AdminLibraryBook
}

export async function deleteAdminLibraryBook(id: number) {
  await adminFetch(`/api/admin/library/${id}`, { method: 'DELETE' })
}

export interface AdminSentMessage {
  id: number
  title: string
  message: string
  link_path?: string | null
  sent_at: string
  recipient_count: number
  student_count: number
  tutor_count: number
  recipient_name?: string | null
  recipient_handle?: string | null
  recipient_email?: string | null
  recipient_role?: string | null
  recipient_id?: string | null
}

export async function sendAdminMessage(input: {
  userIds?: string[]
  userId?: string
  audience?: 'selected' | 'all_students' | 'all_tutors' | 'by_user'
  title: string
  message: string
  linkPath?: string
  alsoSendEmail?: boolean
}) {
  return adminFetch('/api/admin/send-message', {
    method: 'POST',
    body: JSON.stringify(input),
  }) as Promise<{ sent: number; emailed: number; emailSkipped: number }>
}

export async function fetchAdminSentMessages(): Promise<AdminSentMessage[]> {
  const data = await adminFetch('/api/admin/send-message')
  return (data.messages as AdminSentMessage[]) || []
}

export async function fetchAdminSpeakingClub() {
  const data = await adminFetch('/api/admin/speaking-club')
  return (data.sessions as Array<Record<string, unknown>>) || []
}

export async function fetchAdminConsultations() {
  const data = await adminFetch('/api/admin/consultation-requests')
  return (data.requests as Array<Record<string, unknown>>) || []
}

export async function patchConsultationStatus(id: number, status: string) {
  await adminFetch('/api/admin/consultation-requests', {
    method: 'PATCH',
    body: JSON.stringify({ id, status }),
  })
}

export async function fetchPublicBanners(): Promise<AdminBanner[]> {
  const res = await fetch('/api/banners')
  if (!res.ok) return []
  const data = (await res.json()) as { banners?: AdminBanner[] }
  return data.banners || []
}

export async function fetchPublicNews(): Promise<AdminNewsPost[]> {
  const res = await fetch('/api/news')
  if (!res.ok) return []
  const data = (await res.json()) as { posts?: AdminNewsPost[] }
  return data.posts || []
}

export async function fetchMyReferral() {
  const res = await fetch('/api/referrals/me', { credentials: 'include' })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<{
    referralCode: string
    invited: number
    converted: number
    creditsEarned: number
  }>
}

export async function submitConsultation(input: {
  fullName: string
  email: string
  phone: string
  toeflScore?: string
  learningGoal: string
  message?: string
}) {
  const res = await fetch('/api/consultation-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(await parseError(res))
}

export async function saveTestResult(input: {
  testType: string
  overallBandScore: number
  sectionScores: unknown
  completedAt: string
}) {
  const res = await fetch('/api/test-results', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  })
  if (!res.ok) return
}

export async function uploadTutorResume(file: File) {
  if (file.type !== 'application/pdf') {
    throw new Error('Please upload a PDF')
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File must be under 5MB')
  }
  const resumeUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('Could not read file'))
    }
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
  const res = await fetch('/api/tutors/resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ resumeUrl }),
  })
  if (!res.ok) throw new Error(await parseError(res))
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('Could not read file'))
    }
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}
