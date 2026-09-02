import { useEffect, useMemo, useState } from 'react'
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi2'
import { useAuth } from '../auth/AuthContext'
import LibraryBookCard, {
  libraryLevelLabel,
} from '../components/study/library/LibraryBookCard'
import LibraryFilterMenu from '../components/study/library/LibraryFilterMenu'
import {
  LIBRARY_LEVEL_OPTIONS,
  LIBRARY_TOPIC_OPTIONS,
  libraryTopicLabel,
} from '../data/libraryMeta'
import type { LibraryCategory, LibraryItem, LibraryLevel } from '../types/studyContent'
import { fetchLibraryBooks } from '../utils/libraryApi'
import {
  readSavedLibraryIds,
  writeSavedLibraryIds,
} from '../utils/libraryStorage'

const PAGE_SIZE = 8

const LEVEL_FILTERS: { id: 'all' | LibraryLevel; label: string }[] = [
  ...LIBRARY_LEVEL_OPTIONS,
  { id: 'all', label: 'All levels' },
]

const TOPIC_FILTERS: { id: 'all' | LibraryCategory; label: string }[] = [
  ...LIBRARY_TOPIC_OPTIONS,
  { id: 'all', label: 'All topics' },
]

const LEVEL_ORDER: LibraryLevel[] = ['A2', 'B1', 'B2', 'C1', 'C2']

export default function StudyLibraryPage() {
  const { user } = useAuth()
  const userId = user?.id ?? null
  const [books, setBooks] = useState<LibraryItem[]>([])
  const [query, setQuery] = useState('')
  const [level, setLevel] = useState<'all' | LibraryLevel>('all')
  const [category, setCategory] = useState<'all' | LibraryCategory>('all')
  const [myBooksOnly, setMyBooksOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [savedIds, setSavedIds] = useState<string[]>(() =>
    readSavedLibraryIds(userId),
  )

  useEffect(() => {
    setSavedIds(readSavedLibraryIds(userId))
  }, [userId])

  useEffect(() => {
    void fetchLibraryBooks().then(setBooks)
  }, [])

  const savedSet = useMemo(() => new Set(savedIds), [savedIds])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return books
      .filter((item) => {
        if (myBooksOnly && !savedSet.has(item.id)) return false
        if (level !== 'all' && item.level !== level) return false
        if (category !== 'all' && item.category !== category) return false
        if (!q) return true
        return (
          item.title.toLowerCase().includes(q) ||
          item.author.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          libraryLevelLabel(item.level).toLowerCase().includes(q) ||
          libraryTopicLabel(item.category).toLowerCase().includes(q)
        )
      })
      .sort(
        (a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level),
      )
  }, [books, category, level, myBooksOnly, query, savedSet])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  )

  useEffect(() => {
    setPage(1)
  }, [query, level, category, myBooksOnly])

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
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
          Library
        </h2>
        <button
          type="button"
          onClick={() => setMyBooksOnly((value) => !value)}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
            myBooksOnly
              ? 'border-indigo-500 bg-indigo-600 text-white'
              : 'border-slate-300 bg-white text-slate-800 hover:border-indigo-500 dark:border-white/20 dark:bg-[#1B3A56] dark:text-white'
          }`}
          aria-pressed={myBooksOnly}
        >
          My books
        </button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <button
          type="button"
          onClick={() => {
            setLevel('all')
            setCategory('all')
          }}
          className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            level === 'all' && category === 'all'
              ? 'bg-indigo-600 text-white'
              : 'border border-slate-300 bg-white text-slate-800 dark:border-white/20 dark:bg-[#1B3A56] dark:text-white'
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
          onChange={setCategory}
        />

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="w-full min-w-0 flex-1 rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 dark:border-white/15 dark:bg-[#1B3A56] dark:text-white dark:placeholder:text-white/50"
        />

        <div className="flex shrink-0 items-center gap-2 self-end lg:border-l lg:border-slate-200 lg:pl-3 dark:lg:border-white/15">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 dark:border-white/20 dark:bg-[#1B3A56] dark:text-white"
            aria-label="Previous page"
          >
            <HiOutlineChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <span className="min-w-6 text-center text-sm font-semibold text-slate-800 dark:text-white">
            {safePage}
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages || filtered.length === 0}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 dark:border-white/20 dark:bg-[#1B3A56] dark:text-white"
            aria-label="Next page"
          >
            <HiOutlineChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      {pageItems.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500 dark:border-white/15 dark:bg-[#1B3A56] dark:text-white/70">
          {myBooksOnly
            ? 'No saved books yet. Tap the ribbon on a card to add it here.'
            : 'No books yet. An admin can add them from Books in the admin panel.'}
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {pageItems.map((item) => (
            <li key={item.id}>
              <LibraryBookCard
                item={item}
                saved={savedSet.has(item.id)}
                onToggleSave={toggleSave}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
