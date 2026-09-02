import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors, getAuthenticatedUser } from '../../_lib/auth'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../_lib/db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const idRaw = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id
  const tutorId = String(idRaw ?? '').trim()
  if (!tutorId) return res.status(400).json({ error: 'Missing tutor id' })

  const user = await getAuthenticatedUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  if (user.role === 'tutor' && user.id !== tutorId) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  try {
    const [lessonsResult, reviewsResult, bookingsResult, chartResult] =
      await Promise.all([
        sql`
          SELECT COUNT(*)::int AS count
          FROM bookings
          WHERE tutor_id = ${tutorId}
            AND status = 'completed'
            AND start_at >= DATE_TRUNC('month', NOW())
        `,
        sql`
          SELECT
            COALESCE(AVG(rating), 0)::float AS avg_rating,
            COUNT(*)::int AS count
          FROM reviews
          WHERE tutor_id = ${tutorId}
        `,
        sql`
          SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE status = 'cancelled')::int AS cancelled,
            COUNT(*) FILTER (WHERE status = 'completed')::int AS completed
          FROM bookings
          WHERE tutor_id = ${tutorId}
        `,
        sql`
          SELECT
            DATE(start_at AT TIME ZONE 'UTC') AS day,
            COUNT(*) FILTER (WHERE status = 'completed')::int AS completed,
            COUNT(*)::int AS total
          FROM bookings
          WHERE tutor_id = ${tutorId}
            AND start_at >= NOW() - INTERVAL '30 days'
          GROUP BY 1
          ORDER BY 1 ASC
        `,
      ])

    const avgRating = Number(reviewsResult.rows[0]?.avg_rating ?? 0)
    const reviewCount = Number(reviewsResult.rows[0]?.count ?? 0)
    const totalBookings = Number(bookingsResult.rows[0]?.total ?? 0)
    const cancelled = Number(bookingsResult.rows[0]?.cancelled ?? 0)
    const lessonsThisMonth = Number(lessonsResult.rows[0]?.count ?? 0)

    const kpis = [
      {
        id: 'satisfaction',
        label: 'Student Satisfaction',
        value: reviewCount > 0 ? Math.round(avgRating * 20) : 0,
        unit: '%',
        trend: 'neutral' as const,
      },
      {
        id: 'lessons-this-month',
        label: 'Lessons This Month',
        value: lessonsThisMonth,
        unit: '',
        trend: 'neutral' as const,
      },
      {
        id: 'completion-rate',
        label: 'Completion Rate',
        value:
          totalBookings > 0
            ? Math.round(((totalBookings - cancelled) / totalBookings) * 100)
            : 100,
        unit: '%',
        trend: 'neutral' as const,
      },
    ]

    const chart = {
      title: 'Last 30 days',
      primaryLabel: 'Completed',
      secondaryLabel: 'Booked',
      points: chartResult.rows.map((r) => ({
        date: String(r.day).slice(0, 10),
        primary: Number(r.completed) || 0,
        secondary: Number(r.total) || 0,
      })),
    }

    return res.status(200).json({
      kpis,
      chart,
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviewCount,
    })
  } catch (err) {
    console.error('tutor kpi:', err)
    return res.status(500).json({ error: 'Failed to load KPIs' })
  }
}
