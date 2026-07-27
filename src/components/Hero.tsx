import { useEffect, useState, type ReactNode } from 'react'
import { ArrowRight, GraduationCap, Play } from 'lucide-react'

const phrases = [
  { text: 'Prepare TOEFL with us.', highlight: 'TOEFL' },
  { text: 'Find your Personal tutor.', highlight: 'Personal' },
  { text: 'Enjoy with Speaking Club.', highlight: 'Speaking Club' },
] as const

type Phase = 'typing' | 'pausing' | 'deleting'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80'

const AVATAR_IMAGES = [
  'https://i.pravatar.cc/80?img=5',
  'https://i.pravatar.cc/80?img=12',
  'https://i.pravatar.cc/80?img=32',
  'https://i.pravatar.cc/80?img=47',
] as const

const stats = [
  { value: '500+', label: 'Expert Tutors' },
  { value: '10K+', label: 'Students' },
  { value: '4.8', label: 'Rating' },
] as const

function renderTypedText(fullText: string, displayed: string, highlight: string): ReactNode {
  const highlightStart = fullText.indexOf(highlight)
  const highlightEnd = highlightStart + highlight.length

  if (highlightStart === -1 || displayed.length <= highlightStart) {
    return displayed
  }

  const before = displayed.slice(0, highlightStart)
  const highlighted = displayed.slice(highlightStart, Math.min(displayed.length, highlightEnd))
  const after =
    displayed.length > highlightEnd ? displayed.slice(highlightEnd) : ''

  return (
    <>
      {before}
      <span className="font-extrabold text-white">{highlighted}</span>
      {after}
    </>
  )
}

export default function Hero() {
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [phase, setPhase] = useState<Phase>('typing')

  const current = phrases[phraseIndex]

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>

    if (phase === 'typing') {
      if (displayed.length < current.text.length) {
        timeoutId = setTimeout(() => {
          setDisplayed(current.text.slice(0, displayed.length + 1))
        }, 70)
      } else {
        timeoutId = setTimeout(() => setPhase('pausing'), 0)
      }
    } else if (phase === 'pausing') {
      timeoutId = setTimeout(() => setPhase('deleting'), 1500)
    } else if (phase === 'deleting') {
      if (displayed.length > 0) {
        timeoutId = setTimeout(() => {
          setDisplayed(displayed.slice(0, -1))
        }, 35)
      } else {
        timeoutId = setTimeout(() => {
          setPhraseIndex((i) => (i + 1) % phrases.length)
          setPhase('typing')
        }, 0)
      }
    }

    return () => clearTimeout(timeoutId)
  }, [displayed, phase, current.text])

  return (
    <section id="home" className="bg-brand text-white">
      <div className="mx-auto max-w-7xl px-6 py-14 sm:py-16 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-14 xl:gap-16">
          {/* Left — text */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="mb-5 flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand shadow-lg shadow-black/10">
                <GraduationCap className="h-5 w-5" aria-hidden />
              </span>
            </div>

            <h1 className="flex min-h-[3.5rem] items-center justify-center text-4xl font-bold leading-tight tracking-tight text-white sm:min-h-[4.5rem] sm:text-5xl lg:min-h-[5.5rem] lg:justify-start lg:text-[3.25rem]">
              <span>
                {renderTypedText(current.text, displayed, current.highlight)}
                <span
                  className="ml-0.5 inline-block h-[0.9em] w-[3px] translate-y-[0.1em] animate-cursor-blink bg-white align-baseline"
                  aria-hidden
                />
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
              Connect with expert personal tutors, prepare for TOEFL with
              confidence, and join speaking clubs that build real fluency —
              all in one platform designed for ambitious learners.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <a
                href="#tutors"
                className="group inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-4 text-lg font-semibold text-brand shadow-md shadow-black/10 transition hover:bg-brand-light"
              >
                Let&apos;s go!
                <ArrowRight
                  className="h-5 w-5 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </a>

              <a
                href="#toefl"
                className="inline-flex items-center gap-3 rounded-full border border-white/40 px-6 py-3.5 text-base font-semibold text-white transition hover:border-white/70 hover:bg-white/10"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                  <Play className="h-4 w-4 fill-current" aria-hidden />
                </span>
                Watch Demo
              </a>
            </div>

            <div className="mt-10 grid w-full max-w-md grid-cols-3 gap-4 lg:max-w-none lg:gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <p className="text-2xl font-bold text-white sm:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-blue-100 sm:text-sm">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — image */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none lg:pb-4">
            <img
              src={HERO_IMAGE}
              alt="Students learning together in a language course"
              width={800}
              height={1000}
              className="aspect-[4/5] w-full rounded-3xl object-cover shadow-xl shadow-black/20"
            />

            {/* Reviews badge — desktop only */}
            <div className="absolute -top-4 -left-4 z-10 hidden items-center gap-3 rounded-2xl bg-white px-3.5 py-2.5 shadow-xl lg:flex">
              <div className="flex -space-x-2">
                {AVATAR_IMAGES.map((src) => (
                  <img
                    key={src}
                    src={src}
                    alt=""
                    className="h-8 w-8 rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
              <p className="text-sm font-semibold whitespace-nowrap text-ink">
                500+ reviews
              </p>
            </div>

            {/* Student result card — desktop only */}
            <div className="absolute -right-4 -bottom-2 z-10 hidden items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-xl lg:flex xl:-right-6">
              <img
                src="https://i.pravatar.cc/80?img=47"
                alt=""
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-bold text-ink">Sarah K.</p>
                <p className="text-xs font-medium text-brand">
                  TOEFL Score: 112
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
