import { sql } from './db.js'

let ensured = false

export async function ensureAssignmentsTable() {
  if (ensured) return
  await sql`
    CREATE TABLE IF NOT EXISTS assignments (
      id SERIAL PRIMARY KEY,
      kind TEXT NOT NULL CHECK (kind IN ('task', 'homework')),
      creator_id TEXT REFERENCES app_users (id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      description TEXT,
      due_at TIMESTAMPTZ,
      priority TEXT NOT NULL DEFAULT 'normal',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS assignment_assignees (
      assignment_id INTEGER NOT NULL REFERENCES assignments (id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES app_users (id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'todo',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (assignment_id, user_id)
    )
  `
  await sql`
    CREATE INDEX IF NOT EXISTS idx_assignment_assignees_user
    ON assignment_assignees (user_id, status)
  `
  await sql`
    CREATE INDEX IF NOT EXISTS idx_assignments_creator
    ON assignments (creator_id, created_at DESC)
  `
  ensured = true
}

export function pgTextArray(ids: string[]) {
  return `{${ids
    .map((id) => `"${String(id).replace(/\\/g, '').replace(/"/g, '')}"`)
    .join(',')}}`
}

export function mapAssignmentRow(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    kind: String(row.kind) === 'homework' ? 'homework' : 'task',
    title: String(row.title || ''),
    description: row.description ? String(row.description) : '',
    dueAt: row.due_at ? new Date(String(row.due_at)).toISOString() : null,
    priority: String(row.priority || 'normal'),
    status: String(row.status || 'todo'),
    assignedBy: String(row.creator_name || 'Admin'),
    assignedTo: String(row.assignee_name || 'Student'),
    assigneeId: String(row.assignee_id || ''),
    createdAt: row.created_at
      ? new Date(String(row.created_at)).toISOString()
      : null,
  }
}
