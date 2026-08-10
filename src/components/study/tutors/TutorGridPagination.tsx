import { ChevronLeft, ChevronRight } from 'lucide-react'

interface TutorGridPaginationProps {
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

export default function TutorGridPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: TutorGridPaginationProps) {
  if (totalItems === 0) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalItems)

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  )

  const withEllipsis: (number | '…')[] = []
  pages.forEach((p, i) => {
    if (i > 0 && p - (pages[i - 1] ?? 0) > 1) withEllipsis.push('…')
    withEllipsis.push(p)
  })

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {withEllipsis.map((p, i) =>
          p === '…' ? (
            <span key={`e-${i}`} className="px-1 text-slate-400">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-semibold transition ${
                p === page
                  ? 'bg-indigo-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <p className="text-sm text-slate-500">
        Showing {from}–{to} of {totalItems} tutors
      </p>
    </div>
  )
}
