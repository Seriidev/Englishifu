import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

export interface QuickActionCardProps {
  illustration: ReactNode
  title: string
  description: string
  avatarStack?: string[]
  metaText: string
  metaColor: 'indigo' | 'orange'
  ctaLabel: string
  ctaPath: string
  accentBg: string
}

const metaStyles = {
  indigo: 'text-indigo-600',
  orange: 'text-orange-600',
} as const

export default function QuickActionCard({
  illustration,
  title,
  description,
  avatarStack,
  metaText,
  metaColor,
  ctaLabel,
  ctaPath,
  accentBg,
}: QuickActionCardProps) {
  return (
    <Link
      to={ctaPath}
      className={`group relative flex min-h-[180px] flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 p-5 shadow-sm transition hover:shadow-md ${accentBg}`}
    >
      <span className="absolute top-4 right-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition group-hover:bg-slate-900 group-hover:text-white">
        <ArrowUpRight className="h-4 w-4" aria-hidden />
        <span className="sr-only">{ctaLabel}</span>
      </span>

      <div className="pr-12">
        <div className="mb-3">{illustration}</div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {avatarStack && avatarStack.length > 0 ? (
          <div className="flex -space-x-2">
            {avatarStack.slice(0, 4).map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                className="h-7 w-7 rounded-full border-2 border-white object-cover"
              />
            ))}
          </div>
        ) : null}
        <span className={`text-xs font-semibold ${metaStyles[metaColor]}`}>
          {metaText}
        </span>
      </div>
    </Link>
  )
}
