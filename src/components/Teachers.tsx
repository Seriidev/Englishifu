import { teachers } from '../data/teachers'
import { useLanguage } from '../i18n/LanguageContext'

export default function Teachers() {
  const { t } = useLanguage()

  return (
    <section
      id="tutors"
      className="bg-gradient-to-b from-transparent via-[#eef3ff]/50 to-transparent py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
              {t('teachers.title')}
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              {t('teachers.body')}
            </p>
          </div>

          <a
            href="#tutors"
            className="inline-flex w-fit shrink-0 items-center rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow-sm transition hover:bg-gray-50"
          >
            {t('teachers.badge')}
          </a>
        </div>

        <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 sm:mt-12 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {teachers.map((teacher) => (
            <article
              key={teacher.id}
              className="group relative h-[400px] w-[min(78vw,260px)] shrink-0 snap-start overflow-hidden rounded-[1.75rem] sm:h-[440px] sm:w-[calc((100%-3rem)/4)] sm:min-w-[200px] lg:h-[480px]"
            >
              <img
                src={teacher.photo}
                alt={teacher.name}
                className="absolute inset-0 h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"
                aria-hidden
              />
              <div className="absolute inset-x-0 bottom-0 flex flex-col p-5 sm:p-6">
                <p className="text-sm text-white/80">@{teacher.handle}</p>
                <h3 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-[1.35rem]">
                  {teacher.name}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/85">
                  {teacher.bio}
                </p>
                <div className="mt-4">
                  <span className="inline-flex rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-sm ring-1 ring-white/20">
                    {teacher.badge}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
