import { Link, useLocation } from 'react-router-dom'
import {
  HiBookmark,
  HiOutlineAcademicCap,
  HiOutlineBookmark,
  HiStar,
} from 'react-icons/hi2'
import type { LibraryItem } from '../../../types/studyContent'
import { libraryLevelLabel, libraryTopicLabel } from '../../../data/libraryMeta'

export { libraryLevelLabel }

interface LibraryBookCardProps {
  item: LibraryItem
  saved: boolean
  onToggleSave: (id: string) => void
}

function coverUrl(item: LibraryItem) {
  return item.coverImageUrl || ''
}

function readerPath(pathname: string, id: string) {
  const base = pathname.startsWith('/tutor') ? '/tutor' : '/study'
  return `${base}/library/${id}`
}

export default function LibraryBookCard({
  item,
  saved,
  onToggleSave,
}: LibraryBookCardProps) {
  const location = useLocation()
  const headline = item.coverHeadline ?? item.title
  const brand = item.coverBrand ?? item.author
  const rating = Number(item.rating || 0)
  const href = item.pdfUrl ? readerPath(location.pathname, item.id) : undefined

  const body = (
    <>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[12px] bg-white px-2.5 pt-2 pb-2">
        <span className="mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[#0B151F]">
          <HiOutlineAcademicCap className="h-4 w-4" aria-hidden />
        </span>

        <p className="line-clamp-2 bg-[#0B151F] px-2 py-1.5 text-center text-[10px] font-semibold leading-snug text-white">
          {headline}
        </p>

        {item.coverSeries ? (
          <p className="mt-1.5 text-center text-[10px] leading-tight text-slate-800">
            {item.coverSeries}
          </p>
        ) : null}
        {item.coverByline ? (
          <p className="text-center text-[10px] font-bold text-[#0B151F]">
            {item.coverByline}
          </p>
        ) : null}
        <p className="mb-1.5 text-center text-[9px] text-slate-500">
          By {brand}
        </p>

        {coverUrl(item) ? (
          <img
            src={coverUrl(item)}
            alt=""
            className="h-24 w-full rounded-sm object-cover sm:h-28"
          />
        ) : (
          <div className="flex h-24 items-center justify-center rounded-sm bg-slate-100 text-[10px] text-slate-400 sm:h-28">
            No cover
          </div>
        )}

        <p className="mt-1.5 flex items-center justify-center gap-1 text-[9px] font-semibold tracking-wide text-[#0B151F]">
          <HiOutlineAcademicCap className="h-3 w-3" aria-hidden />
          {brand}
        </p>
      </div>

      <h3 className="mt-3 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-white">
        {item.title}
      </h3>

      {rating > 0 ? (
        <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-amber-300">
          <HiStar className="h-3.5 w-3.5" aria-hidden />
          {rating.toFixed(1)}
        </p>
      ) : null}
    </>
  )

  return (
    <article className="flex h-full flex-col rounded-[18px] bg-[#24476B] p-3">
      {href ? (
        <Link to={href} className="flex min-h-0 flex-1 flex-col">
          {body}
        </Link>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">{body}</div>
      )}

      <div className="mt-3 flex items-end justify-between gap-2">
        <div className="flex min-w-0 flex-wrap gap-1.5">
          <span className="rounded-full border border-white/90 px-2.5 py-0.5 text-[11px] font-medium text-white">
            {libraryLevelLabel(item.level)}
          </span>
          <span className="rounded-full border border-white/90 px-2.5 py-0.5 text-[11px] font-medium text-white">
            {libraryTopicLabel(item.category)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {href ? (
            <Link
              to={href}
              className="rounded-full border border-white/80 px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-white/10"
            >
              PDF
            </Link>
          ) : (
            <span className="rounded-full border border-white/30 px-2 py-0.5 text-[11px] font-semibold text-white/40">
              PDF
            </span>
          )}
          <button
            type="button"
            onClick={() => onToggleSave(item.id)}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center text-white transition hover:opacity-80"
            aria-label={
              saved ? `Remove ${item.title} from My books` : `Save ${item.title}`
            }
            aria-pressed={saved}
          >
            {saved ? (
              <HiBookmark className="h-5 w-5" aria-hidden />
            ) : (
              <HiOutlineBookmark className="h-5 w-5" aria-hidden />
            )}
          </button>
        </div>
      </div>
    </article>
  )
}
