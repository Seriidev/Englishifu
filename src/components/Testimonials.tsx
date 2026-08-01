import { useEffect, useMemo, useState } from 'react'
import { resultMetrics } from '../data/results'
import { useLanguage } from '../i18n/LanguageContext'

const CYCLE_MS = 2200

const TITLE_KEYS = [
  'results.m1.title',
  'results.m2.title',
  'results.m3.title',
  'results.m4.title',
  'results.m5.title',
] as const
const DESC_KEYS = [
  'results.m1.desc',
  'results.m2.desc',
  'results.m3.desc',
  'results.m4.desc',
  'results.m5.desc',
] as const
const LABEL_KEYS = [
  'results.m1.label',
  'results.m2.label',
  'results.m3.label',
  'results.m4.label',
  'results.m5.label',
] as const

export default function Testimonials() {
  const { t, lang } = useLanguage()
  const [activeIndex, setActiveIndex] = useState(0)

  const metrics = useMemo(
    () =>
      resultMetrics.map((metric, i) => ({
        ...metric,
        title: t(TITLE_KEYS[i]),
        description: t(DESC_KEYS[i]),
        label: t(LABEL_KEYS[i]),
      })),
    [t, lang],
  )

  const active = metrics[activeIndex]

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveIndex((i) => (i + 1) % metrics.length)
    }, CYCLE_MS)

    return () => clearInterval(intervalId)
  }, [metrics.length])

  return (
    <section className="bg-ink py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="text-center lg:text-left">
            <p className="text-sm font-semibold tracking-wide text-white/40 uppercase">
              {t('results.eyebrow')}
            </p>
            <div key={`${lang}-${activeIndex}`} className="animate-fog-in">
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {active.title}
              </h2>
              <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-gray-400 lg:mx-0">
                {active.description}
              </p>
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-[260px] flex-col gap-2.5 sm:max-w-[280px] lg:mx-0 lg:justify-self-center">
            {metrics.map((metric, index) => {
              const isActive = index === activeIndex
              return (
                <button
                  key={metric.label}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r text-center shadow-md transition-all duration-500 ease-out ${metric.gradient} ${
                    isActive
                      ? 'z-10 scale-[1.05] px-4 py-2 shadow-lg'
                      : 'scale-100 px-4 py-1.5 opacity-85'
                  }`}
                >
                  <img
                    src={metric.photo}
                    alt=""
                    className={`rounded-full object-cover transition-all ${
                      isActive ? 'h-9 w-9' : 'h-7 w-7'
                    }`}
                  />
                  <span
                    className={`font-bold text-white ${
                      isActive ? 'text-sm' : 'text-xs'
                    }`}
                  >
                    {metric.value}
                  </span>
                  <span
                    className={`font-medium text-white/90 ${
                      isActive ? 'text-sm' : 'text-xs'
                    }`}
                  >
                    {metric.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
