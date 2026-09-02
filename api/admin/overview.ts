import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../_lib/auth'
import { verifyAdminSession } from '../_lib/adminAuth'
import { dbUnavailableResponse, isDbConfigured, sql } from '../_lib/db'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (!verifyAdminSession(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  try {
    const students = await sql`
      SELECT COUNT(*)::int AS n FROM app_users WHERE role = 'student'
    `
    const tutors = await sql`
      SELECT COUNT(*)::int AS n
      FROM app_users
      WHERE role = 'tutor' AND status = 'approved'
    `
    const pending = await sql`
      SELECT COUNT(*)::int AS n
      FROM app_users
      WHERE role = 'tutor' AND status = 'pending'
    `
    const bookingsWeek = await sql`
      SELECT COUNT(*)::int AS n
      FROM bookings
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `
    const consultNew = await sql`
      SELECT COUNT(*)::int AS n
      FROM consultation_requests
      WHERE status = 'new'
    `
    const referralsPending = await sql`
      SELECT COUNT(*)::int AS n FROM referrals WHERE status = 'pending'
    `
    return res.status(200).json({
      students: Number(students.rows[0]?.n ?? 0),
      tutors: Number(tutors.rows[0]?.n ?? 0),
      pendingApplications: Number(pending.rows[0]?.n ?? 0),
      bookingsThisWeek: Number(bookingsWeek.rows[0]?.n ?? 0),
      newConsultationRequests: Number(consultNew.rows[0]?.n ?? 0),
      pendingReferrals: Number(referralsPending.rows[0]?.n ?? 0),
      revenue: null,
    })
  } catch (err) {
    console.error('GET admin/overview:', err)
    return res.status(500).json({ error: 'Failed to load overview' })
  }
}
