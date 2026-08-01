import { useMemo } from 'react'
import { featureStats } from '../data/features'
import { useLanguage } from '../i18n/LanguageContext'

const FEATURES_IMAGE =
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=80'

const TITLE_KEYS = [
  'features.s1.title',
  'features.s2.title',
  'features.s3.title',
  'features.s4.title',
] as const
const DESC_KEYS = [
  'features.s1.desc',
  'features.s2.desc',
  'features.s3.desc',
  'features.s4.desc',
] as const

export default function Features() {
  const { t, lang } = useLanguage()

  const stats = useMemo(
    () =>
      featureStats.map((stat, i) => ({
        ...stat,
        title: t(TITLE_KEYS[i]),
        description: t(DESC_KEYS[i]),
      })),
    [t, lang],
  )

  return (
    <section id="features" className="bg-transparent py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:gap-12">
          <h2 className="max-w-md text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
            {t('features.titleBefore')}{' '}
            <span className="text-brand">{t('features.titleBrand')}</span>
          </h2>
          <p className="max-w-md text-base leading-relaxed text-gray-500 lg:pt-1 lg:text-right">
            {t('features.body')}
          </p>
        </div>

        <div className="mt-12 grid items-stretch gap-8 md:gap-12 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl">
            <img
              src={FEATURES_IMAGE}
              alt=""
              width={900}
              height={675}
              className="h-full min-h-[280px] w-full object-cover aspect-[4/3] lg:min-h-full"
            />
          </div>

          <div className="flex flex-col justify-center">
            <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">
              {t('features.subtitle')}
            </h3>

            <ul className="mt-5 flex flex-col gap-3">
              {stats.map((stat) => (
                <li
                  key={stat.title}
                  className="flex items-center gap-4 rounded-xl border border-[#d7e3f8]/70 bg-white/70 p-4 shadow-sm shadow-brand/5 backdrop-blur-sm sm:gap-5 sm:p-5"
                >
                  <p className="shrink-0 text-3xl font-bold text-gray-900 sm:text-4xl">
                    {stat.value}
                    {stat.suffix && (
                      <span className="text-brand">{stat.suffix}</span>
                    )}
                  </p>
                  <div>
                    <p className="font-semibold text-gray-900">{stat.title}</p>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {stat.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
