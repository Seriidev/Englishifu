import BookingsList from '../components/study/BookingsList'

export default function StudyBookingsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          My bookings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Confirmed lessons with tutors. Times are shown in your local timezone.
        </p>
      </div>
      <BookingsList
        role="student"
        emptyHint="You have no upcoming tutor lessons. Book a slot from Find a Tutor."
      />
    </div>
  )
}
