import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors, getAuthenticatedUser } from '../../_lib/auth.js'
import { createNotification } from '../../_lib/createNotification.js'
import { dbUnavailableResponse, isDbConfigured, sql } from '../../_lib/db.js'
import {
  ensureAssignmentsTable,
  mapAssignmentRow,
  pgTextArray,
} from '../../_lib/assignments.js'

const PRIORITIES = new Set(['low', 'normal', 'urgent'])

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  const user = await getAuthenticatedUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  try {
    await ensureAssignmentsTable()
  } catch (err) {
    console.error('assignments table:', err)
    return res.status(500).json({ error: 'Failed to prepare assignments' })
  }

  if (req.method === 'GET') {
    const scope = String(req.query.scope || 'inbox')
    try {
      const { rows } =
        scope === 'sent'
          ? await sql`
              SELECT
                a.id, a.kind, a.title, a.description, a.due_at, a.priority,
                a.created_at, t.user_id AS assignee_id, t.status,
                COALESCE(c.full_name, 'Admin') AS creator_name,
                u.full_name AS assignee_name
              FROM assignments a
              JOIN assignment_assignees t ON t.assignment_id = a.id
              LEFT JOIN app_users c ON c.id = a.creator_id
              JOIN app_users u ON u.id = t.user_id
              WHERE a.creator_id = ${user.id}
              ORDER BY a.due_at NULLS LAST, a.created_at DESC
            `
          : await sql`
              SELECT
                a.id, a.kind, a.title, a.description, a.due_at, a.priority,
                a.created_at, t.user_id AS assignee_id, t.status,
                COALESCE(c.full_name, 'Admin') AS creator_name,
                u.full_name AS assignee_name
              FROM assignments a
              JOIN assignment_assignees t ON t.assignment_id = a.id
              LEFT JOIN app_users c ON c.id = a.creator_id
              JOIN app_users u ON u.id = t.user_id
              WHERE t.user_id = ${user.id}
              ORDER BY a.due_at NULLS LAST, a.created_at DESC
            `
      return res.status(200).json({
        assignments: rows.map((row) => mapAssignmentRow(row)),
      })
    } catch (err) {
      console.error('GET assignments:', err)
      return res.status(500).json({ error: 'Failed to load assignments' })
    }
  }

  if (req.method === 'POST') {
    if (user.role !== 'tutor') {
      return res.status(403).json({ error: 'Only teachers can create homework' })
    }
    const body = (req.body ?? {}) as {
      title?: string
      description?: string
      dueAt?: string
      priority?: string
      studentIds?: string[]
    }
    const title = String(body.title ?? '').trim()
    const description = String(body.description ?? '').trim()
    const priority = PRIORITIES.has(String(body.priority))
      ? String(body.priority)
      : 'normal'
    const studentIds = Array.isArray(body.studentIds)
      ? [...new Set(body.studentIds.map((id) => String(id).trim()).filter(Boolean))]
      : []
    const dueAt =
      body.dueAt && !Number.isNaN(new Date(body.dueAt).getTime())
        ? new Date(body.dueAt).toISOString()
        : null

    if (title.length < 2) {
      return res.status(400).json({ error: 'Title is required' })
    }
    if (studentIds.length === 0) {
      return res.status(400).json({ error: 'Pick at least one student' })
    }

    try {
      const roster = await sql`
        SELECT u.id
        FROM app_users u
        WHERE u.id = ANY(${pgTextArray(studentIds)}::text[])
          AND u.role = 'student'
          AND (
            EXISTS (
              SELECT 1 FROM bookings b
              WHERE b.tutor_id = ${user.id}
                AND b.student_id = u.id
                AND b.status IN ('confirmed', 'completed')
            )
            OR EXISTS (
              SELECT 1
              FROM speaking_club_participants p
              JOIN speaking_club_sessions s ON s.id = p.session_id
              WHERE s.host_tutor_id = ${user.id}
                AND p.student_id = u.id
            )
          )
      `
      const allowed = new Set(roster.rows.map((r) => String(r.id)))
      const targets = studentIds.filter((id) => allowed.has(id))
      if (targets.length === 0) {
        return res.status(400).json({ error: 'Those students are not on your list' })
      }

      const inserted = await sql`
        INSERT INTO assignments (kind, creator_id, title, description, due_at, priority)
        VALUES (
          ${'homework'},
          ${user.id},
          ${title},
          ${description || null},
          ${dueAt},
          ${priority}
        )
        RETURNING id
      `
      const assignmentId = Number(inserted.rows[0]?.id)
      for (const studentId of targets) {
        await sql`
          INSERT INTO assignment_assignees (assignment_id, user_id)
          VALUES (${assignmentId}, ${studentId})
          ON CONFLICT DO NOTHING
        `
        await createNotification({
          userId: studentId,
          type: 'homework',
          title: 'New homework',
          message: `${user.fullName} assigned “${title}”.`,
          linkPath: '/study/homework',
        })
      }
      return res.status(201).json({ ok: true, id: assignmentId })
    } catch (err) {
      console.error('POST assignments:', err)
      return res.status(500).json({ error: 'Failed to create homework' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
