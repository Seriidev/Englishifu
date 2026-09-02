import { sql } from './db'

export type NotificationType =
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'tutor_approved'
  | 'new_review'
  | 'speaking_club_reminder'
  | 'booking_reminder'
  | 'xp_boost'

export async function createNotification(params: {
  userId: string
  type: NotificationType | string
  title: string
  message: string
  linkPath?: string | null
}): Promise<void> {
  try {
    await sql`
      INSERT INTO notifications (user_id, type, title, message, link_path)
      VALUES (
        ${params.userId},
        ${params.type},
        ${params.title},
        ${params.message},
        ${params.linkPath ?? null}
      )
    `
  } catch (err) {
    // Never fail the parent request because a notification insert failed
    console.error('createNotification error:', err)
  }
}
