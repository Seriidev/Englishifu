import { useEffect, useState } from 'react'
import { resultMetrics } from '../data/results'

const CYCLE_MS = 2200

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0)

  const active = resultMetrics[activeIndex]

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveIndex((i) => (i + 1) % resultMetrics.length)
    }, CYCLE_MS)

    return () => clearInterval(intervalId)
  }, [])

  return (
    <section className="bg-ink py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left text */}
          <div className="text-center lg:text-left">
            <p className="text-sm font-semibold tracking-wide text-white/40 uppercase">
              Real Results
            </p>
            <div key={activeIndex} className="animate-fog-in">
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {active.title}
              </h2>
              <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-gray-400 lg:mx-0">
                {active.description}
              </p>
            </div>
          </div>

          {/* Right — shorter pills, content centered inside */}
          <div className="mx-auto flex w-full max-w-[260px] flex-col gap-2.5 sm:max-w-[280px] lg:mx-0 lg:justify-self-center">
            {resultMetrics.map((metric, index) => {
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
                    className={`shrink-0 rounded-full border-2 object-cover transition-all duration-500 ${
                      isActive
                        ? 'h-11 w-11 border-white/60 ring-2 ring-white/40'
                        : 'h-9 w-9 border-white/30'
                    }`}
                  />
                  <div className="min-w-0 text-left leading-tight">
                    <p
                      className={`font-bold text-white transition-all duration-500 ${
                        isActive ? 'text-xl' : 'text-lg'
                      }`}
                    >
                      {metric.value}
                    </p>
                    <p className="text-xs text-white/80 sm:text-sm">{metric.label}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
