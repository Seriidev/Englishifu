import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Briefcase, User } from 'lucide-react'
import { mockTutorListings } from '../mocks/tutorListingsMock'
import { getTutorProfileByHandle } from '../mocks/tutorProfileMock'
import VerifiedBadge from '../components/profile/VerifiedBadge'

export default function StudyTutorDetailPage() {
  const { handle = '' } = useParams()
  const routeHandle = handle.replace(/^@/, '').toLowerCase()

  const registered = getTutorProfileByHandle(routeHandle)
  const listing =
    mockTutorListings.find((t) => t.handle.toLowerCase() === routeHandle) ??
    null

  if (!registered && !listing) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Tutor not found</h2>
        <p className="mt-2 text-sm text-slate-500">
          We couldn&apos;t find a tutor for @{routeHandle}.
        </p>
        <Link
          to="/study/tutors"
          className="mt-6 inline-flex rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"
        >
          Back to Find a Tutor
        </Link>
      </div>
    )
  }

  const fullName = registered?.fullName ?? listing?.fullName ?? 'Tutor'
  const position =
    registered?.position ?? listing?.positionLabel ?? 'Teacher'
  const avatarUrl = registered?.avatarUrl ?? listing?.avatarUrl
  const aboutMe = registered?.aboutMe
  const yearsOfExperience = registered?.yearsOfExperience
  const hourlyRateUsd =
    registered?.hourlyRateUsd ?? listing?.pricePerHour
  const isVerified = registered
    ? true
    : Boolean(listing?.isVerified)
  const rating = registered?.averageRating || listing?.rating
  const reviewsCount = registered?.reviewsCount || listing?.reviewsCount

  return (
    <div className="space-y-5">
      <Link
        to="/study/tutors"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to tutors
      </Link>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 gap-4 sm:gap-5">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="h-20 w-20 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
                <User className="h-8 w-8" aria-hidden />
              </span>
            )}
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  {fullName}
                </h2>
                {isVerified ? <VerifiedBadge size="lg" /> : null}
              </div>
              <p className="mt-1.5 text-base font-semibold text-indigo-600">
                {position}
              </p>
              {typeof yearsOfExperience === 'number' ? (
                <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-800">
                  <Briefcase className="h-4 w-4 text-slate-400" aria-hidden />
                  {yearsOfExperience}{' '}
                  {yearsOfExperience === 1 ? 'year' : 'years'} experience
                </p>
              ) : null}
              {typeof hourlyRateUsd === 'number' ? (
                <p className="mt-1.5 text-sm font-semibold text-slate-800">
                  ${hourlyRateUsd}/hour
                  {rating && reviewsCount
                    ? ` · ${rating}★ (${reviewsCount} reviews)`
                    : ''}
                </p>
              ) : rating && reviewsCount ? (
                <p className="mt-1.5 text-sm font-semibold text-slate-800">
                  {rating}★ ({reviewsCount} reviews)
                </p>
              ) : null}
              {aboutMe ? (
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-700">
                  {aboutMe}
                </p>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              console.log('Booking stub', { handle: routeHandle })
            }}
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Booking
          </button>
        </div>
      </section>
    </div>
  )
}
