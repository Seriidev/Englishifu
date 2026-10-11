import type { LibraryCategory, LibraryItem, LibraryLevel } from '../types/studyContent'

const GUTENDEX_BOOKS_URL = 'https://gutendex.com/books/'
const CACHE_LIMIT = 24
const COVER_KEYS = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
const TEXT_KEYS = [
  'text/plain; charset=utf-8',
  'text/plain; charset=us-ascii',
  'text/plain',
]
const DISPLAY_LEVELS: LibraryLevel[] = ['A2', 'B1', 'B2', 'C1', 'C2']

/** Gutendex `topic` searches subjects and bookshelves. */
export const GUTENDEX_TOPIC: Record<LibraryCategory, string> = {
  literature: 'fiction',
  grammar: 'grammar',
  classics: 'classic',
  academic: 'science',
  essays: 'essays',
  study: 'education',
  business: 'business',
  history: 'history',
}

interface GutendexAuthor {
  name?: string
}

interface GutendexBook {
  id: number
  title?: string
  authors?: GutendexAuthor[]
  subjects?: string[]
  download_count?: number
  formats?: Record<string, string>
}

interface GutendexResponse {
  count?: number
  next?: string | null
  previous?: string | null
  results?: GutendexBook[]
}

export interface GutendexBooksPage {
  books: LibraryItem[]
  page: number
  hasNext: boolean
  hasPrevious: boolean
}

const pageCache = new Map<string, GutendexBooksPage>()
const bookCache = new Map<string, LibraryItem>()
const textCache = new Map<string, string>()

function cacheKey(search: string, page: number, topic: string) {
  return `${page}::${search}::${topic}`
}

function rememberPage(key: string, value: GutendexBooksPage) {
  for (const book of value.books) bookCache.set(book.id, book)
  if (pageCache.has(key)) pageCache.delete(key)
  pageCache.set(key, value)
  while (pageCache.size > CACHE_LIMIT) {
    const oldest = pageCache.keys().next().value
    if (oldest === undefined) break
    pageCache.delete(oldest)
  }
}

export function readBooksCache(
  search: string,
  page: number,
  topic = '',
): GutendexBooksPage | null {
  return pageCache.get(cacheKey(search.trim(), page, topic)) ?? null
}

export function clearBooksCache(search: string, page: number, topic = '') {
  pageCache.delete(cacheKey(search.trim(), page, topic))
}

export function findCachedBook(id: string) {
  return bookCache.get(id) ?? null
}

export function filterCatalog(search: string, category: 'all' | LibraryCategory) {
  const q = search.trim().toLowerCase()
  return [...bookCache.values()].filter((item) => {
    if (category !== 'all' && item.category !== category) return false
    if (!q) return true
    return (
      item.title.toLowerCase().includes(q) ||
      item.author.toLowerCase().includes(q) ||
      (item.topicLabel ?? '').toLowerCase().includes(q)
    )
  })
}

function cleanText(value: string | undefined) {
  return (value ?? '').replace(/\s+/g, ' ').trim()
}

function preferHttps(url: string) {
  return url.replace(/^http:\/\//i, 'https://')
}

function coverUrl(formats: Record<string, string> | undefined) {
  if (!formats) return undefined
  for (const key of COVER_KEYS) {
    const url = formats[key]
    if (url) return preferHttps(url)
  }
  const fallback = Object.entries(formats).find(
    ([key, url]) => key.startsWith('image/') && Boolean(url),
  )
  return fallback ? preferHttps(fallback[1]) : undefined
}

export function readUrlFromFormats(formats: Record<string, string> | undefined) {
  if (!formats) return undefined
  for (const key of TEXT_KEYS) {
    const url = formats[key]
    if (url) return preferHttps(url)
  }
  const plain = Object.entries(formats).find(
    ([key, url]) => key.startsWith('text/plain') && Boolean(url),
  )
  if (plain) return preferHttps(plain[1])
  if (formats['text/html']) return preferHttps(formats['text/html'])
  return undefined
}

function topicFromSubjects(subjects: string[]) {
  const raw = subjects.find((item) => item.trim())
  if (!raw) return 'General'
  const parts = raw
    .split('--')
    .map((part) => cleanText(part))
    .filter(Boolean)
  const label = parts[parts.length - 1] || 'General'
  if (label.length <= 24) return label
  return `${label.slice(0, 22).trimEnd()}…`
}

function categoryFromSubjects(subjects: string[]): LibraryCategory {
  const blob = subjects.join(' ').toLowerCase()
  if (/\bgrammar\b/.test(blob)) return 'grammar'
  if (/\bhistory\b/.test(blob)) return 'history'
  if (/\bbusiness\b|\beconom/.test(blob)) return 'business'
  if (/\bessay\b/.test(blob)) return 'essays'
  if (/\bclassic\b/.test(blob)) return 'classics'
  if (/\bscience\b|\bacademic\b/.test(blob)) return 'academic'
  if (/\bstudy\b|\beducation\b/.test(blob)) return 'study'
  return 'literature'
}

function levelForBook(id: number): LibraryLevel {
  return DISPLAY_LEVELS[Math.abs(id) % DISPLAY_LEVELS.length]
}

export function gutenbergBookId(id: string) {
  return id.startsWith('gutenberg-') ? id.slice('gutenberg-'.length) : id
}

function toLibraryItem(
  book: GutendexBook,
  forcedCategory?: LibraryCategory,
): LibraryItem {
  const subjects = Array.isArray(book.subjects) ? book.subjects : []
  const title = cleanText(book.title) || 'Untitled'
  const downloads = Number(book.download_count)
  return {
    id: `gutenberg-${book.id}`,
    title,
    author: cleanText(book.authors?.[0]?.name) || 'Unknown',
    category: forcedCategory ?? categoryFromSubjects(subjects),
    topicLabel: topicFromSubjects(subjects),
    level: levelForBook(book.id),
    rating: 4.5,
    readerCount: Number.isFinite(downloads) ? downloads : 0,
    minutes: 0,
    description:
      subjects.slice(0, 3).map((item) => cleanText(item)).filter(Boolean).join(', ') ||
      'Public domain book from Project Gutenberg.',
    coverHeadline: title,
    coverImageUrl: coverUrl(book.formats),
    readUrl: readUrlFromFormats(book.formats),
  }
}

function wait(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

function attemptSignal(parent?: AbortSignal) {
  if (
    typeof AbortSignal === 'undefined' ||
    typeof AbortSignal.timeout !== 'function' ||
    typeof AbortSignal.any !== 'function'
  ) {
    return parent
  }
  const timeout = AbortSignal.timeout(45000)
  return parent ? AbortSignal.any([parent, timeout]) : timeout
}

async function requestBooks(url: string, signal?: AbortSignal): Promise<GutendexResponse> {
  let lastError: Error | null = null
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const res = await fetch(url, { signal: attemptSignal(signal), credentials: 'omit' })
      if (res.status >= 500 && attempt < 1) {
        await wait(700 * (attempt + 1), signal)
        continue
      }
      if (!res.ok) throw new Error(`Gutendex request failed (${res.status})`)
      return (await res.json()) as GutendexResponse
    } catch (err) {
      if (signal?.aborted || (err instanceof DOMException && err.name === 'AbortError')) {
        throw err
      }
      lastError = err instanceof Error ? err : new Error('Gutendex request failed')
      if (attempt >= 1) break
      await wait(700 * (attempt + 1), signal)
    }
  }
  throw lastError ?? new Error('Gutendex request failed')
}

