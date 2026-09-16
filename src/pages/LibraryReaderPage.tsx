import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { HiOutlineArrowLeft } from 'react-icons/hi2'
import type { LibraryItem } from '../types/studyContent'
import { fetchLibraryBooks } from '../utils/libraryApi'

export default function LibraryReaderPage() {
  const { bookId } = useParams()
  const location = useLocation()
  const backTo = location.pathname.startsWith('/tutor')
    ? '/tutor/library'
    : '/study/library'
  const [book, setBook] = useState<LibraryItem | null>(null)
  const [missing, setMissing] = useState(false)
  const [viewerUrl, setViewerUrl] = useState('')
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    if (!bookId) return
    let cancelled = false
    void fetchLibraryBooks().then((books) => {
      if (cancelled) return
      const found = books.find((item) => item.id === bookId) ?? null
      setBook(found)
      setMissing(!found)
    })
    return () => {
      cancelled = true
    }
  }, [bookId])

  useEffect(() => {
    if (!bookId || missing) return
    let cancelled = false
    let objectUrl = ''

    void (async () => {
      try {
        const res = await fetch(`/api/library-pdf/${bookId}`, {
          credentials: 'include',
        })
        if (!res.ok) throw new Error('Failed to load PDF')
        const blob = await res.blob()
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        // Hide Chrome/Edge PDF toolbar (download / print icons).
        setViewerUrl(`${objectUrl}#toolbar=0&navpanes=0`)
        setLoadError(false)
      } catch {
        if (!cancelled) {
          setLoadError(true)
          setViewerUrl('')
        }
      }
    })()

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [bookId, missing])

  useEffect(() => {
    const blockShortcuts = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if ((event.ctrlKey || event.metaKey) && (key === 's' || key === 'p')) {
        event.preventDefault()
      }
    }
    window.addEventListener('keydown', blockShortcuts)
    return () => window.removeEventListener('keydown', blockShortcuts)
  }, [])

  return (
    <section className="flex min-h-0 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to={backTo}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
        >
          <HiOutlineArrowLeft className="h-4 w-4" aria-hidden />
          Library
        </Link>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold text-slate-900 sm:text-xl dark:text-white">
            {book?.title ?? (missing ? 'Book not found' : 'Opening book…')}
          </h2>
          {book?.author ? (
            <p className="truncate text-sm text-slate-500">{book.author}</p>
          ) : null}
        </div>
      </div>

      {missing && !book ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
          This book is not in the library.
        </p>
      ) : loadError ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
          Could not open this book. Please sign in and try again.
        </p>
      ) : (
        <div
          className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white"
          onContextMenu={(event) => event.preventDefault()}
        >
          {viewerUrl ? (
            <iframe
              title={book?.title || 'Book'}
              src={viewerUrl}
              className="h-[calc(100svh-11rem)] w-full bg-white"
            />
          ) : (
            <div className="flex h-[calc(100svh-11rem)] items-center justify-center text-sm text-slate-500">
              Loading book…
            </div>
          )}
        </div>
      )}
    </section>
  )
}
