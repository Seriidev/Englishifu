import { ArrowRight, BarChart2, Calendar, Clock, Users } from 'lucide-react'
import { speakingClubMeetings } from '../data/speakingClub'

export default function SpeakingClub() {
  const handleBook = (meetingTitle: string) => {
    console.log('Book meeting:', meetingTitle)
  }

  return (
    <section id="speaking-club" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Upcoming Speaking Clubs
          </h2>
          <a
            href="#speaking-club"
            className="inline-flex items-center gap-1.5 text-base font-semibold text-brand transition hover:underline"
          >
            View all meetings
            <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {speakingClubMeetings.map((meeting) => (
            <article
              key={meeting.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
            >
              <div className="relative">
                <img
                  src={meeting.image}
                  alt={meeting.imageAlt}
                  width={800}
                  height={450}
                  className="aspect-[16/9] w-full object-cover"
                />
                <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-ink shadow-sm">
                  <BarChart2 className="h-3.5 w-3.5 text-brand" aria-hidden />
                  {meeting.level}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex flex-wrap gap-4 text-sm text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" aria-hidden />
                    {meeting.date}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4" aria-hidden />
                    {meeting.time}
                  </span>
                </div>

                <h3 className="mt-3 text-lg font-bold text-ink">{meeting.title}</h3>

                <div className="mt-auto border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 text-sm text-muted">
                      <Users className="h-4 w-4" aria-hidden />
                      {meeting.spotsLeft} spots left
                    </span>
                    <button
                      type="button"
                      onClick={() => handleBook(meeting.title)}
                      className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
                    >
                      Book
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-2xl bg-brand-light p-6 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4 sm:items-center">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-brand">
              <Users className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <p className="font-bold text-ink">Small groups</p>
              <p className="mt-0.5 text-sm text-muted">
                No more than 8 people — everyone gets attention
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => console.log('Book a meeting')}
            className="rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            Book a meeting
          </button>
        </div>
      </div>
    </section>
  )
}
