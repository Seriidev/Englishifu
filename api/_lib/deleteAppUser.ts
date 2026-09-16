import { sql } from './db.js'

export async function deleteAppUserAccount(id: string): Promise<{
  id: string
  role: string
  full_name: string
  email: string
} | null> {
  const { rows } = await sql`
    SELECT id, role, full_name, email FROM app_users WHERE id = ${id} LIMIT 1
  `
  const user = rows[0] as
    | { id: string; role: string; full_name: string; email: string }
    | undefined
  if (!user) return null

  await sql`DELETE FROM teacher_messages WHERE student_id = ${id} OR tutor_id = ${id}`
  await sql`DELETE FROM student_boosts WHERE student_id = ${id} OR tutor_id = ${id}`
  await sql`DELETE FROM notifications WHERE user_id = ${id}`
  await sql`DELETE FROM reviews WHERE student_id = ${id} OR tutor_id = ${id}`
  await sql`DELETE FROM speaking_club_participants WHERE student_id = ${id}`
  await sql`DELETE FROM speaking_club_requests WHERE student_id = ${id}`
  await sql`DELETE FROM speaking_club_sessions WHERE host_tutor_id = ${id}`
  await sql`DELETE FROM bookings WHERE student_id = ${id} OR tutor_id = ${id}`
  await sql`DELETE FROM tutor_availability WHERE tutor_id = ${id}`
  await sql`DELETE FROM tutor_certifications WHERE tutor_id = ${id}`
  await sql`DELETE FROM tutor_moderation_log WHERE tutor_id = ${id}`
  await sql`DELETE FROM reward_ledger WHERE user_id = ${id}`
  await sql`DELETE FROM test_results WHERE student_id = ${id}`
  await sql`DELETE FROM referrals WHERE referrer_id = ${id}`
  await sql`
    UPDATE referrals SET invited_user_id = NULL WHERE invited_user_id = ${id}
  `
  await sql`DELETE FROM app_users WHERE id = ${id}`

  return user
}
