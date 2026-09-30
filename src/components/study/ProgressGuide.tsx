import { useEffect, type ReactNode } from 'react'
import { Sparkles, type LucideIcon } from 'lucide-react'

export type GuideRow = {
  icon: LucideIcon
  title: string
  badge: string
  tone: 'added' | 'deducted'
  text: string
}

export default function ProgressGuide({
  title,
  intro,
  rows,
  onClose,
  extra,
}: {
  title: string
  intro: string
  rows: GuideRow[]
  onClose: () => void
  extra?: ReactNode
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-label={title}
      className="absolute top-full right-0 z-50 mt-2 max-h-[min(32rem,calc(100vh-5.5rem))] w-80 max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-2xl border border-slate-100 bg-white shadow-lg"
    >
      <div className="sticky top-0 border-b border-slate-100 bg-white px-3 py-2">
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          {title}
        </p>
      </div>
      <div className="px-3 py-3">
        <p className="text-sm leading-relaxed text-slate-500">{intro}</p>
        <ul className="mt-3 space-y-3">
          {rows.map((row) => {
            const Icon = row.icon
            return (
              <li key={row.title} className="flex gap-2.5">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" aria-hidden />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">{row.title}</p>
                  <p className="mt-1 text-xs leading-snug text-slate-500">
                    <span
                      className={`mr-1.5 inline-block rounded px-1.5 py-0.5 align-middle text-[10px] font-bold tracking-wide text-white uppercase ${
                        row.tone === 'deducted' ? 'bg-rose-500' : 'bg-indigo-500'
                      }`}
                    >
                      {row.badge}
                    </span>
                    {row.text}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
        {extra}
        <button
          type="button"
          onClick={onClose}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          Understood
        </button>
      </div>
    </div>
  )
}
