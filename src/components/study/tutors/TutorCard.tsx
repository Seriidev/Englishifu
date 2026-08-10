import { Link } from 'react-router-dom'
import { Heart, Star, User } from 'lucide-react'
import type { TutorListingCard } from '../../../types/tutorListing'
import VerifiedBadge from '../../profile/VerifiedBadge'

export interface TutorCardProps {
  tutor: TutorListingCard
  onFavorite: () => void
  isFavorited: boolean
  viewMode?: 'grid' | 'list'
}

const statusColor = {
  online: 'bg-green-500',
  busy: 'bg-red-500',
  away: 'bg-slate-400',
} as const

const statusLabel = {
  online: 'Online',
  busy: 'Busy',
  away: 'Away',
} as const

export default function TutorCard({
  tutor,
  onFavorite,
  isFavorited,
  viewMode = 'grid',
}: TutorCardProps) {
  if (viewMode === 'list') {
    return (
      <article className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 transition hover:shadow-md sm:flex-row sm:items-center sm:p-5">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="relative shrink-0">
            {tutor.avatarUrl ? (
              <img
                src={tutor.avatarUrl}
                alt=""
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
                <User className="h-6 w-6" aria-hidden />
              </span>
            )}
            <span
              className={`absolute right-0 bottom-0 h-3 w-3 rounded-full ring-2 ring-white ${statusColor[tutor.availabilityStatus]}`}
            />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="font-semibold text-slate-900">{tutor.fullName}</h3>
              {tutor.isVerified ? <VerifiedBadge size="md" /> : null}
            </div>
            <p className="text-sm text-slate-500">{tutor.positionLabel}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {tutor.specialtyTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          <span className="inline-flex items-center gap-1 text-sm text-slate-700">
            <Star
              className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
              aria-hidden
            />
            {tutor.rating} ({tutor.reviewsCount})
          </span>
          <span className="text-sm font-semibold text-slate-900">
            ${tutor.pricePerHour}/hour
          </span>
          <button
            type="button"
            onClick={onFavorite}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-100"
            aria-label={isFavorited ? 'Remove favorite' : 'Add favorite'}
          >
            <Heart
              className={`h-4 w-4 ${isFavorited ? 'fill-red-400 text-red-400' : 'text-slate-300'}`}
              aria-hidden
            />
          </button>
          <Link
            to={`/study/tutors/${tutor.handle}`}
            className="rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-600"
          >
            View Profile & Book
          </Link>
        </div>
      </article>
    )
  }

  return (
    <article className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-5 text-center transition hover:shadow-md">
      <div className="mb-2 flex w-full items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <span
            className={`h-2 w-2 rounded-full ${statusColor[tutor.availabilityStatus]}`}
          />
          {statusLabel[tutor.availabilityStatus]}
        </span>
        <button
          type="button"
          onClick={onFavorite}
          aria-label={isFavorited ? 'Remove favorite' : 'Add favorite'}
        >
          <Heart
            className={`h-4 w-4 ${isFavorited ? 'fill-red-400 text-red-400' : 'text-slate-300'}`}
            aria-hidden
          />
        </button>
      </div>

      {tutor.avatarUrl ? (
        <img
          src={tutor.avatarUrl}
          alt=""
          className="mb-3 h-16 w-16 rounded-full object-cover"
        />
      ) : (
        <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
          <User className="h-7 w-7" aria-hidden />
        </span>
      )}

      <div className="mb-0.5 flex items-center gap-1">
        <span className="font-semibold text-slate-900">{tutor.fullName}</span>
        {tutor.isVerified ? <VerifiedBadge size="md" /> : null}
      </div>
      <p className="mb-3 text-sm text-slate-500">{tutor.positionLabel}</p>

      <div className="mb-3 flex flex-wrap justify-center gap-1.5">
        {tutor.specialtyTags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-700">
        <span className="flex items-center gap-1">
          <Star
            className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
            aria-hidden
          />
          {tutor.rating} ({tutor.reviewsCount} reviews)
        </span>
        <span className="text-slate-400">·</span>
        <span className="font-medium">${tutor.pricePerHour}/hour</span>
      </div>

      <Link
        to={`/study/tutors/${tutor.handle}`}
        className="w-full rounded-xl bg-indigo-500 py-2.5 text-center text-sm font-medium text-white transition hover:bg-indigo-600"
      >
        View Profile & Book
      </Link>
    </article>
  )
}
