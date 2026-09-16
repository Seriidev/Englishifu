import { Link, useLocation } from 'react-router-dom'
import { HiBookmark, HiOutlineBookmark, HiStar } from 'react-icons/hi2'
import type { LibraryItem } from '../../../types/studyContent'
import { libraryLevelLabel, libraryTopicLabel } from '../../../data/libraryMeta'

export { libraryLevelLabel }

interface LibraryBookCardProps {
  item: LibraryItem
  saved: boolean
  onToggleSave: (id: string) => void
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
}: LibraryBookCardProps) {
  const location = useLocation()
  const rating = Number(item.rating || 0)
  const readers = displayReaders(item.id, rating)
  const category = libraryTopicLabel(item.category)
  const href =
    item.hasPdf || item.pdfUrl
      ? readerPath(location.pathname, item.id)
      : undefined
  const cover = item.coverImageUrl || ''
  const coverHeadline = item.coverHeadline || item.title

  const body = (
    <>
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-slate-200 dark:bg-slate-700">
        {cover ? (
          <img
            src={cover}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-300 to-slate-400 px-4 text-center text-sm font-medium text-white dark:from-slate-600 dark:to-slate-800">
            {item.title}
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent px-3 pb-4 pt-12">
          <p className="text-center font-serif text-[15px] leading-snug text-white drop-shadow-sm sm:text-base">
            {coverHeadline}
          </p>
        </div>

        {rating >= 4.5 ? (
          <span className="absolute left-0 top-3 rounded-r-full bg-[#F97316] px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white shadow-sm">
            Best Seller
          </span>
        ) : null}
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
              {readers} readers
            </span>
          </p>
        ) : (
          <p className="text-[12px] text-slate-500 dark:text-slate-400">
            {readers} readers
          </p>
        )}

        <p className="text-[13px] font-bold text-[#7C3AED] dark:text-[#A78BFA]">
          {category}
        </p>

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
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300">
          {libraryLevelLabel(item.level)}
        </span>
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
