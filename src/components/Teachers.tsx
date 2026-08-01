import { ArrowRight, GraduationCap } from 'lucide-react'
import { teachers } from '../data/teachers'
import { useLanguage } from '../i18n/LanguageContext'

const cardOverlays = [
  'from-blue-950/55 via-blue-900/15 to-transparent',
  'from-[#1e4fd6]/50 via-[#4F7CFF]/10 to-transparent',
  'from-blue-900/55 via-blue-800/15 to-transparent',
  'from-[#0b1b3d]/55 via-brand/15 to-transparent',
] as const

export default function Teachers() {
  const { t } = useLanguage()

  return (
    <section id="tutors" className="bg-gradient-to-b from-transparent via-[#eef3ff]/70 to-transparent py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-700">
              <GraduationCap className="h-3.5 w-3.5" aria-hidden />
              {t('teachers.badge')}
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {t('teachers.title')}
            </h2>
          </div>

          <div className="flex flex-col gap-5 lg:max-w-[350px] lg:items-end lg:text-right">
            <p className="text-base leading-relaxed text-gray-500">
              {t('teachers.body')}
            </p>

            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              <a
                href="#tutors"
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
              >
                {t('teachers.viewAll')}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {teachers.map((teacher, index) => {
            const overlay = cardOverlays[index % cardOverlays.length]
            return (
              <article
                key={teacher.id}
                className="relative h-[380px] w-[220px] shrink-0 snap-start overflow-hidden rounded-3xl sm:h-[400px] sm:w-[260px] lg:h-[420px] lg:w-[280px]"
              >
                <img
                  src={teacher.photo.replace('/300?', '/600?')}
                  alt={teacher.name}
                  className="absolute inset-0 h-full w-full object-cover object-top"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${overlay}`}
                  aria-hidden
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 to-transparent"
                  aria-hidden
                />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="text-lg font-bold text-white">{teacher.name}</h3>
                  <p className="mt-1 text-sm text-white/80">
                    {teacher.specialization}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
