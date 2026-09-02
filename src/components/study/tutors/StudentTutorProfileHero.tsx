import { Star, User } from 'lucide-react'
import { MdVerified } from 'react-icons/md'
import type { TutorAvailabilityStatus } from '../../../types/tutorListing'
import { StatusBadge } from '../../shared/StatusBadge'

export interface StudentTutorProfileHeroProps {
  fullName: string
  avatarUrl?: string
  isVerified: boolean
  availabilityStatus: TutorAvailabilityStatus
  tags: string[]
  rating: number
  reviewsCount: number
  pricePerHour?: number
  aboutMe: string
  classesCount: number
  studentsCount: number
  kpi: string
  following: boolean
  onFollow: () => void
  onBook: () => void
  onWriteReview?: () => void
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div>
      <p className="text-base font-bold leading-none text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-900">{label}</p>
    </div>
  )
}

export default function StudentTutorProfileHero({
  fullName,
  avatarUrl,
  isVerified,
  availabilityStatus,
  tags,
  rating,
  reviewsCount,
  pricePerHour,
  aboutMe,
  classesCount,
  studentsCount,
  kpi,
  following,
  onFollow,
  onBook,
  onWriteReview,
}: StudentTutorProfileHeroProps) {
  const shownTags = tags.slice(0, 2)

  return (
    <section className="rounded-[24px] bg-white p-5 shadow-[0_10px_28px_rgba(0,0,0,0.08)] sm:p-6">
      <div className="flex gap-4 sm:gap-5">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="h-24 w-24 shrink-0 rounded-full object-cover sm:h-28 sm:w-28"
          />
        ) : (
          <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 sm:h-28 sm:w-28">
            <User className="h-10 w-10" aria-hidden />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  {fullName}
                </h2>
                {isVerified ? (
                  <MdVerified
                    className="h-5 w-5 shrink-0 text-indigo-500 sm:h-6 sm:w-6"
                    title="Verified"
                    aria-label="Verified"
                  />
                ) : null}
              </div>
              <p className="mt-0.5 text-sm text-slate-400">Teacher</p>
            </div>
            <StatusBadge status={availabilityStatus} />
          </div>

          <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
            <Stat value={classesCount} label="Classes" />
            <Stat value={studentsCount} label="Students" />
            <Stat value={kpi} label="KPI" />
          </div>
        </div>
      </div>

      {shownTags.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {shownTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-slate-800 bg-white px-3 py-1 text-xs font-medium text-slate-900"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
        <span className="inline-flex items-center gap-1 text-amber-600">
          <Star
            className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
            aria-hidden
          />
          {reviewsCount > 0
            ? `${rating.toFixed(1)} (${reviewsCount} reviews)`
            : 'No reviews yet'}
        </span>
        {onWriteReview ? (
          <button
            type="button"
            onClick={onWriteReview}
            className="text-sm font-semibold text-indigo-600 hover:underline"
          >
            Write a review
          </button>
        ) : null}
        {typeof pricePerHour === 'number' ? (
          <span className="font-medium text-slate-900">
            $ {pricePerHour}/hour
          </span>
        ) : null}
      </div>

      <div className="mt-6">
        <h3 className="text-base font-bold text-slate-900">About me</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">{aboutMe}</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onFollow}
          className={`rounded-xl py-2.5 text-sm font-semibold transition ${
            following
              ? 'border border-slate-900 bg-slate-900 text-white'
              : 'border border-slate-900 bg-white text-slate-900 hover:bg-slate-50'
          }`}
          aria-pressed={following}
        >
          {following ? 'Following' : 'Follow'}
        </button>
        <button
          type="button"
          onClick={onBook}
          className="rounded-xl bg-indigo-500 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-600"
        >
          Book
        </button>
      </div>
    </section>
  )
}
