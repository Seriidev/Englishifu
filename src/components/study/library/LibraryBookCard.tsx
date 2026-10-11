import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { HiBookmark, HiOutlineBookmark, HiStar } from 'react-icons/hi2'
import type { LibraryCategory, LibraryItem, LibraryLevel } from '../../../types/studyContent'
import { libraryLevelLabel, libraryTopicLabel } from '../../../data/libraryMeta'

export { libraryLevelLabel }

interface LibraryBookCardProps {
  item: LibraryItem
  saved: boolean
  onToggleSave: (id: string) => void
  onSelectCategory?: (category: LibraryCategory) => void
  onSelectLevel?: (level: LibraryLevel) => void
}

function readerPath(pathname: string, id: string) {
  const base = pathname.startsWith('/tutor') ? '/tutor' : '/study'
  return `${base}/library/${id}`
}

/** Stable display count until real reader analytics exist. */
function displayReaders(id: string, rating: number) {
  let hash = 0
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  }
  return 40 + (hash % 260) + Math.round(rating * 18)
}

function truncateTitle(title: string, max = 22) {
  if (title.length <= max) return title
  return `${title.slice(0, max).trimEnd()}..`
}

export default function LibraryBookCard({
  item,
  saved,
  onToggleSave,
  onSelectCategory,
  onSelectLevel,
}: LibraryBookCardProps) {
  const location = useLocation()
  const [coverBroken, setCoverBroken] = useState(false)
  const rating = Number(item.rating || 0)
  const readers = item.readerCount ?? displayReaders(item.id, rating)
  const readersLabel = `${readers.toLocaleString('en-US')} readers`
  const category = libraryTopicLabel(item.category)
  const href =
    item.hasPdf || item.pdfUrl || item.readUrl || item.id.startsWith('gutenberg-')
      ? readerPath(location.pathname, item.id)
      : undefined
  const cover = !coverBroken && item.coverImageUrl ? item.coverImageUrl : ''
  const coverHeadline = item.coverHeadline || item.title

  const body = (
    <>
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-slate-200 dark:bg-slate-700">
        {cover ? (
          <img
            src={cover}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setCoverBroken(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-300 to-slate-400 px-4 text-center dark:from-slate-600 dark:to-slate-800">
            <p className="line-clamp-4 text-sm font-medium text-white">{item.title}</p>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent px-3 pb-4 pt-12">
          <p className="line-clamp-3 text-center font-serif text-[15px] leading-snug text-white drop-shadow-sm sm:text-base">
            {coverHeadline}
          </p>
        </div>

      </div>

      <div className="mt-3 space-y-1 px-0.5">
        {rating > 0 ? (
          <p className="flex items-center gap-1.5 text-[12px] text-slate-600 dark:text-slate-300">
            <HiStar className="h-3.5 w-3.5 shrink-0 text-[#F97316]" aria-hidden />
            <span className="font-medium text-slate-800 dark:text-slate-100">
              {rating.toFixed(1)}
            </span>
            <span className="text-slate-400" aria-hidden>
              •
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              {readersLabel}
            </span>
          </p>
        ) : (
          <p className="text-[12px] text-slate-500 dark:text-slate-400">
            {readersLabel}
          </p>
        )}

        <button
          type="button"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onSelectCategory?.(item.category)
          }}
          className="text-left text-[13px] font-bold text-[#7C3AED] dark:text-[#A78BFA]"
        >
          {category}
        </button>

        <h3
          className="line-clamp-2 text-[17px] font-bold leading-snug text-slate-900 dark:text-white"
          title={item.title}
        >
          {truncateTitle(item.title)}
        </h3>

        <p className="text-[13px] text-slate-500 dark:text-slate-400">
          {item.author}
        </p>
      </div>
    </>
  )

  return (
    <article className="group relative flex h-full flex-col rounded-[20px] bg-white p-2.5 shadow-sm ring-1 ring-slate-200/80 transition hover:shadow-md dark:bg-[#13293d] dark:ring-white/10">
      {href ? (
        <Link to={href} className="flex min-h-0 flex-1 flex-col">
          {body}
        </Link>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">{body}</div>
      )}

      <div className="mt-2 flex items-center justify-between gap-2 px-0.5">
        <button
          type="button"
          onClick={() => onSelectLevel?.(item.level)}
          className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-200"
        >
          {libraryLevelLabel(item.level)}
        </button>
        <button
          type="button"
          onClick={() => onToggleSave(item.id)}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-indigo-300"
          aria-label={
            saved ? `Remove ${item.title} from My books` : `Save ${item.title}`
          }
          aria-pressed={saved}
        >
          {saved ? (
            <HiBookmark className="h-5 w-5 text-indigo-600 dark:text-indigo-300" aria-hidden />
          ) : (
            <HiOutlineBookmark className="h-5 w-5" aria-hidden />
          )}
        </button>
      </div>
    </article>
  )
}
