import { Calendar, Clock, Users, Sparkles } from 'lucide-react'
import { speakingClubMeetings } from '../data/speakingClub'
import { useLanguage } from '../i18n/LanguageContext'

export default function SpeakingClub() {
  const { t } = useLanguage()

  const handleBook = (meetingTitle: string) => {
    console.log('Book meeting:', meetingTitle)
  }

  return (
    <section id="speaking-club" className="bg-transparent py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="sr-only">{t('club.title')}</h2>
        <div className="flex flex-col items-start justify-between gap-5 rounded-[1.75rem] bg-brand px-5 py-5 shadow-lg shadow-brand/25 sm:flex-row sm:items-center sm:gap-8 sm:px-7 sm:py-6">
          <div className="flex min-w-0 items-start gap-4 sm:items-center">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
              <Sparkles className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                {t('club.smallTitle')}
              </p>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-white/90 sm:text-[15px]">
                {t('club.smallBody')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => console.log('Speaking Club')}
            className="inline-flex w-full shrink-0 items-center justify-center rounded-full bg-white/25 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/35 sm:w-auto"
          >
            {t('club.button')}
          </button>
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
                      {t('club.spots', { count: meeting.spotsLeft })}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleBook(meeting.title)}
                      className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
                    >
                      {t('club.book')}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
