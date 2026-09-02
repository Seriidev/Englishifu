import { Link } from 'react-router-dom'
import { Star, User } from 'lucide-react'
import { MdVerified } from 'react-icons/md'
import type { TutorListingCard } from '../../../types/tutorListing'
import { StatusBadge } from '../../shared/StatusBadge'

export interface TutorCardProps {
  tutor: TutorListingCard
  onFavorite: () => void
  isFavorited: boolean
  viewMode?: 'grid' | 'list'
}

function photoUrl(url?: string) {
  if (!url) return undefined
  return url.replace(/\/\d+(\?|$)/, '/480$1')
}

function TutorPhoto({
  tutor,
  className,
}: {
  tutor: TutorListingCard
  className: string
}) {
  const src = photoUrl(tutor.avatarUrl)
  if (src) {
    return (
      <img src={src} alt="" className={`object-cover object-top ${className}`} />
    )
  }
  return (
    <span
      className={`flex items-center justify-center bg-slate-100 text-slate-400 ${className}`}
    >
      <User className="h-12 w-12" aria-hidden />
    </span>
  )
}

function TutorCardBody({ tutor }: { tutor: TutorListingCard }) {
  const tags = tutor.specialtyTags.slice(0, 2)

  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-1.5">
            <h3 className="truncate text-base font-bold text-slate-900">
              {tutor.fullName}
            </h3>
            {tutor.isVerified ? (
              <MdVerified
                className="h-5 w-5 shrink-0 text-indigo-500"
                title="Verified"
                aria-label="Verified"
              />
            ) : null}
          </div>
          <p className="mt-0.5 text-sm text-slate-500">{tutor.positionLabel}</p>
        </div>
        <StatusBadge status={tutor.availabilityStatus} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-slate-800/80 bg-white px-2.5 py-0.5 text-[11px] font-medium text-slate-900"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-sm">
        <span className="inline-flex items-center gap-1 text-slate-500">
          <Star
            className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
            aria-hidden
          />
          {tutor.rating.toFixed(1)} ({tutor.reviewsCount} reviews)
        </span>
        <span className="shrink-0 font-medium text-slate-800">
          $ {tutor.pricePerHour}/hour
        </span>
      </div>

      <Link
        to={`/study/tutors/${tutor.handle}`}
        className="mt-4 block w-full rounded-[12px] bg-indigo-500 py-2.5 text-center text-sm font-bold text-white transition hover:bg-indigo-600"
      >
        Book
      </Link>
    </>
  )
}

export default function TutorCard({
  tutor,
  viewMode = 'grid',
}: TutorCardProps) {
  if (viewMode === 'list') {
    return (
      <article className="flex overflow-hidden rounded-[24px] bg-white shadow-[0_10px_28px_rgba(0,0,0,0.12)] sm:flex-row">
        <TutorPhoto
          tutor={tutor}
          className="h-44 w-full shrink-0 sm:h-auto sm:w-48 lg:w-56"
        />
        <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
          <TutorCardBody tutor={tutor} />
        </div>
      </article>
    )
  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_10px_28px_rgba(0,0,0,0.12)]">
      <TutorPhoto tutor={tutor} className="aspect-[5/4] w-full" />
      <div className="flex flex-1 flex-col px-4 pt-3 pb-4">
        <TutorCardBody tutor={tutor} />
      </div>
    </article>
  )
}
