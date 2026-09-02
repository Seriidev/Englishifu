import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import BookingCalendar from '../components/study/tutors/BookingCalendar'
import ConfirmBookingModal from '../components/study/tutors/ConfirmBookingModal'
import LeaveProfileReview from '../components/study/tutors/LeaveProfileReview'
import ReviewsList from '../components/study/tutors/ReviewsList'
import StudentTutorProfileHero from '../components/study/tutors/StudentTutorProfileHero'
import { getTutorProfileByHandle } from '../mocks/tutorProfileMock'
import type { AvailableSlot } from '../types/booking'
import type { TutorReview } from '../types/notifications'
import type { TutorListingCard } from '../types/tutorListing'
import { SKILL_LABELS, type TutorPublicProfile } from '../types/tutorProfile'
import { syncApiSession } from '../utils/bookingApi'
import { fetchApprovedTutors, fetchTutorReviews } from '../utils/platformApi'
import {
  readFollowedTutorIds,
  writeFollowedTutorIds,
} from '../utils/followStorage'

export default function StudyTutorDetailPage() {
  const { handle = '' } = useParams()
  const { user } = useAuth()
  const routeHandle = handle.replace(/^@/, '').toLowerCase()

  const [listing, setListing] = useState<TutorListingCard | null>(null)
  const [registered, setRegistered] = useState<TutorPublicProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null)
  const [selectedTutorId, setSelectedTutorId] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [bookedFlash, setBookedFlash] = useState(false)
  const [authHint, setAuthHint] = useState<string | null>(null)
  const [avgRating, setAvgRating] = useState(0)
  const [reviewsCount, setReviewsCount] = useState(0)
  const [reviews, setReviews] = useState<TutorReview[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewsTick, setReviewsTick] = useState(0)
  const followId = listing?.id ?? registered?.id ?? routeHandle
  const userId = user?.id ?? null
  const [following, setFollowing] = useState(() =>
    readFollowedTutorIds(userId).includes(followId),
  )

  useEffect(() => {
    setFollowing(readFollowedTutorIds(userId).includes(followId))
  }, [followId, userId])

  useEffect(() => {
    let cancelled = false
    setProfileLoading(true)
    void Promise.all([
      getTutorProfileByHandle(routeHandle),
      fetchApprovedTutors().catch(() => [] as TutorListingCard[]),
    ]).then(([profile, tutors]) => {
      if (cancelled) return
      setRegistered(profile)
      const found =
        tutors.find((t) => t.handle.toLowerCase() === routeHandle) ?? null
      setListing(found)
      if (profile) {
        setAvgRating(profile.averageRating)
        setReviewsCount(profile.reviewsCount)
      } else if (found) {
        setAvgRating(found.rating)
        setReviewsCount(found.reviewsCount)
      }
      setProfileLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [routeHandle])

  useEffect(() => {
    let cancelled = false
    setReviewsLoading(true)
    void fetchTutorReviews(routeHandle)
      .then((data) => {
        if (cancelled) return
        setReviews(data.reviews)
        setAvgRating(data.averageRating)
        setReviewsCount(data.totalReviews)
      })
      .catch(() => {
        if (cancelled) return
        setReviews([])
      })
      .finally(() => {
        if (!cancelled) setReviewsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [routeHandle, reviewsTick])

  if (profileLoading) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
        Loading…
      </div>
    )
  }

  if (!registered && !listing) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Tutor not found</h2>
        <p className="mt-2 text-sm text-slate-500">
          We couldn&apos;t find a tutor for @{routeHandle}.
        </p>
        <Link
          to="/study/tutors"
          className="mt-6 inline-flex rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white"
        >
          Back to Find a Tutor
        </Link>
      </div>
    )
  }

  const fullName = registered?.fullName ?? listing?.fullName ?? 'Tutor'
  const avatarUrl = registered?.avatarUrl ?? listing?.avatarUrl
  const isVerified = registered ? true : Boolean(listing?.isVerified)
  const hourlyRateUsd = registered?.hourlyRateUsd ?? listing?.pricePerHour
  const tags =
    listing?.specialtyTags?.length
      ? listing.specialtyTags
      : (registered?.specializations ?? []).map((s) => SKILL_LABELS[s.skillTag])
  const aboutMe =
    registered?.aboutMe?.trim() ||
    `${fullName} is a teacher on Englishcore. Book a lesson to start preparing together.`
  const classesCount =
    registered?.classesStats.totalClasses ||
    Math.max(10, Math.round((listing?.reviewsCount ?? 20) / 5))
  const studentsCount =
    registered?.studentsCount ||
    registered?.classesStats.totalStudents ||
    Math.max(20, listing?.reviewsCount ?? 20)
  const kpi = avgRating ? avgRating.toFixed(1) : '—'
  const availabilityStatus = listing?.availabilityStatus ?? 'away'

  const toggleFollow = () => {
    setFollowing((prev) => {
      const ids = readFollowedTutorIds(userId)
      const next = prev
        ? ids.filter((id) => id !== followId)
        : [...ids, followId]
      writeFollowedTutorIds(userId, next)
      return !prev
    })
  }

  const openBookingPanel = () => {
    setBookedFlash(false)
    setAuthHint(null)
    setBookingOpen(true)
  }

  const onSlotSelected = async (slot: AvailableSlot, tutorId: string) => {
    setAuthHint(null)
    if (!user || user.role !== 'student') {
      setAuthHint('Sign in as a student to book this slot.')
      return
    }
    const synced = await syncApiSession(user)
    if (!synced.ok) {
      setAuthHint(synced.error)
      return
    }
    setSelectedSlot(slot)
    setSelectedTutorId(tutorId)
    setConfirmOpen(true)
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

      <StudentTutorProfileHero
        fullName={fullName}
        avatarUrl={avatarUrl}
        isVerified={isVerified}
        availabilityStatus={availabilityStatus}
        tags={tags}
        rating={avgRating}
        reviewsCount={reviewsCount}
        pricePerHour={hourlyRateUsd}
        aboutMe={aboutMe}
        classesCount={classesCount}
        studentsCount={studentsCount}
        kpi={kpi}
        following={following}
        onFollow={toggleFollow}
        onBook={openBookingPanel}
        onWriteReview={
          user?.role === 'student'
            ? () => {
                const target =
                  document.getElementById('leave-review') ??
                  document.getElementById('tutor-reviews')
                target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            : undefined
        }
      />

      <LeaveProfileReview
        tutorHandle={routeHandle}
        tutorName={fullName}
        alreadyReviewed={Boolean(
          user &&
            user.role === 'student' &&
            reviews.some((r) => r.student_id === user.id),
        )}
        existingRating={
          user
            ? reviews.find((r) => r.student_id === user.id)?.rating
            : undefined
        }
        onSubmitted={() => setReviewsTick((n) => n + 1)}
      />

      <section
        id="tutor-reviews"
        className="rounded-[24px] bg-white p-5 shadow-[0_10px_28px_rgba(0,0,0,0.08)] sm:p-6"
      >
        <h3 className="mb-4 text-base font-bold text-slate-900">Reviews</h3>
        <ReviewsList
          reviews={reviews}
          averageRating={avgRating}
          totalReviews={reviewsCount}
          loading={reviewsLoading}
          emptyHint="No student reviews yet. Be the first to rate this teacher."
        />
      </section>

      {bookingOpen ? (
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-bold text-slate-900">Pick a time</h3>
            <button
              type="button"
              onClick={() => setBookingOpen(false)}
              className="text-sm font-semibold text-slate-500 hover:text-slate-800"
            >
              Close
            </button>
          </div>
          {bookedFlash ? (
            <p className="mb-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
              Booked! See it under{' '}
              <Link to="/study/bookings" className="underline">
                My bookings
              </Link>
              .
            </p>
          ) : null}
          {authHint ? (
            <p className="mb-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {authHint}
            </p>
          ) : null}
          <BookingCalendar
            tutorHandle={routeHandle}
            refreshKey={refreshKey}
            onSlotSelected={(slot, tutorId) => {
              void onSlotSelected(slot, tutorId)
            }}
          />
        </section>
      ) : null}

      <ConfirmBookingModal
        open={confirmOpen}
        tutorName={fullName}
        tutorId={selectedTutorId}
        slot={selectedSlot}
        onClose={() => setConfirmOpen(false)}
        onBooked={() => {
          setConfirmOpen(false)
          setSelectedSlot(null)
          setBookedFlash(true)
          setRefreshKey((k) => k + 1)
        }}
        onConflict={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  )
}
