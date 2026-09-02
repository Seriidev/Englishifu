export interface AvailableSlot {
  startAt: string
  endAt: string
}

export interface WeeklyTemplate {
  day_of_week: number
  start_time: string
  end_time: string
  slot_duration_minutes: number
  timezone?: string
}

function parseTimeParts(time: string): { h: number; m: number } {
  const raw = String(time).slice(0, 8)
  const [h, m] = raw.split(':').map(Number)
  return { h: h || 0, m: m || 0 }
}

/** Build UTC Date for a calendar day (Y-M-D in local interpretation of template wall-clock as UTC). */
function utcDateAt(date: Date, hours: number, minutes: number): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      hours,
      minutes,
      0,
      0,
    ),
  )
}

export function generateSlotsForDay(
  date: Date,
  startTime: string,
  endTime: string,
  durationMinutes: number,
): { startAt: Date; endAt: Date }[] {
  const slots: { startAt: Date; endAt: Date }[] = []
  const start = parseTimeParts(startTime)
  const end = parseTimeParts(endTime)

  let current = utcDateAt(date, start.h, start.m)
  const dayEnd = utcDateAt(date, end.h, end.m)

  while (current < dayEnd) {
    const slotEnd = new Date(current.getTime() + durationMinutes * 60_000)
    if (slotEnd <= dayEnd) {
      slots.push({ startAt: new Date(current), endAt: slotEnd })
    }
    current = slotEnd
  }

  return slots
}

export function rangesOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart < bEnd && aEnd > bStart
}

export function buildAvailableSlots(opts: {
  weeklyTemplate: WeeklyTemplate[]
  bookedRanges: { start_at: Date | string; end_at: Date | string }[]
  daysAhead: number
  now?: Date
}): AvailableSlot[] {
  const now = opts.now ?? new Date()
  const slots: AvailableSlot[] = []

  for (let dayOffset = 0; dayOffset < opts.daysAhead; dayOffset++) {
    const date = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + dayOffset,
      ),
    )
    const dayOfWeek = date.getUTCDay()
    const templatesForDay = opts.weeklyTemplate.filter(
      (t) => Number(t.day_of_week) === dayOfWeek,
    )

    for (const template of templatesForDay) {
      const dailySlots = generateSlotsForDay(
        date,
        String(template.start_time),
        String(template.end_time),
        Number(template.slot_duration_minutes) || 60,
      )

      for (const slot of dailySlots) {
        if (slot.startAt <= now) continue

        const hasConflict = opts.bookedRanges.some((booked) =>
          rangesOverlap(
            slot.startAt,
            slot.endAt,
            new Date(booked.start_at),
            new Date(booked.end_at),
          ),
        )

        if (!hasConflict) {
          slots.push({
            startAt: slot.startAt.toISOString(),
            endAt: slot.endAt.toISOString(),
          })
        }
      }
    }
  }

  return slots
}
