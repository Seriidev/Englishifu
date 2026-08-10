import type { LucideIcon } from 'lucide-react'

function Sparkline({
  data,
  stroke = '#6366f1',
}: {
  data: number[]
  stroke?: string
}) {
  if (data.length < 2) return null

  const width = 72
  const height = 32
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data
    .map((value, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((value - min) / range) * (height - 4) - 2
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-8 w-[72px] shrink-0"
      aria-hidden
    >
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

export interface StudyStatCardProps {
  icon: LucideIcon
  iconBg: string
  iconColor: string
  label: string
  value: string | number
  trend: string
  trendPositive: boolean
  sparkline: number[]
  sparkStroke?: string
}

export default function StudyStatCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  trend,
  trendPositive,
  sparkline,
  sparkStroke = '#6366f1',
}: StudyStatCardProps) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <Sparkline data={sparkline} stroke={sparkStroke} />
      </div>
      <p className="mt-3 text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
      <p
        className={`mt-1 text-xs font-medium ${
          trendPositive ? 'text-emerald-600' : 'text-red-500'
        }`}
      >
        {trend}
      </p>
    </article>
  )
}
