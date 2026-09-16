import { Mic, MessageSquarePlus, Users } from 'lucide-react'

const STEPS = [
  {
    icon: MessageSquarePlus,
    title: 'Request a club',
    body: 'Tell us the topic, level, and time that work for you.',
  },
  {
    icon: Users,
    title: 'We set it up',
    body: 'A host opens a session that matches what students asked for.',
  },
  {
    icon: Mic,
    title: 'Join and speak',
    body: 'When it goes live, hop into the meeting and practice.',
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
                  <span className="text-indigo-600">{i + 1}. </span>
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
