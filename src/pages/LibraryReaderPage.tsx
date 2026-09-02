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
  const pdfSrc = bookId ? `/api/library-pdf/${bookId}` : ''

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
        {pdfSrc ? (
          <a
            href={pdfSrc}
            target="_blank"
            rel="noreferrer"
            className="ml-auto rounded-full bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-600"
          >
            Open in new tab
          </a>
        ) : null}
      </div>

      {missing && !book ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
          This book is not in the library.
        </p>
      ) : (
        <iframe
          title={book?.title || 'Book'}
          src={pdfSrc}
          className="h-[calc(100svh-11rem)] w-full rounded-2xl border border-slate-200 bg-white"
        />
      )}
    </section>
  )
}
