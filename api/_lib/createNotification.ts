import { sql } from './db.js'

let actorColumnReady = false

export async function ensureNotificationActorColumn() {
  if (actorColumnReady) return
  await sql`
    ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS actor_id TEXT
  `
  actorColumnReady = true
}

export type NotificationType =
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'tutor_approved'
  | 'new_review'
  | 'speaking_club_reminder'
  | 'booking_reminder'
  | 'xp_boost'
  | 'homework'
  | 'admin_task'

export async function createNotification(params: {
  userId: string
  type: NotificationType | string
  title: string
  message: string
  linkPath?: string | null
  actorId?: string | null
}): Promise<void> {
  try {
    await ensureNotificationActorColumn()
    await sql`
      INSERT INTO notifications (user_id, type, title, message, link_path, actor_id)
      VALUES (
        ${params.userId},
        ${params.type},
        ${params.title},
        ${params.message},
        ${params.linkPath ?? null},
        ${params.actorId ?? null}
      )
    `
  } catch (err) {
    // Never fail the parent request because a notification insert failed
    console.error('createNotification error:', err)
  }
}
