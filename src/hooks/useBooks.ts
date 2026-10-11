import { useEffect, useState } from 'react'
import type { LibraryCategory, LibraryItem } from '../types/studyContent'
import {
  clearBooksCache,
  fetchBooks,
  filterCatalog,
  GUTENDEX_TOPIC,
  readBooksCache,
} from '../utils/gutendex'

const SEARCH_DEBOUNCE_MS = 350

export function useBooks(category: 'all' | LibraryCategory) {
  const topic = category === 'all' ? '' : GUTENDEX_TOPIC[category]
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [page, setPageState] = useState(1)
  const [books, setBooks] = useState<LibraryItem[]>(
    () => readBooksCache('', 1)?.books ?? [],
  )
  const [loading, setLoading] = useState(() => readBooksCache('', 1) == null)
  const [error, setError] = useState<string | null>(null)
  const [hasNext, setHasNext] = useState(() => readBooksCache('', 1)?.hasNext ?? false)
  const [requestId, setRequestId] = useState(0)

  useEffect(() => {
    const next = query.trim()
    if (next === debouncedQuery) return
    const timer = window.setTimeout(() => {
      setDebouncedQuery(next)
      setPageState(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [debouncedQuery, query])

  useEffect(() => {
    const cached = readBooksCache(debouncedQuery, page, topic)
    if (cached) {
      setBooks(cached.books)
      setHasNext(cached.hasNext)
      setError(null)
      setLoading(false)
      return
    }

    const controller = new AbortController()
    let cancelled = false
    setLoading(true)
    setError(null)

    void fetchBooks({
      search: debouncedQuery,
      page,
      topic,
      category: category === 'all' ? undefined : category,
      signal: controller.signal,
    })
      .then((result) => {
        if (cancelled) return
        setBooks(result.books)
        setHasNext(result.hasNext)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        const local = filterCatalog(debouncedQuery, category)
        if (local.length > 0) {
          setBooks(local)
          setHasNext(false)
          setError(null)
          setLoading(false)
          return
        }
        setHasNext(false)
        setError('Could not load books. Check your connection and try again.')
        setLoading(false)
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [category, debouncedQuery, page, requestId, topic])

  const resetSearch = () => {
    setQuery('')
    setDebouncedQuery('')
    setPageState(1)
  }

  const commitSearch = () => {
    setDebouncedQuery(query.trim())
    setPageState(1)
  }

  const retry = () => {
    clearBooksCache(debouncedQuery, page, topic)
    setRequestId((value) => value + 1)
  }

  return {
    query,
    setQuery,
    page,
    setPage: (next: number) => setPageState(Math.max(1, next)),
    books,
    loading,
    error,
    hasNext,
    resetSearch,
    commitSearch,
    retry,
  }
}
