import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  Clock,
  GraduationCap,
  Mail,
  UserCheck,
  Users,
} from 'lucide-react'
import {
  fetchAdminConsultations,
  fetchAdminOverview,
} from '../../utils/adminPanelApi'
import { adminCard, adminMuted, adminPageTitle } from './adminUi'
import { StatusBadge } from '../../components/shared/StatusBadge'

const STATS: {
  key: keyof Awaited<ReturnType<typeof fetchAdminOverview>>
  label: string
  hint: string
  href: string
  icon: typeof Users
  iconClass: string
}[] = [
  {
    key: 'students',
    label: 'Students',
    hint: 'All time',
    href: '/admin/students',
    icon: GraduationCap,
    iconClass: 'bg-blue-50 text-blue-600',
  },
  {
    key: 'tutors',
    label: 'Tutors',
    hint: 'Approved',
    href: '/admin/tutors/directory',
    icon: Users,
    iconClass: 'bg-orange-50 text-orange-600',
  },
  {
    key: 'pendingApplications',
    label: 'Pending',
    hint: 'Awaiting review',
    href: '/admin/tutors',
    icon: UserCheck,
    iconClass: 'bg-amber-50 text-amber-600',
  },
  {
    key: 'bookingsThisWeek',
    label: 'Bookings',
    hint: 'This week',
    href: '/admin',
    icon: BookOpen,
    iconClass: 'bg-emerald-50 text-emerald-600',
  },
]

export default function AdminOverviewPage() {
  const [data, setData] = useState<Awaited<
    ReturnType<typeof fetchAdminOverview>
  > | null>(null)
  const [requests, setRequests] = useState<Array<Record<string, unknown>>>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void Promise.all([fetchAdminOverview(), fetchAdminConsultations()])
      .then(([overview, consults]) => {
        setData(overview)
        setRequests(consults.slice(0, 6))
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load'),
      )
  }, [])

  const bars = data
    ? [
        {
          label: 'Pending applications',
          value: data.pendingApplications,
          color: 'bg-amber-400',
        },
        {
          label: 'New requests',
          value: data.newConsultationRequests,
          color: 'bg-blue-500',
        },
        {
          label: 'Pending referrals',
          value: data.pendingReferrals,
          color: 'bg-zinc-400',
        },
      ]
    : []
  const barMax = Math.max(1, ...bars.map((b) => b.value))

  return (
    <div>
      <h1 className={adminPageTitle}>Dashboard</h1>
      <p className={`mt-1.5 ${adminMuted}`}>
        Welcome back, admin@englishcore.com
        <span className="ml-2 inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-zinc-500 uppercase">
          Super admin
        </span>
      </p>
      {error ? (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {error}
        </p>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.key}
              to={stat.href}
              className={`${adminCard} p-5 transition hover:border-zinc-300`}
            >
              <div className="flex items-start justify-between">
                <p className="text-sm text-zinc-500">{stat.label}</p>
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${stat.iconClass}`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </span>
              </div>
              <p className="mt-3 font-serif text-3xl font-semibold text-zinc-900">
                {data ? data[stat.key] ?? 0 : '—'}
              </p>
              <p className="mt-1 text-xs text-zinc-400">{stat.hint}</p>
            </Link>
          )
        })}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className={`${adminCard} p-5`}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">
              Recent requests
            </h2>
            <Link
              to="/admin/requests"
              className="text-xs font-medium text-zinc-400 hover:text-zinc-700"
            >
              View all
            </Link>
          </div>
          {requests.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-400">
              No consultation requests yet.
            </p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {requests.map((row) => (
                <li
                  key={String(row.id)}
                  className="flex items-center justify-between py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900">
                      {String(row.full_name)}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {row.created_at
                        ? new Date(String(row.created_at)).toLocaleDateString()
                        : ''}
                      {row.learning_goal
                        ? ` · ${String(row.learning_goal)}`
                        : ''}
                    </p>
                  </div>
                  <StatusBadge status={String(row.status || 'new')} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={`${adminCard} p-5`}>
          <h2 className="text-sm font-semibold text-zinc-900">
            Status overview
          </h2>
          <ul className="mt-5 space-y-4">
            {bars.map((bar) => (
              <li key={bar.label}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-zinc-600">{bar.label}</span>
                  <span className="text-zinc-400">
                    {bar.value} ({Math.round((bar.value / barMax) * 100)}%)
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className={`h-full rounded-full ${bar.color}`}
                    style={{ width: `${Math.round((bar.value / barMax) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-6 flex items-center gap-2 text-xs text-zinc-400">
            <Mail className="h-3.5 w-3.5" aria-hidden />
            {data?.newConsultationRequests ?? 0} new landing requests
          </p>
          <p className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            Revenue appears when payments go live
          </p>
        </section>
      </div>
    </div>
  )
}
