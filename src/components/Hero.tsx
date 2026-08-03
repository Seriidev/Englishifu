import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'

type Phase = 'typing' | 'pausing' | 'deleting'

const AVATAR_IMAGES = [
  'https://i.pravatar.cc/80?img=5',
  'https://i.pravatar.cc/80?img=12',
  'https://i.pravatar.cc/80?img=32',
] as const

function renderTypedText(fullText: string, displayed: string, highlight: string): ReactNode {
  const highlightStart = fullText.indexOf(highlight)
  const highlightEnd = highlightStart + highlight.length

  if (highlightStart === -1 || displayed.length <= highlightStart) {
    return displayed
  }

  const before = displayed.slice(0, highlightStart)
  const highlighted = displayed.slice(
    highlightStart,
    Math.min(displayed.length, highlightEnd),
  )
  const after =
    displayed.length > highlightEnd ? displayed.slice(highlightEnd) : ''

  return (
    <>
      {before}
      <span className="font-extrabold text-brand">{highlighted}</span>
      {after}
    </>
  )
}

export default function Hero() {
  const { t, lang } = useLanguage()
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [phase, setPhase] = useState<Phase>('typing')

  const phrases = useMemo(
    () => [
      { text: t('hero.phrase1'), highlight: t('hero.phrase1Highlight') },
      { text: t('hero.phrase2'), highlight: t('hero.phrase2Highlight') },
      { text: t('hero.phrase3'), highlight: t('hero.phrase3Highlight') },
    ],
    [t, lang],
  )

  const current = phrases[phraseIndex] ?? phrases[0]

  useEffect(() => {
    setPhraseIndex(0)
    setDisplayed('')
    setPhase('typing')
  }, [lang])

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
  }, [displayed, phase, current.text, phrases.length])

  return (
    <section
      id="home"
      className="relative flex min-h-[min(72svh,40rem)] items-center overflow-hidden pt-28 pb-8 text-ink sm:pt-32 sm:pb-10"
    >
      <div
        className="pointer-events-none absolute -top-24 left-[-10%] h-[28rem] w-[28rem] rounded-full bg-[#b8d4ff]/45 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-10 right-[-8%] h-[24rem] w-[24rem] rounded-full bg-[#c4b5fd]/30 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-8 left-1/3 h-72 w-72 rounded-full bg-[#dbeafe]/60 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-6 text-center">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex -space-x-3">
            {AVATAR_IMAGES.map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                className="h-11 w-11 rounded-full border-[3px] border-white object-cover shadow-md shadow-brand/10"
              />
            ))}
          </div>
          <p className="text-sm font-medium text-muted">{t('hero.reviews')}</p>
        </div>

        <h1 className="min-h-[3.5rem] max-w-2xl text-4xl font-bold leading-[1.15] tracking-tight text-ink sm:min-h-[4.5rem] sm:text-5xl lg:text-[3.4rem]">
          {renderTypedText(current.text, displayed, current.highlight)}
          <span
            className="ml-0.5 inline-block h-[0.9em] w-[3px] translate-y-[0.1em] animate-cursor-blink bg-brand align-baseline"
            aria-hidden
          />
        </h1>

        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          {t('hero.body')}
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/toefl"
            className="group inline-flex items-center gap-3 rounded-full bg-brand px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark"
          >
            {t('hero.ctaDemo')}
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-brand transition group-hover:translate-x-0.5">
              <ArrowRight className="h-4 w-4" aria-hidden />
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}
