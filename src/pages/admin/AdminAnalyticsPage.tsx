import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { BarChart3 } from 'lucide-react'
import {
  fetchAdminAnalytics,
  type AdminAnalytics,
} from '../../utils/adminPanelApi'
import { adminCard, adminMuted, adminPageTitle } from './adminUi'

type Days = 7 | 30 | 90

function dayLabel(iso: string) {
  if (!iso) return ''
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

function rangeLabel(from: string, to: string) {
  return `${dayLabel(from)} — ${dayLabel(to)}`
}

function percent(n: number, total: number) {
  if (!total) return 0
  return Math.round((n / total) * 1000) / 10
}

function LineChart({ values, color = '#4F46E5' }: { values: number[]; color?: string }) {
  const w = 560
  const h = 180
  const px = 8
  const py = 12
  const max = Math.max(1, ...values)
  const min = Math.min(0, ...values)
  const span = Math.max(1, max - min)
  const pts = values.map((v, i) => {
    const x = px + (values.length <= 1 ? 0 : (i / (values.length - 1)) * (w - px * 2))
    const y = py + (1 - (v - min) / span) * (h - py * 2)
    return `${x},${y}`
  })
  const area = `${px},${h - py} ${pts.join(' ')} ${w - px},${h - py}`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-44 w-full">
      {[0.25, 0.5, 0.75].map((t) => (
        <line key={t} x1={px} x2={w - px} y1={py + t * (h - py * 2)} y2={py + t * (h - py * 2)} stroke="#E4E4E7" />
      ))}
      <polygon points={area} fill={color} opacity="0.08" />
      <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" points={pts.join(' ')} />
    </svg>
  )
}

function DualLineChart({
  a,
  b,
}: {
  a: number[]
  b: number[]
}) {
  const w = 560
  const h = 180
  const px = 8
  const py = 12
  const max = Math.max(1, ...a, ...b)
  const pts = (values: number[]) =>
    values
      .map((v, i) => {
        const x = px + (values.length <= 1 ? 0 : (i / (values.length - 1)) * (w - px * 2))
        const y = py + (1 - v / max) * (h - py * 2)
        return `${x},${y}`
      })
      .join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-44 w-full">
      {[0.25, 0.5, 0.75].map((t) => (
        <line key={t} x1={px} x2={w - px} y1={py + t * (h - py * 2)} y2={py + t * (h - py * 2)} stroke="#E4E4E7" />
      ))}
      <polyline fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinejoin="round" points={pts(a)} />
      <polyline fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinejoin="round" points={pts(b)} />
    </svg>
  )
}

function StackedBars({ series }: { series: Array<{ link: number; referral: number }> }) {
  const w = 560
  const h = 180
  const px = 10
  const py = 12
  const max = Math.max(1, ...series.map((s) => s.link + s.referral))
  const gap = 2
  const barW = Math.max(2, (w - px * 2) / Math.max(1, series.length) - gap)
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-44 w-full">
      {[0.25, 0.5, 0.75].map((t) => (
        <line key={t} x1={px} x2={w - px} y1={py + t * (h - py * 2)} y2={py + t * (h - py * 2)} stroke="#E4E4E7" />
      ))}
      {series.map((s, i) => {
        const x = px + i * (barW + gap)
        const hLink = (s.link / max) * (h - py * 2)
        const hRef = (s.referral / max) * (h - py * 2)
        const yLink = h - py - hLink
        return (
          <g key={i}>
            <rect x={x} y={yLink} width={barW} height={hLink} fill="#818CF8" rx="1" />
            <rect x={x} y={yLink - hRef} width={barW} height={hRef} fill="#4F46E5" rx="1" />
          </g>
        )
      })}
    </svg>
  )
}

function HourChart({ hours }: { hours: Array<{ hour: number; count: number }> }) {
  const w = 560
  const h = 160
  const px = 8
  const py = 12
  const max = Math.max(1, ...hours.map((x) => x.count))
  const pts = hours
    .map((item, i) => {
      const x = px + (i / 23) * (w - px * 2)
      const y = py + (1 - item.count / max) * (h - py * 2)
      return `${x},${y}`
    })
    .join(' ')
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-40 w-full">
        <line x1={px} x2={w - px} y1={py + 0.5 * (h - py * 2)} y2={py + 0.5 * (h - py * 2)} stroke="#E4E4E7" />
        <polyline fill="none" stroke="#4F46E5" strokeWidth="2.5" strokeLinejoin="round" points={pts} />
      </svg>
      <div className="mt-1 flex justify-between px-1 text-[10px] text-zinc-400">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>23:00</span>
      </div>
    </div>
  )
}

