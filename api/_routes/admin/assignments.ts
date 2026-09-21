import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyCors } from '../../_lib/auth.js'
import { verifyAdminSession } from '../../_lib/adminAuth.js'
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
  if (!verifyAdminSession(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  if (!isDbConfigured()) {
    return res.status(503).json(dbUnavailableResponse())
  }

  try {
    await ensureAssignmentsTable()
  } catch (err) {
    console.error('admin assignments table:', err)
    return res.status(500).json({ error: 'Failed to prepare assignments' })
  }

  if (req.method === 'GET') {
    try {
      const { rows } = await sql`
        SELECT
          a.id, a.kind, a.title, a.description, a.due_at, a.priority,
          a.created_at, t.user_id AS assignee_id, t.status,
          'Admin' AS creator_name,
          u.full_name AS assignee_name
        FROM assignments a
        JOIN assignment_assignees t ON t.assignment_id = a.id
        JOIN app_users u ON u.id = t.user_id
        WHERE a.kind = 'task' AND a.creator_id IS NULL
        ORDER BY a.created_at DESC
        LIMIT 100
      `
      return res.status(200).json({
        assignments: rows.map((row) => mapAssignmentRow(row)),
      })
    } catch (err) {
      console.error('GET admin assignments:', err)
      return res.status(500).json({ error: 'Failed to load tasks' })
    }
  }

  if (req.method === 'POST') {
    const body = (req.body ?? {}) as {
      title?: string
      description?: string
      dueAt?: string
      priority?: string
      tutorIds?: string[]
    }
    const title = String(body.title ?? '').trim()
    const description = String(body.description ?? '').trim()
    const priority = PRIORITIES.has(String(body.priority))
      ? String(body.priority)
      : 'normal'
    const tutorIds = Array.isArray(body.tutorIds)
      ? [...new Set(body.tutorIds.map((id) => String(id).trim()).filter(Boolean))]
      : []
    const dueAt =
      body.dueAt && !Number.isNaN(new Date(body.dueAt).getTime())
        ? new Date(body.dueAt).toISOString()
        : null

    if (title.length < 2) {
      return res.status(400).json({ error: 'Title is required' })
    }
    if (tutorIds.length === 0) {
      return res.status(400).json({ error: 'Pick at least one teacher' })
    }

    try {
      const tutors = await sql`
        SELECT id, full_name FROM app_users
        WHERE role = 'tutor' AND id = ANY(${pgTextArray(tutorIds)}::text[])
      `
      if (tutors.rows.length === 0) {
        return res.status(400).json({ error: 'No matching teachers' })
      }

      const inserted = await sql`
        INSERT INTO assignments (kind, creator_id, title, description, due_at, priority)
        VALUES (
          ${'task'},
          NULL,
          ${title},
          ${description || null},
          ${dueAt},
          ${priority}
        )
        RETURNING id
      `
      const assignmentId = Number(inserted.rows[0]?.id)
      for (const tutor of tutors.rows) {
        const tutorId = String(tutor.id)
        await sql`
          INSERT INTO assignment_assignees (assignment_id, user_id)
          VALUES (${assignmentId}, ${tutorId})
          ON CONFLICT DO NOTHING
        `
        await createNotification({
          userId: tutorId,
          type: 'admin_task',
          title: 'New task from admin',
          message: title,
          linkPath: '/tutor/tasks',
        })
      }
      return res.status(201).json({ ok: true, id: assignmentId })
    } catch (err) {
      console.error('POST admin assignments:', err)
      return res.status(500).json({ error: 'Failed to create task' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
