import { useEffect, useMemo, useState } from 'react'
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi2'
import { useAuth } from '../auth/AuthContext'
import LibraryBookCard from '../components/study/library/LibraryBookCard'
import LibraryFilterMenu from '../components/study/library/LibraryFilterMenu'
import SearchField from '../components/shared/SearchField'
import { LIBRARY_LEVEL_OPTIONS, LIBRARY_TOPIC_OPTIONS } from '../data/libraryMeta'
import { useBooks } from '../hooks/useBooks'
import type { LibraryCategory, LibraryLevel } from '../types/studyContent'
import {
  readSavedLibraryIds,
  writeSavedLibraryIds,
} from '../utils/libraryStorage'

const LEVEL_FILTERS: { id: 'all' | LibraryLevel; label: string }[] = [
  ...LIBRARY_LEVEL_OPTIONS,
  { id: 'all', label: 'All levels' },
]

const TOPIC_FILTERS: { id: 'all' | LibraryCategory; label: string }[] = [
  ...LIBRARY_TOPIC_OPTIONS,
  { id: 'all', label: 'All topics' },
]

function LibraryGridSkeleton() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-hidden>
      {Array.from({ length: 8 }, (_, index) => (
        <li
          key={index}
          className="rounded-[20px] bg-white p-2.5 shadow-sm ring-1 ring-slate-200/80 dark:bg-[#13293d] dark:ring-white/10"
        >
          <div className="aspect-[3/4] w-full animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-700" />
          <div className="mt-3 space-y-2 px-0.5">
            <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        </li>
      ))}
    </ul>
  )
}

export default function StudyLibraryPage() {
  const { user } = useAuth()
  const userId = user?.id ?? null
  const [level, setLevel] = useState<'all' | LibraryLevel>('all')
  const [category, setCategory] = useState<'all' | LibraryCategory>('all')
  const {
    query,
    setQuery,
    page,
    setPage,
    books,
    loading,
    error,
    hasNext,
    resetSearch,
    commitSearch,
    retry,
  } = useBooks(category)
  const [myBooksOnly, setMyBooksOnly] = useState(false)
  const [savedIds, setSavedIds] = useState<string[]>(() =>
    readSavedLibraryIds(userId),
  )

  useEffect(() => {
    setSavedIds(readSavedLibraryIds(userId))
  }, [userId])

  const savedSet = useMemo(() => new Set(savedIds), [savedIds])
  const visibleBooks = useMemo(() => {
    const q = query.trim().toLowerCase()
    return books.filter((item) => {
      if (myBooksOnly && !savedSet.has(item.id)) return false
      if (level !== 'all' && item.level !== level) return false
      if (category !== 'all' && item.category !== category) return false
      if (!q) return true
      return (
        item.title.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q) ||
        (item.topicLabel ?? '').toLowerCase().includes(q)
      )
    })
  }, [books, category, level, myBooksOnly, query, savedSet])
  const showingAll = query.trim() === '' && level === 'all' && category === 'all'

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
      writeSavedLibraryIds(userId, next)
      return next
    })
  }

  return (
    <section className="space-y-4" aria-busy={loading}>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
          Library
        </h2>
        <button
          type="button"
          onClick={() => setMyBooksOnly((value) => !value)}
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            myBooksOnly
              ? 'bg-indigo-500 text-white hover:bg-indigo-600'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15'
          }`}
          aria-pressed={myBooksOnly}
        >
          My books
        </button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchField
          wrapperClassName="w-full shrink-0 lg:w-64"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              commitSearch()
            }
          }}
          placeholder="Search"
        />

        <button
          type="button"
          onClick={() => {
            setLevel('all')
            setCategory('all')
            resetSearch()
          }}
          className={`w-fit rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            showingAll
              ? 'bg-indigo-500 text-white hover:bg-indigo-600'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15'
          }`}
        >
          All
        </button>

        <LibraryFilterMenu
          label="All levels"
          value={level}
          options={LEVEL_FILTERS}
          onChange={setLevel}
        />

        <LibraryFilterMenu
          label="All topics"
          value={category}
          options={TOPIC_FILTERS}
          onChange={(value) => {
            setCategory(value)
            setPage(1)
          }}
        />

        <div className="flex shrink-0 items-center gap-2 self-end lg:border-l lg:border-slate-200 lg:pl-3 dark:lg:border-white/15">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage(page - 1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 dark:border-white/20 dark:bg-slate-800 dark:text-white"
            aria-label="Previous page"
          >
            <HiOutlineChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-xl border border-slate-300 bg-white px-2 text-sm font-semibold text-slate-800 dark:border-white/20 dark:bg-slate-800 dark:text-white">
            {page}
          </span>
          <button
            type="button"
            disabled={!hasNext || loading}
            onClick={() => setPage(page + 1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 dark:border-white/20 dark:bg-slate-800 dark:text-white"
            aria-label="Next page"
          >
            <HiOutlineChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      {loading && visibleBooks.length > 0 ? (
        <p className="text-sm text-slate-500 dark:text-white/60">Updating library…</p>
      ) : null}

      {loading && visibleBooks.length === 0 ? (
        <>
          <p className="sr-only">Loading books</p>
          <LibraryGridSkeleton />
        </>
      ) : error && visibleBooks.length === 0 ? (
        <div
          role="alert"
          className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center dark:border-white/15 dark:bg-slate-800"
        >
          <p className="text-sm text-slate-500 dark:text-white/70">{error}</p>
          <button
            type="button"
            onClick={retry}
            className="mt-3 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
          >
            Try again
          </button>
        </div>
      ) : visibleBooks.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500 dark:border-white/15 dark:bg-slate-800 dark:text-white/70">
          {myBooksOnly
            ? 'No saved books on this page. Tap the ribbon on a card to add it here.'
            : query.trim() || level !== 'all' || category !== 'all'
              ? 'No books match your search or filters.'
              : 'No books to show right now.'}
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {visibleBooks.map((item) => (
            <li key={item.id}>
              <LibraryBookCard
                item={item}
                saved={savedSet.has(item.id)}
                onToggleSave={toggleSave}
                onSelectCategory={(value) => {
                  setCategory(value)
                  setPage(1)
                }}
                onSelectLevel={setLevel}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