export async function fetchBooks(
  options: {
    search?: string
    page?: number
    topic?: string
    category?: LibraryCategory
    signal?: AbortSignal
  } = {},
): Promise<GutendexBooksPage> {
  const search = options.search?.trim() ?? ''
  const topic = options.topic?.trim() ?? ''
  const page = options.page && options.page > 0 ? Math.floor(options.page) : 1
  const key = cacheKey(search, page, topic)
  const cached = pageCache.get(key)
  if (cached) return cached

  const params = new URLSearchParams({
    languages: 'en',
    page: String(page),
  })
  if (search) params.set('search', search)
  if (topic) params.set('topic', topic)

  const data = await requestBooks(`${GUTENDEX_BOOKS_URL}?${params}`, options.signal)
  const result: GutendexBooksPage = {
    books: (Array.isArray(data.results) ? data.results : []).map((book) =>
      toLibraryItem(book, options.category),
    ),
    page,
    hasNext: Boolean(data.next),
    hasPrevious: Boolean(data.previous) || page > 1,
  }
  rememberPage(key, result)
  return result
}

export async function fetchBookById(id: string, signal?: AbortSignal) {
  const cached = findCachedBook(id)
  if (cached) return cached
  const numeric = gutenbergBookId(id)
  if (!/^\d+$/.test(numeric)) return null
  const data = await requestBooks(
    `${GUTENDEX_BOOKS_URL}?ids=${encodeURIComponent(numeric)}`,
    signal,
  )
  const book = data.results?.[0]
  if (!book) return null
  const item = toLibraryItem(book)
  bookCache.set(item.id, item)
  return item
}

export function isHtmlDocument(value: string) {
  return /<!doctype html|<html/i.test(value.slice(0, 800))
}

export function stripGutenbergBoilerplate(raw: string) {
  const startMarker = raw.search(
    /\*\*\*\s*START OF (?:THE |THIS )?PROJECT GUTENBERG[^\n]*\*\*\*/i,
  )
  let text = startMarker >= 0 ? raw.slice(startMarker) : raw
  text = text.replace(/^\*\*\*[^\n]*\*\*\*\s*/, '')
  const endMarker = text.search(
    /\*\*\*\s*END OF (?:THE |THIS )?PROJECT GUTENBERG/i,
  )
  if (endMarker > 0) text = text.slice(0, endMarker)
  return text.trim()
}

async function readResponseText(url: string, signal?: AbortSignal) {
  const sameOrigin = url.startsWith('/')
  const res = await fetch(url, {
    signal,
    credentials: sameOrigin ? 'same-origin' : 'omit',
  })
  if (!res.ok) throw new Error(`Could not read book (${res.status})`)
  if (!sameOrigin) return res.text()
  const data = (await res.json()) as { text?: string }
  if (!data.text) throw new Error('Empty book')
  return data.text
}

export async function loadBookText(item: LibraryItem, signal?: AbortSignal) {
  const cached = textCache.get(item.id)
  if (cached) return cached
  if (!item.readUrl) throw new Error('This book has no readable text')

  let raw = ''
  try {
    raw = await readResponseText(item.readUrl, signal)
  } catch (err) {
    if (signal?.aborted || (err instanceof DOMException && err.name === 'AbortError')) {
      throw err
    }
    raw = await readResponseText(
      `/api/gutenberg-text?url=${encodeURIComponent(item.readUrl)}`,
      signal,
    )
  }

  const text = isHtmlDocument(raw) ? raw : stripGutenbergBoilerplate(raw)
  textCache.set(item.id, text)
  return text
}
