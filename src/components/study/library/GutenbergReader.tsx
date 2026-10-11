import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { HiOutlineArrowLeft } from 'react-icons/hi2'
import {
  fetchBookById,
  isHtmlDocument,
  loadBookText,
} from '../../../utils/gutendex'

interface GutenbergReaderProps {
  bookId: string
  backTo: string
}

export default function GutenbergReader({ bookId, backTo }: GutenbergReaderProps) {
  const [title, setTitle] = useState('Opening book…')
  const [author, setAuthor] = useState('')
  const [body, setBody] = useState('')
  const [html, setHtml] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    let cancelled = false
    setLoading(true)
    setError(false)

    void (async () => {
      try {
        const book = await fetchBookById(bookId, controller.signal)
        if (cancelled) return
        if (!book?.readUrl) throw new Error('missing')
        setTitle(book.title)
        setAuthor(book.author)
        const text = await loadBookText(book, controller.signal)
        if (cancelled) return
        setHtml(isHtmlDocument(text))
        setBody(text)
        setLoading(false)
      } catch {
        if (cancelled) return
        setError(true)
        setLoading(false)
      }
    })()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [attempt, bookId])

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
            {error ? 'Could not open this book' : title}
          </h2>
          {author ? (
            <p className="truncate text-sm text-slate-500">{author}</p>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center dark:border-white/15 dark:bg-slate-800">
          <p className="text-sm text-slate-500 dark:text-white/70">
            The text did not load. Try again in a moment.
          </p>
          <button
            type="button"
            onClick={() => setAttempt((value) => value + 1)}
            className="mt-3 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
          >
            Try again
          </button>
        </div>
      ) : loading ? (
        <div className="flex h-[calc(100svh-11rem)] items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-500 dark:border-white/15 dark:bg-slate-900 dark:text-slate-300">
          Loading book…
        </div>
      ) : html ? (
        <iframe
          title={title}
          sandbox=""
          srcDoc={body}
          className="h-[calc(100svh-11rem)] w-full rounded-2xl border border-slate-200 bg-white"
        />
      ) : (
        <article className="h-[calc(100svh-11rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white px-5 py-6 sm:px-10 dark:border-white/15 dark:bg-slate-900">
          <div className="mx-auto max-w-2xl whitespace-pre-wrap font-serif text-[17px] leading-8 text-slate-800 dark:text-slate-100">
            {body}
          </div>
        </article>
      )}
    </section>
  )
}
