import { useCallback, useId, useMemo, useRef, useState } from 'react'
import type { TutorKpiChart, TutorKPI } from '../../types/tutorProfile'

const PRIMARY = '#34d399' // bright green
const SECONDARY = '#2dd4bf' // teal
const BAND = 'rgba(52, 211, 153, 0.12)'

const W = 720
const H = 320
const PAD = { top: 24, right: 16, bottom: 36, left: 48 }

function formatDayLabel(iso: string): string {
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
}

function formatShort(iso: string): string {
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
}

function formatValue(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

function buildPath(
  points: { x: number; y: number }[],
  closeToBaseline: number | null,
): string {
  if (points.length === 0) return ''
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const cpx = (prev.x + curr.x) / 2
    d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`
  }
  if (closeToBaseline != null) {
    const last = points[points.length - 1]
    const first = points[0]
    d += ` L ${last.x} ${closeToBaseline} L ${first.x} ${closeToBaseline} Z`
  }
  return d
}

interface KPITabProps {
  kpis: TutorKPI[]
  chart: TutorKpiChart
}

export default function KPITab({ kpis, chart }: KPITabProps) {
  const uid = useId().replace(/:/g, '')
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const { points } = chart
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom

  const { minY, maxY, yTicks, primaryPts, secondaryPts } = useMemo(() => {
    const vals = points.flatMap((p) => [p.primary, p.secondary])
    const rawMax = Math.max(...vals, 1)
    const rawMin = Math.min(...vals, 0)
    const pad = (rawMax - rawMin) * 0.15 || 2
    const maxY = Math.ceil((rawMax + pad) / 5) * 5
    const minY = Math.max(0, Math.floor((rawMin - pad) / 5) * 5)
    const step = (maxY - minY) / 4 || 1
    const yTicks = Array.from({ length: 5 }, (_, i) =>
      Math.round((maxY - step * i) * 10) / 10,
    )

    const xAt = (i: number) =>
      PAD.left + (points.length <= 1 ? innerW / 2 : (i / (points.length - 1)) * innerW)
    const yAt = (v: number) =>
      PAD.top + ((maxY - v) / (maxY - minY || 1)) * innerH

    return {
      minY,
      maxY,
      yTicks,
      primaryPts: points.map((p, i) => ({ x: xAt(i), y: yAt(p.primary) })),
      secondaryPts: points.map((p, i) => ({
        x: xAt(i),
        y: yAt(p.secondary),
      })),
    }
  }, [points, innerW, innerH])

  const primaryLine = buildPath(primaryPts, null)
  const secondaryLine = buildPath(secondaryPts, null)
  const primaryArea = buildPath(primaryPts, PAD.top + innerH)
  const secondaryArea = buildPath(secondaryPts, PAD.top + innerH)

  const onMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current
      if (!svg || points.length === 0) return
      const rect = svg.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * W
      const clamped = Math.max(PAD.left, Math.min(PAD.left + innerW, x))
      const t =
        points.length <= 1
          ? 0
          : (clamped - PAD.left) / innerW
      const idx = Math.round(t * (points.length - 1))
      setHoverIndex(idx)
    },
    [points.length, innerW],
  )

  const active = hoverIndex != null ? points[hoverIndex] : null
  const activeX =
    hoverIndex != null && primaryPts[hoverIndex]
      ? primaryPts[hoverIndex].x
      : null

  const firstDate = points[0]?.date
  const lastDate = points[points.length - 1]?.date

  if (points.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-6 py-12 text-center">
        <p className="text-base font-semibold text-ink">No KPI data yet</p>
        <p className="mt-1 text-sm text-muted">
          Metrics will appear as you teach more lessons.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="relative px-3 pt-4 pb-2 sm:px-5">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full touch-pan-y"
            role="img"
            aria-label={`${chart.title} chart`}
            onMouseMove={onMove}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <defs>
              <linearGradient
                id={`grad-p-${uid}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={PRIMARY} stopOpacity="0.45" />
                <stop offset="100%" stopColor={PRIMARY} stopOpacity="0.02" />
              </linearGradient>
              <linearGradient
                id={`grad-s-${uid}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={SECONDARY} stopOpacity="0.4" />
                <stop offset="100%" stopColor={SECONDARY} stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Vertical grid */}
            {points
              .filter((_, i) => i % Math.ceil(points.length / 8) === 0)
              .map((_, gi) => {
                const i = gi * Math.ceil(points.length / 8)
                const x = primaryPts[i]?.x
                if (x == null) return null
                return (
                  <line
                    key={`g-${i}`}
                    x1={x}
                    y1={PAD.top}
                    x2={x}
                    y2={PAD.top + innerH}
                    stroke="#e5e7eb"
                    strokeDasharray="3 5"
                    strokeWidth={1}
                  />
                )
              })}

            {/* Y ticks */}
            {yTicks.map((tick) => {
              const y =
                PAD.top + ((maxY - tick) / (maxY - minY || 1)) * innerH
              return (
                <g key={`y-${tick}`}>
                  <text
                    x={PAD.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-gray-400"
                    style={{ fontSize: 11, fontWeight: 500 }}
                  >
                    {formatValue(tick)}
                  </text>
                </g>
              )
            })}

            {/* Areas (secondary under primary) */}
            <path d={secondaryArea} fill={`url(#grad-s-${uid})`} />
            <path d={primaryArea} fill={`url(#grad-p-${uid})`} />

            {/* Lines */}
            <path
              d={secondaryLine}
              fill="none"
              stroke={SECONDARY}
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <path
              d={primaryLine}
              fill="none"
              stroke={PRIMARY}
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Hover band + dots */}
            {activeX != null && hoverIndex != null ? (
              <g>
                <rect
                  x={activeX - 18}
                  y={PAD.top}
                  width={36}
                  height={innerH}
                  fill={BAND}
                  rx={4}
                />
                <circle
                  cx={activeX}
                  cy={secondaryPts[hoverIndex].y}
                  r={5}
                  fill={SECONDARY}
                  stroke="#fff"
                  strokeWidth={2}
                />
                <circle
                  cx={activeX}
                  cy={primaryPts[hoverIndex].y}
                  r={5}
                  fill={PRIMARY}
                  stroke="#fff"
                  strokeWidth={2}
                />
              </g>
            ) : null}

            {/* X labels */}
            {firstDate ? (
              <text
                x={PAD.left}
                y={H - 10}
                className="fill-gray-400"
                style={{ fontSize: 11, fontWeight: 500 }}
              >
                {formatShort(firstDate)}
              </text>
            ) : null}
            {lastDate ? (
              <text
                x={PAD.left + innerW}
                y={H - 10}
                textAnchor="end"
                className="fill-gray-400"
                style={{ fontSize: 11, fontWeight: 500 }}
              >
                {formatShort(lastDate)}
              </text>
            ) : null}
          </svg>

          {/* Tooltip */}
          {active && activeX != null ? (
            <div
              className="pointer-events-none absolute z-10 min-w-[160px] rounded-xl border border-gray-100 bg-white px-3.5 py-2.5 shadow-lg shadow-black/10"
              style={{
                left: `clamp(8px, calc(${(activeX / W) * 100}% - 80px), calc(100% - 176px))`,
                top: 12,
              }}
            >
              <p className="text-[11px] font-bold tracking-wide text-ink uppercase">
                {chart.title}
              </p>
              <div className="mt-1.5 space-y-1">
                <p className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-bold" style={{ color: PRIMARY }}>
                    {formatValue(active.primary)}
                    {chart.primaryUnit ?? ''}
                  </span>
                  <span className="text-xs text-muted">
                    {formatDayLabel(active.date)}
                  </span>
                </p>
                <p className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-bold" style={{ color: SECONDARY }}>
                    {formatValue(active.secondary)}
                    {chart.secondaryUnit ?? ''}
                  </span>
                  <span className="text-xs text-muted">
                    {formatDayLabel(active.date)}
                  </span>
                </p>
              </div>
              <p className="mt-1.5 text-[10px] text-muted">
                {chart.primaryLabel} · {chart.secondaryLabel}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {kpis.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {kpis.map((kpi) => (
            <div
              key={kpi.id}
              className="rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
            >
              <p className="text-xs font-medium text-muted">{kpi.label}</p>
              <p className="mt-0.5 text-xl font-bold tracking-tight text-ink">
                {kpi.value}
                {kpi.unit ?? ''}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
