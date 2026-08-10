import { Mic, Trophy, Users } from 'lucide-react'

const STEPS = [
  {
    icon: Users,
    title: 'Choose a session',
    body: 'Pick a topic and level that matches your goals.',
  },
  {
    icon: Mic,
    title: 'Join the live session',
    body: 'Hop into Google Meet with your host and peers.',
  },
  {
    icon: Trophy,
    title: 'Practice & improve',
    body: 'Speak every week and track your fluency gains.',
  },
]

export default function HowItWorksCard() {
  return (
    <aside className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900">How it works</h3>
      <ol className="mt-4 space-y-4">
        {STEPS.map((step, i) => {
          const Icon = step.icon
          return (
            <li key={step.title} className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  <span className="text-indigo-500">{i + 1}. </span>
                  {step.title}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{step.body}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </aside>
  )
}
