export const LIBRARY_LEVELS = ['A2', 'B1', 'B2', 'C1', 'C2'] as const
export const LIBRARY_CATEGORIES = [
  'literature',
  'study',
  'business',
  'history',
  'grammar',
  'classics',
  'academic',
  'essays',
] as const

export type LibraryLevel = (typeof LIBRARY_LEVELS)[number]
export type LibraryCategory = (typeof LIBRARY_CATEGORIES)[number]

export function isLibraryLevel(value: unknown): value is LibraryLevel {
  return typeof value === 'string' && LIBRARY_LEVELS.includes(value as LibraryLevel)
}

export function isLibraryCategory(value: unknown): value is LibraryCategory {
  return (
    typeof value === 'string' &&
    LIBRARY_CATEGORIES.includes(value as LibraryCategory)
  )
}

export function parseBookInput(body: Record<string, unknown>) {
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const author = typeof body.author === 'string' ? body.author.trim() : ''
  const description =
    typeof body.description === 'string' ? body.description.trim() : ''
  const coverImageUrl =
    typeof body.coverImageUrl === 'string'
      ? body.coverImageUrl.trim() || null
      : null
  const coverHeadline =
    typeof body.coverHeadline === 'string'
      ? body.coverHeadline.trim() || null
      : null
  const pdfUrl =
    typeof body.pdfUrl === 'string' ? body.pdfUrl.trim() || null : null
  const pdfFileName =
    typeof body.pdfFileName === 'string'
      ? body.pdfFileName.trim() || null
      : null
  const category = body.category
  const level = body.level
  const ratingRaw = Number(body.rating)
  const minutesRaw = Number(body.minutes)
  const isPublished = body.isPublished !== false
  const displayOrder = Number.isFinite(Number(body.displayOrder))
    ? Number(body.displayOrder)
    : 0

  return {
    title,
    author,
    description,
    coverImageUrl,
    coverHeadline,
    pdfUrl,
    pdfFileName,
    category: isLibraryCategory(category) ? category : null,
    level: isLibraryLevel(level) ? level : null,
    rating: Number.isFinite(ratingRaw)
      ? Math.min(5, Math.max(0, Math.round(ratingRaw * 10) / 10))
      : 0,
    minutes: Number.isFinite(minutesRaw) ? Math.max(1, Math.round(minutesRaw)) : 10,
    isPublished,
    displayOrder,
  }
}

export function toPublicBook(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    author: String(row.author ?? ''),
    category: String(row.category ?? 'literature'),
    level: String(row.level ?? 'A2'),
    rating: Number(row.rating ?? 0),
    minutes: Number(row.minutes ?? 0),
    description: String(row.description ?? ''),
    coverImageUrl: row.cover_image_url ? String(row.cover_image_url) : undefined,
    coverHeadline: row.cover_headline ? String(row.cover_headline) : undefined,
    coverBrand: String(row.author ?? ''),
    pdfUrl: row.pdf_url ? `/api/library-pdf/${row.id}` : undefined,
    pdfFileName: row.pdf_file_name ? String(row.pdf_file_name) : undefined,
  }
}
