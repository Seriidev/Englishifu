import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../../_lib/auth.js'
import { verifyAdminSession } from '../../_lib/adminAuth.js'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../_lib/db.js'

/** Primary market — other countries count as foreign. */
const HOME_COUNTRY = 'Turkmenistan'
const INACTIVE_DAYS = 14

function dayList(days: number): string[] {
  const out: string[] = []
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  for (let i = days - 1; i >= 0; i -= 1) {
    const x = new Date(d)
    x.setUTCDate(d.getUTCDate() - i)
    out.push(x.toISOString().slice(0, 10))
  }
  return out
}

function toDayMap(rows: Array<{ day: string; n: number }>) {
  const map = new Map<string, number>()
  for (const row of rows) {
    map.set(String(row.day).slice(0, 10), Number(row.n) || 0)
  }
  return map
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!verifyAdminSession(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const daysRaw = Number(req.query.days)
  const days = Number.isFinite(daysRaw)
    ? Math.min(90, Math.max(7, Math.round(daysRaw)))
    : 30
  const dayKeys = dayList(days)
  const from = dayKeys[0]!
  const interval = `${days} days`
  const prevInterval = `${days * 2} days`

  try {
    const totals = await sql`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (
          WHERE COALESCE(is_suspended, false) = false
            AND COALESCE(last_activity_date, updated_at::date, created_at::date)
              >= (CURRENT_DATE - ${INACTIVE_DAYS}::int)
        )::int AS active,
        COUNT(*) FILTER (
          WHERE COALESCE(is_suspended, false) = false
            AND COALESCE(last_activity_date, updated_at::date, created_at::date)
              < (CURRENT_DATE - ${INACTIVE_DAYS}::int)
        )::int AS inactive,
        COUNT(*) FILTER (
          WHERE COALESCE(is_suspended, false) = true
        )::int AS left_count,
        COUNT(*) FILTER (
          WHERE created_at >= NOW() - ${interval}::interval
        )::int AS joined_period,
        COUNT(*) FILTER (
          WHERE COALESCE(is_suspended, false) = true
            AND updated_at >= NOW() - ${interval}::interval
        )::int AS left_period
      FROM app_users
    `

    const prevJoined = await sql`
      SELECT COUNT(*)::int AS n
      FROM app_users
      WHERE created_at >= NOW() - ${prevInterval}::interval
        AND created_at < NOW() - ${interval}::interval
    `

    const joinedRows = await sql`
      SELECT created_at::date::text AS day, COUNT(*)::int AS n
      FROM app_users
      WHERE created_at >= ${from}::date
      GROUP BY 1
      ORDER BY 1
    `

    const leftRows = await sql`
      SELECT updated_at::date::text AS day, COUNT(*)::int AS n
      FROM app_users
      WHERE COALESCE(is_suspended, false) = true
        AND updated_at >= ${from}::date
      GROUP BY 1
      ORDER BY 1
    `

    const growthRows = await sql`
      SELECT d::date::text AS day, (
        SELECT COUNT(*)::int
        FROM app_users u
        WHERE u.created_at::date <= d::date
          AND COALESCE(u.is_suspended, false) = false
      ) AS n
      FROM generate_series(${from}::date, CURRENT_DATE, interval '1 day') AS d
      ORDER BY 1
    `

    const sourceRows = await sql`
      SELECT
        u.created_at::date::text AS day,
        COUNT(*) FILTER (WHERE r.id IS NOT NULL)::int AS referral,
        COUNT(*) FILTER (WHERE r.id IS NULL)::int AS link
      FROM app_users u
      LEFT JOIN referrals r ON r.invited_user_id = u.id
      WHERE u.created_at >= ${from}::date
      GROUP BY 1
      ORDER BY 1
    `

    const sourceTotals = await sql`
      SELECT
        COUNT(*) FILTER (WHERE r.id IS NOT NULL)::int AS referral,
        COUNT(*) FILTER (WHERE r.id IS NULL)::int AS link
      FROM app_users u
      LEFT JOIN referrals r ON r.invited_user_id = u.id
      WHERE u.created_at >= ${from}::date
    `

    const hourRows = await sql`
      SELECT EXTRACT(HOUR FROM start_at AT TIME ZONE 'UTC')::int AS hour,
             COUNT(*)::int AS n
      FROM bookings
      WHERE start_at >= NOW() - ${interval}::interval
        AND status IN ('confirmed', 'completed')
      GROUP BY 1
      ORDER BY 1
    `

    const countryRows = await sql`
      SELECT
        COALESCE(NULLIF(trim(city), ''), 'Unknown') AS country,
        COUNT(*)::int AS n
      FROM app_users
      WHERE COALESCE(is_suspended, false) = false
      GROUP BY 1
      ORDER BY n DESC
      LIMIT 12
    `

    const foreignRow = await sql`
      SELECT
        COUNT(*) FILTER (
          WHERE COALESCE(is_suspended, false) = false
            AND NULLIF(trim(city), '') IS NOT NULL
            AND lower(trim(city)) <> lower(${HOME_COUNTRY})
        )::int AS foreigners,
        COUNT(*) FILTER (
          WHERE COALESCE(is_suspended, false) = false
            AND lower(COALESCE(trim(city), '')) = lower(${HOME_COUNTRY})
        )::int AS home,
        COUNT(*) FILTER (
          WHERE COALESCE(is_suspended, false) = false
            AND NULLIF(trim(city), '') IS NULL
        )::int AS unknown_country
      FROM app_users
    `

    const t = totals.rows[0] as Record<string, number>
    const joinedMap = toDayMap(
      joinedRows.rows as Array<{ day: string; n: number }>,
    )
    const leftMap = toDayMap(leftRows.rows as Array<{ day: string; n: number }>)
    const growthMap = toDayMap(
      growthRows.rows as Array<{ day: string; n: number }>,
    )

    const sourceMap = new Map<string, { referral: number; link: number }>()
    for (const row of sourceRows.rows as Array<{
      day: string
      referral: number
      link: number
    }>) {
      sourceMap.set(String(row.day).slice(0, 10), {
        referral: Number(row.referral) || 0,
        link: Number(row.link) || 0,
      })
    }

    const hourMap = new Map<number, number>()
    for (const row of hourRows.rows as Array<{ hour: number; n: number }>) {
      hourMap.set(Number(row.hour), Number(row.n) || 0)
    }

    const joinedPeriod = Number(t.joined_period ?? 0)
    const prevPeriodJoined = Number(
      (prevJoined.rows[0] as { n?: number } | undefined)?.n ?? 0,
    )
    const growthPct =
      prevPeriodJoined > 0
        ? Math.round(
            ((joinedPeriod - prevPeriodJoined) / prevPeriodJoined) * 1000,
          ) / 10
        : joinedPeriod > 0
          ? 100
          : 0

    const st = sourceTotals.rows[0] as { referral: number; link: number }
    const fr = foreignRow.rows[0] as {
      foreigners: number
      home: number
      unknown_country: number
    }

    return res.status(200).json({
      range: {
        days,
        from: dayKeys[0],
        to: dayKeys[dayKeys.length - 1],
        homeCountry: HOME_COUNTRY,
        inactiveAfterDays: INACTIVE_DAYS,
      },
      overview: {
        users: Number(t.total ?? 0),
        active: Number(t.active ?? 0),
        inactive: Number(t.inactive ?? 0),
        left: Number(t.left_count ?? 0),
        joinedPeriod,
        leftPeriod: Number(t.left_period ?? 0),
        joinedDelta: joinedPeriod - prevPeriodJoined,
        joinedGrowthPct: growthPct,
      },
      growth: dayKeys.map((day) => ({
        day,
        users: growthMap.get(day) ?? 0,
      })),
      usersFlow: dayKeys.map((day) => ({
        day,
        joined: joinedMap.get(day) ?? 0,
        left: leftMap.get(day) ?? 0,
      })),
      activityByHour: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        count: hourMap.get(hour) ?? 0,
      })),
      sources: {
        totals: {
          referral: Number(st.referral ?? 0),
          link: Number(st.link ?? 0),
        },
        series: dayKeys.map((day) => ({
          day,
          referral: sourceMap.get(day)?.referral ?? 0,
          link: sourceMap.get(day)?.link ?? 0,
        })),
      },
      countries: {
        home: Number(fr.home ?? 0),
        foreigners: Number(fr.foreigners ?? 0),
        unknown: Number(fr.unknown_country ?? 0),
        top: (countryRows.rows as Array<{ country: string; n: number }>).map(
          (row) => ({
            country: String(row.country),
            count: Number(row.n) || 0,
            isHome:
              String(row.country).toLowerCase() === HOME_COUNTRY.toLowerCase(),
            isForeign:
              String(row.country).toLowerCase() !==
                HOME_COUNTRY.toLowerCase() &&
              String(row.country) !== 'Unknown',
          }),
        ),
      },
    })
  } catch (err) {
    console.error('GET admin/analytics:', err)
    return res.status(500).json({ error: 'Failed to load analytics' })
  }
}
