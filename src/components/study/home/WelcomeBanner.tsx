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

export default function WelcomeBanner({ firstName, slides }: WelcomeBannerProps) {
  const count = slides.length
  const [index, setIndex] = useState(1)
  const [animate, setAnimate] = useState(true)
  const [slideWidth, setSlideWidth] = useState(0)
  const hovering = useRef(false)
  const frameRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const measure = () => {
      const next = frame.clientWidth
      setSlideWidth((prev) => (prev === next ? prev : next))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(frame)
    return () => observer.disconnect()
  }, [count])

  if (count === 0) return null

  return (
    <section
      className={`relative min-w-0 overflow-hidden rounded-[22px] shadow-sm ${
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
      <div ref={frameRef} className="min-w-0 overflow-hidden">
        <div
          className={`flex ${animate && slideWidth > 0 ? 'transition-transform duration-500 ease-out' : ''}`}
          style={{
            width: slideWidth > 0 ? slideWidth * extended.length : '100%',
            transform:
              slideWidth > 0 ? `translateX(-${index * slideWidth}px)` : undefined,
          }}
          onTransitionEnd={onTransitionEnd}
        >
          {extended.map((slide, i) => {
            const isPoster = Boolean(slide.imageUrl)
            const title = slide.title.replace(/\{name\}/g, firstName)
            return (
              <div
                key={`${slide.id}-${i}`}
                className="relative shrink-0"
                style={{ width: slideWidth > 0 ? slideWidth : '100%' }}
              >
                {isPoster ? (
                  <img
                    src={slide.imageUrl}
                    alt=""
                    className="block h-auto max-h-72 w-full object-contain sm:max-h-80"
                  />
                ) : (
                  <div className="px-4 py-5 pb-14 sm:min-h-[200px] sm:px-7 sm:py-7 sm:pb-16">
                    <p className="text-xs font-medium text-slate-500 sm:text-sm">
                      {dateLabel}
                    </p>
                    <h2 className="mt-2 max-w-lg text-xl font-bold tracking-tight break-words text-pretty sm:text-3xl">
                      {title}
                    </h2>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600 break-words sm:text-base">
                      {slide.body}
                    </p>
                    {slide.ctaLabel && slide.ctaLink ? (
                      <a
                        href={slide.ctaLink}
                        className="mt-4 inline-flex rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600"
                      >
                        {slide.ctaLabel}
                      </a>
                    ) : (
                      <div className="h-8 sm:h-12" />
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
          className={`welcome-slide-control inline-flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition hover:opacity-90 ${
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
          className={`welcome-slide-control inline-flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition hover:opacity-90 ${
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