function Chip({
  active,
  color,
  children,
  onClick,
}: {
  active: boolean
  color: string
  children: ReactNode
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-semibold transition ${
        active ? 'text-white' : 'bg-white text-zinc-600 ring-1 ring-zinc-200'
      }`}
      style={active ? { backgroundColor: color } : undefined}
    >
      {active ? <span aria-hidden>✓</span> : null}
      {children}
    </button>
  )
}

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState<Days>(30)
  const [data, setData] = useState<AdminAnalytics | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showJoined, setShowJoined] = useState(true)
  const [showLeft, setShowLeft] = useState(true)
  const [showLink, setShowLink] = useState(true)
  const [showRef, setShowRef] = useState(true)

  useEffect(() => {
    let cancelled = false
    setError(null)
    void fetchAdminAnalytics(days)
      .then((next) => {
        if (!cancelled) setData(next)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load')
        }
      })
    return () => {
      cancelled = true
    }
  }, [days])

  const overview = data?.overview
  const peak = useMemo(() => {
    if (!data?.activityByHour.length) return null
    return data.activityByHour.reduce((best, cur) =>
      cur.count > best.count ? cur : best,
    )
  }, [data])

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className={adminPageTitle}>Analytics</h1>
          <p className={`mt-1.5 ${adminMuted}`}>
            Users · joined / left / inactive · peak hours · link vs referral · countries
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-zinc-200 bg-white p-1">
          {([7, 30, 90] as Days[]).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setDays(n)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                days === n ? 'bg-indigo-500 text-white' : 'text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              {n}d
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>
      ) : null}

      <section className={`${adminCard} mt-6 p-5`}>
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-indigo-500" aria-hidden />
          <div>
            <h2 className="text-sm font-semibold text-indigo-600">Overview</h2>
            <p className="text-xs text-zinc-400">
              {data ? rangeLabel(data.range.from, data.range.to) : 'Loading…'}
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="flex flex-wrap items-baseline gap-x-2 font-serif text-2xl font-semibold text-zinc-900 sm:text-3xl">
              <span>{overview?.users ?? '—'}</span>
              {overview && overview.joinedDelta !== 0 ? (
                <span
                  className={`text-sm font-semibold ${
                    overview.joinedDelta > 0 ? 'text-emerald-600' : 'text-red-500'
                  }`}
                >
                  {overview.joinedDelta > 0 ? '+' : ''}
                  {overview.joinedDelta} ({overview.joinedGrowthPct}%)
                </span>
              ) : null}
            </p>
            <p className="mt-1 text-xs text-zinc-500">Users</p>
          </div>
          <div>
            <p className="font-serif text-3xl font-semibold text-zinc-900">
              {overview?.joinedPeriod ?? '—'}
            </p>
            <p className="mt-1 text-xs text-zinc-500">Joined</p>
          </div>
          <div>
            <p className="font-serif text-3xl font-semibold text-zinc-900">
              {overview?.leftPeriod ?? '—'}
            </p>
            <p className="mt-1 text-xs text-zinc-500">Left (suspended)</p>
          </div>
          <div>
            <p className="font-serif text-3xl font-semibold text-zinc-900">
              {overview?.inactive ?? '—'}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Inactive ({data?.range.inactiveAfterDays ?? 14}+ days)
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-zinc-50 px-3 py-2">
            <p className="text-lg font-semibold text-zinc-900">{overview?.active ?? '—'}</p>
            <p className="text-xs text-zinc-500">Active now</p>
          </div>
          <div className="rounded-lg bg-zinc-50 px-3 py-2">
            <p className="text-lg font-semibold text-zinc-900">
              {peak ? `${String(peak.hour).padStart(2, '0')}:00` : '—'}
            </p>
            <p className="text-xs text-zinc-500">Peak activity (UTC)</p>
          </div>
          <div className="rounded-lg bg-zinc-50 px-3 py-2">
            <p className="text-lg font-semibold text-zinc-900">
              {data
                ? `${data.countries.foreigners} foreign / ${data.countries.home} home`
                : '—'}
            </p>
            <p className="text-xs text-zinc-500">
              Home = {data?.range.homeCountry ?? 'Turkmenistan'}
            </p>
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className={`${adminCard} p-5`}>
          <h2 className="text-sm font-semibold text-indigo-600">Growth</h2>
          <p className="text-xs text-zinc-400">
            {data ? rangeLabel(data.range.from, data.range.to) : '…'}
          </p>
          {data ? (
            <div className="mt-3">
              <LineChart values={data.growth.map((g) => g.users)} />
              <div className="mt-2 flex justify-between text-[10px] text-zinc-400">
                <span>{dayLabel(data.growth[0]?.day ?? '')}</span>
                <span>{dayLabel(data.growth[data.growth.length - 1]?.day ?? '')}</span>
              </div>
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-zinc-400">Loading…</p>
          )}
        </section>

        <section className={`${adminCard} p-5`}>
          <h2 className="text-sm font-semibold text-indigo-600">Users</h2>
          <p className="text-xs text-zinc-400">
            {data ? rangeLabel(data.range.from, data.range.to) : '…'}
          </p>
          {data ? (
            <div className="mt-3">
              <DualLineChart
                a={showJoined ? data.usersFlow.map((u) => u.joined) : data.usersFlow.map(() => 0)}
                b={showLeft ? data.usersFlow.map((u) => u.left) : data.usersFlow.map(() => 0)}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip active={showJoined} color="#22C55E" onClick={() => setShowJoined((v) => !v)}>
                  Joined
                </Chip>
                <Chip active={showLeft} color="#EF4444" onClick={() => setShowLeft((v) => !v)}>
                  Left
                </Chip>
              </div>
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-zinc-400">Loading…</p>
          )}
        </section>

        <section className={`${adminCard} p-5`}>
          <h2 className="text-sm font-semibold text-indigo-600">Activity by hours (UTC)</h2>
          <p className="text-xs text-zinc-400">Lesson bookings in the selected range</p>
          {data ? (
            <div className="mt-3">
              <HourChart hours={data.activityByHour} />
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-zinc-400">Loading…</p>
          )}
        </section>

        <section className={`${adminCard} p-5`}>
          <h2 className="text-sm font-semibold text-indigo-600">Signups by source</h2>
          <p className="text-xs text-zinc-400">
            {data ? rangeLabel(data.range.from, data.range.to) : '…'}
          </p>
          {data ? (
            <div className="mt-3">
              <StackedBars
                series={data.sources.series.map((s) => ({
                  link: showLink ? s.link : 0,
                  referral: showRef ? s.referral : 0,
                }))}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip active={showLink} color="#818CF8" onClick={() => setShowLink((v) => !v)}>
                  Link ({data.sources.totals.link})
                </Chip>
                <Chip active={showRef} color="#4F46E5" onClick={() => setShowRef((v) => !v)}>
                  Referral ({data.sources.totals.referral})
                </Chip>
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                Referral{' '}
                {percent(
                  data.sources.totals.referral,
                  data.sources.totals.referral + data.sources.totals.link,
                )}
                % · Direct link{' '}
                {percent(
                  data.sources.totals.link,
                  data.sources.totals.referral + data.sources.totals.link,
                )}
                %
              </p>
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-zinc-400">Loading…</p>
          )}
        </section>
      </div>

      <section className={`${adminCard} mt-4 p-5`}>
        <h2 className="text-sm font-semibold text-indigo-600">Countries</h2>
        <p className="text-xs text-zinc-400">
          From profile · foreigners = not {data?.range.homeCountry ?? 'Turkmenistan'}
        </p>
        {data ? (
          <div className="mt-4 grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
            <div className="space-y-3">
              <div className="rounded-xl bg-indigo-50 px-4 py-3">
                <p className="font-serif text-2xl font-semibold text-indigo-700">
                  {data.countries.foreigners}
                </p>
                <p className="text-xs font-medium text-indigo-600">Foreigners</p>
              </div>
              <div className="rounded-xl bg-zinc-50 px-4 py-3">
                <p className="font-serif text-2xl font-semibold text-zinc-900">
                  {data.countries.home}
                </p>
                <p className="text-xs text-zinc-500">{data.range.homeCountry}</p>
              </div>
              <div className="rounded-xl bg-zinc-50 px-4 py-3">
                <p className="font-serif text-2xl font-semibold text-zinc-900">
                  {data.countries.unknown}
                </p>
                <p className="text-xs text-zinc-500">Country not set</p>
              </div>
            </div>
            <ul className="space-y-2.5">
              {data.countries.top.length === 0 ? (
                <li className="py-8 text-center text-sm text-zinc-400">No country data yet</li>
              ) : (
                data.countries.top.map((row) => {
                  const max = data.countries.top[0]?.count || 1
                  return (
                    <li key={row.country}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium text-zinc-800">
                          {row.country}
                          {row.isHome ? (
                            <span className="ml-2 text-[10px] font-semibold tracking-wide text-indigo-500 uppercase">
                              home
                            </span>
                          ) : null}
                          {row.isForeign ? (
                            <span className="ml-2 text-[10px] font-semibold tracking-wide text-emerald-600 uppercase">
                              foreign
                            </span>
                          ) : null}
                        </span>
                        <span className="text-zinc-400">{row.count}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
                        <div
                          className={`h-full rounded-full ${
                            row.isHome
                              ? 'bg-indigo-500'
                              : row.isForeign
                                ? 'bg-emerald-500'
                                : 'bg-zinc-300'
                          }`}
                          style={{ width: `${Math.round((row.count / max) * 100)}%` }}
                        />
                      </div>
                    </li>
                  )
                })
              )}
            </ul>
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-zinc-400">Loading…</p>
        )}
      </section>
    </div>
  )
}
