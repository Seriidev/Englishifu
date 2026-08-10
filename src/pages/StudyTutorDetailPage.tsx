import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, User } from 'lucide-react'
import { mockTutorListings } from '../mocks/tutorListingsMock'
import VerifiedBadge from '../components/profile/VerifiedBadge'
import { tutorProfilePath } from '../utils/authStorage'

const MOCK_SLOTS = [
  'Thu Aug 7 · 4:00 PM',
  'Thu Aug 7 · 6:00 PM',
  'Fri Aug 8 · 2:00 PM',
  'Fri Aug 8 · 5:30 PM',
  'Sat Aug 9 · 11:00 AM',
  'Mon Aug 11 · 3:00 PM',
]

export default function StudyTutorDetailPage() {
  const { handle = '' } = useParams()
  const tutor =
    mockTutorListings.find(
      (t) => t.handle.toLowerCase() === handle.replace(/^@/, '').toLowerCase(),
    ) ?? null

  if (!tutor) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Tutor not found</h2>
        <p className="mt-2 text-sm text-slate-500">
          We couldn&apos;t find a tutor for @{handle.replace(/^@/, '')}.
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {tutor.avatarUrl ? (
            <img
              src={tutor.avatarUrl}
              alt=""
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
              <User className="h-8 w-8" aria-hidden />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900">
                {tutor.fullName}
              </h2>
              {tutor.isVerified ? <VerifiedBadge size="lg" /> : null}
            </div>
            <p className="mt-0.5 text-sm text-slate-500">{tutor.positionLabel}</p>
            <p className="mt-2 text-sm font-semibold text-slate-800">
              ${tutor.pricePerHour}/hour · {tutor.rating}★ ({tutor.reviewsCount}{' '}
              reviews)
            </p>
          </div>
          <Link
            to={tutorProfilePath(tutor.handle)}
            className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Open full profile
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-lg font-bold text-slate-900">Book a Lesson</h3>
        <p className="mt-1 text-sm text-slate-500">
          Pick a slot to continue — booking & payments come in the next step.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_SLOTS.map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => {
                console.log('Book slot stub', { handle: tutor.handle, slot })
              }}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
            >
              {slot}
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-400">
          Demo slots only — no charge or calendar sync yet.
        </p>
      </section>
    </div>
  )
}
