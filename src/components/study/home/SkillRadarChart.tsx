import type { RadarAxis } from '../../../scoring/testAnalysis'
import { MAX_BAND } from '../../../scoring/testAnalysis'

interface SkillRadarChartProps {
  axes: RadarAxis[]
}

const LEVELS = 7
const CX = 160
const CY = 152
const RADIUS = 102

function vertex(index: number, count: number, radius: number) {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count
  return {
    x: CX + radius * Math.cos(angle),
    y: CY + radius * Math.sin(angle),
  }
}

function polygon(points: { x: number; y: number }[]) {
  return points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
}

export default function SkillRadarChart({ axes }: SkillRadarChartProps) {
  const n = axes.length || 5
  const grids = Array.from({ length: LEVELS }, (_, i) =>
    Array.from({ length: n }, (__, j) =>
      vertex(j, n, ((i + 1) / LEVELS) * RADIUS),
    ),
  )
  const spokes = Array.from({ length: n }, (_, i) => vertex(i, n, RADIUS))
  const hasData = axes.some((axis) => axis.value > 0)
  const data = axes.map((axis, i) =>
    vertex(i, n, (Math.max(0, Math.min(MAX_BAND, axis.value)) / MAX_BAND) * RADIUS),
  )
  const labels = axes.map((axis, i) => {
    const p = vertex(i, n, RADIUS + 26)
    return { ...p, label: axis.label }
  })

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-[#ffffff] px-2 py-3 shadow-sm">
      <svg
        viewBox="0 0 320 304"
        className="mx-auto h-auto w-full max-w-[320px]"
        role="img"
        aria-label="Skill pentagram"
      >
        {grids.map((pts, i) => (
          <polygon
            key={`grid-${i}`}
            points={polygon(pts)}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={i === LEVELS - 1 ? 1.25 : 1}
          />
        ))}
        {spokes.map((p, i) => (
          <line
            key={`spoke-${i}`}
            x1={CX}
            y1={CY}
            x2={p.x}
            y2={p.y}
            stroke="#e2e8f0"
            strokeWidth={1}
          />
        ))}
        {hasData ? (
          <>
            <polygon
              points={polygon(data)}
              fill="rgba(85, 216, 252, 0.28)"
              stroke="#55D8FC"
              strokeWidth={2}
              strokeLinejoin="round"
            />
            {data.map((p, i) => (
              <circle key={`dot-${i}`} cx={p.x} cy={p.y} r={3.2} fill="#24476B" />
            ))}
          </>
        ) : null}
        {labels.map((item) => (
          <text
            key={item.label}
            x={item.x}
            y={item.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#0B151F"
            fontSize="12"
            fontWeight="600"
          >
            {item.label}
          </text>
        ))}
      </svg>
    </div>
  )
}
