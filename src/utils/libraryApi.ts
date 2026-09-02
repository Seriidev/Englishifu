import type { LibraryItem } from '../types/studyContent'

export async function fetchLibraryBooks(): Promise<LibraryItem[]> {
  try {
    const res = await fetch('/api/library')
    if (!res.ok) return []
    const data = (await res.json()) as { books?: LibraryItem[] }
    return Array.isArray(data.books) ? data.books : []
  } catch {
    return []
  }
}
