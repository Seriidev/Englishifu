import { useState } from 'react'
import { Check, Clock } from 'lucide-react'

const benefits = [
  'Real TOEFL questions',
  'Timed simulation',
  'Instant scoring & feedback',
  'Analyze your performance',
] as const

const options = [
  { key: 'A', text: 'The author argues that climate policy needs broader support.' },
  { key: 'B', text: 'The passage focuses only on economic growth in cities.' },
  { key: 'C', text: 'The main idea is unrelated to environmental concerns.' },
  { key: 'D', text: 'The writer rejects the value of scientific research.' },
] as const

export default function ToeflSimulation() {
  const [selected, setSelected] = useState<string | null>('A')

  return (
    <section id="toefl" className="bg-brand-light/60 py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
        <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-lg shadow-brand/5 sm:p-6">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand">
              Reading · Question 3/10
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
              <Clock className="h-4 w-4 text-brand" aria-hidden />
              14:32
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full w-[30%] rounded-full bg-brand" />
          </div>

          <p className="mt-5 text-sm font-semibold leading-relaxed text-ink sm:text-base">
            According to the passage, what is the author&apos;s primary argument
            about sustainable urban development?
          </p>

          <div className="mt-4 space-y-2.5">
            {options.map((opt) => {
              const active = selected === opt.key
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setSelected(opt.key)}
                  className={`flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left text-sm transition ${
                    active
                      ? 'border-brand bg-brand-light text-ink'
                      : 'border-gray-200 bg-white text-muted hover:border-brand/40'
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      active ? 'bg-brand text-white' : 'bg-gray-100 text-ink'
                    }`}
                  >
                    {opt.key}
                  </span>
                  <span className="pt-0.5">{opt.text}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Try a Free TOEFL Simulation
          </h2>

          <ul className="mt-6 space-y-3">
            {benefits.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-ink sm:text-base">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                  <Check className="h-3.5 w-3.5" aria-hidden />
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#toefl"
              className="rounded-full bg-brand px-8 py-4 text-base font-semibold text-white shadow-md shadow-brand/25 transition hover:bg-brand-dark"
            >
              Start Free Simulation
            </a>
            <span className="text-base text-muted">No registration required</span>
          </div>
        </div>
      </div>
    </section>
  )
}
