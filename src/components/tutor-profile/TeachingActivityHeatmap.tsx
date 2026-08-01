import type { TeachingActivityDay } from '../../types/tutorProfile'
import {
  getActivityColor,
  groupByWeek,
  totalLessons,
} from '../../utils/activityHeatmap'

interface TeachingActivityHeatmapProps {
  data: TeachingActivityDay[]
}

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

function monthLabelsForWeeks(weeks: TeachingActivityDay[][]): string[] {
  const labels: string[] = []
  let lastMonth = -1
  for (const week of weeks) {
    const mid = week[3] ?? week[0]
    const month = new Date(mid.date + 'T12:00:00').getMonth()
    if (month !== lastMonth) {
      labels.push(MONTH_LABELS[month])
      lastMonth = month
    } else {
      labels.push('')
    }
  }
  return labels
}

export default function TeachingActivityHeatmap({
  data,
}: TeachingActivityHeatmapProps) {
  const weeks = groupByWeek(data, 53)
  const months = monthLabelsForWeeks(weeks)
  const lessons = totalLessons(data)

  return (
    <section className="rounded-2xl border border-[#c7d7f5]/80 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-ink">Teaching Activity</h2>
          <p className="mt-0.5 text-sm text-muted">
            {lessons} lessons in the last year
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto pb-1">
        <div className="inline-block min-w-max">
          <div className="mb-1 flex gap-[3px] pl-6">
            {months.map((label, i) => (
              <div
                key={`m-${i}`}
                className="w-[11px] text-[9px] leading-none text-muted"
              >
                {label}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <div className="flex flex-col justify-between py-[2px] text-[9px] text-muted">
              <span className="h-[11px]" />
              <span className="h-[11px] leading-[11px]">Mon</span>
              <span className="h-[11px]" />
              <span className="h-[11px] leading-[11px]">Wed</span>
              <span className="h-[11px]" />
              <span className="h-[11px] leading-[11px]">Fri</span>
              <span className="h-[11px]" />
            </div>

            <div className="flex gap-[3px]">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((day) => (
                    <div
                      key={day.date}
                      title={`${day.lessonsCount} lesson${day.lessonsCount === 1 ? '' : 's'} on ${day.date}`}
                      className="h-[11px] w-[11px] rounded-[2px]"
                      style={{
                        backgroundColor: getActivityColor(day.lessonsCount),
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted">
        Less
        {[0, 1, 3, 5, 7].map((n) => (
          <div
            key={n}
            className="h-[11px] w-[11px] rounded-[2px]"
            style={{ backgroundColor: getActivityColor(n) }}
          />
        ))}
        More
      </div>
    </section>
  )
}
