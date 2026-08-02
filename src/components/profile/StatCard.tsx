import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  value: number | string
  label: string
}

export default function StatCard({ icon: Icon, value, label }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-ink">{value}</p>
      <p className="mt-0.5 text-sm text-muted">{label}</p>
    </div>
  )
}
