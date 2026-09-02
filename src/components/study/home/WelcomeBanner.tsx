import { useCallback, useEffect, useRef, useState } from 'react'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2'
import type { WelcomeSlide } from '../../../types/studyPlace'

export interface WelcomeBannerSlide extends WelcomeSlide {
  backgroundColor?: string
  imageUrl?: string
  ctaLabel?: string
  ctaLink?: string
}

interface WelcomeBannerProps {
  firstName: string
  slides: WelcomeBannerSlide[]
}

function BannerDecor() {
  return (
    <div
      className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] overflow-hidden sm:block"
      aria-hidden
    >
      <span className="absolute top-8 right-28 h-11 w-11 rounded-full bg-indigo-500 shadow-[0_8px_20px_rgba(99,102,241,0.35)]" />
      <span className="absolute top-20 right-10 h-16 w-12 rotate-[18deg] rounded-lg bg-white/95 shadow-lg">
        <span className="absolute top-3 left-2 right-2 h-1 rounded-full bg-indigo-950/30" />
        <span className="absolute top-6 left-2 right-3 h-1 rounded-full bg-indigo-950/20" />
        <span className="absolute top-9 left-2 right-4 h-1 rounded-full bg-indigo-950/20" />
      </span>
      <svg
        viewBox="0 0 120 90"
        className="absolute right-8 bottom-8 h-28 w-36 drop-shadow-xl"
      >
        <path
          d="M8 38 L60 14 L112 38 L60 62 Z"
          fill="#f8fafc"
        />
        <rect x="52" y="38" width="16" height="28" rx="2" fill="#e2e8f0" />
        <path d="M68 66 Q92 58 96 40" fill="none" stroke="#facc15" strokeWidth="5" strokeLinecap="round" />
        <circle cx="96" cy="38" r="5" fill="#facc15" />
        <path d="M8 38 L60 50 L112 38 L60 62 Z" fill="#e2e8f0" />
      </svg>
    </div>
  )
}

export default function WelcomeBanner({ firstName, slides }: WelcomeBannerProps) {
  const count = slides.length
  const [index, setIndex] = useState(1)
  const [animate, setAnimate] = useState(true)
  const hovering = useRef(false)

  const dateLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date())

  const realIndex = count === 0 ? 0 : (index - 1 + count) % count
  const extended =
    count === 0
      ? []
      : [slides[count - 1], ...slides, slides[0]]

  const go = useCallback(
    (dir: -1 | 1) => {
      if (count < 2) return
      setAnimate(true)
      setIndex((prev) => prev + dir)
    },
    [count],
  )

  useEffect(() => {
    if (count < 2) return
    const id = window.setInterval(() => {
      if (!hovering.current) go(1)
    }, 6000)
    return () => window.clearInterval(id)
  }, [count, go])

  const onTransitionEnd = () => {
    if (count < 2) return
    if (index === count + 1) {
      setAnimate(false)
      setIndex(1)
    } else if (index === 0) {
      setAnimate(false)
      setIndex(count)
    }
  }

  useEffect(() => {
    if (animate) return
    const frame = requestAnimationFrame(() => setAnimate(true))
    return () => cancelAnimationFrame(frame)
  }, [animate, index])

  if (count === 0) return null

  return (
    <section
      className={`relative overflow-hidden rounded-[22px] shadow-sm ${
        slides[realIndex]?.imageUrl
          ? 'bg-slate-200'
          : 'bg-indigo-50 text-slate-900 dark:bg-indigo-500/20 dark:text-slate-100'
      }`}
      style={
        slides[realIndex]?.imageUrl
          ? undefined
          : slides[realIndex]?.backgroundColor
            ? { backgroundColor: slides[realIndex].backgroundColor, color: '#0F172A' }
            : undefined
      }
      onMouseEnter={() => {
        hovering.current = true
      }}
      onMouseLeave={() => {
        hovering.current = false
      }}
    >
      {slides[realIndex]?.imageUrl ? null : <BannerDecor />}

      <div className="overflow-hidden">
        <div
          className={`flex ${animate ? 'transition-transform duration-500 ease-out' : ''}`}
          style={{ transform: `translateX(-${index * 100}%)` }}
          onTransitionEnd={onTransitionEnd}
        >
          {extended.map((slide, i) => {
            const isPoster = Boolean(slide.imageUrl)
            const title = slide.title.replace(/\{name\}/g, firstName)
            return (
              <div
                key={`${slide.id}-${i}`}
                className="relative w-full shrink-0"
              >
                {isPoster ? (
                  <img
                    src={slide.imageUrl}
                    alt=""
                    className="aspect-[3/1] w-full object-cover"
                  />
                ) : (
                  <div className="px-5 py-6 sm:min-h-[200px] sm:px-7 sm:py-7">
                    <p className="text-sm font-medium text-slate-500">
                      {dateLabel}
                    </p>
                    <h2 className="mt-2 max-w-lg text-2xl font-bold tracking-tight sm:text-3xl">
                      {title}
                    </h2>
                    <p className="mt-2 max-w-md text-sm text-slate-600 sm:text-base">
                      {slide.body}
                    </p>
                    {slide.ctaLabel && slide.ctaLink ? (
                      <a
                        href={slide.ctaLink}
                        className="mt-4 inline-flex rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600"
                      >
                        {slide.ctaLabel}
                      </a>
                    ) : (
                      <div className="h-10 sm:h-12" />
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="absolute right-4 bottom-4 z-10 flex items-center gap-2 sm:right-6 sm:bottom-5">
        <p
          className={`text-xs font-semibold tracking-wide ${
            slides[realIndex]?.imageUrl
              ? 'text-white drop-shadow'
              : 'text-slate-500'
          }`}
        >
          {realIndex + 1}/{count}
        </p>
        <button
          type="button"
          onClick={() => go(-1)}
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition hover:opacity-90 ${
            slides[realIndex]?.imageUrl
              ? 'bg-white/90 text-zinc-900'
              : 'bg-indigo-500 text-white'
          }`}
          aria-label="Previous slide"
        >
          <HiChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition hover:opacity-90 ${
            slides[realIndex]?.imageUrl
              ? 'bg-white/90 text-zinc-900'
              : 'bg-indigo-500 text-white'
          }`}
          aria-label="Next slide"
        >
          <HiChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </section>
  )
}
