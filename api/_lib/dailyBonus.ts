import { sql } from './db.js'

/** Once per calendar day in Turkmenistan time, for opening Study Place. */
export const DAILY_LOGIN_XP = 5

export async function claimDailyLoginXp(userId: string): Promise<{
  xp: number
  awarded: number
  claimedToday: boolean
}> {
  const { rows: updated } = await sql`
    UPDATE app_users
    SET
      xp = COALESCE(xp, 0) + ${DAILY_LOGIN_XP},
      last_activity_date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ashgabat')::date,
      updated_at = NOW()
    WHERE id = ${userId}
      AND role = 'student'
      AND (
        last_activity_date IS NULL
        OR last_activity_date < (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ashgabat')::date
      )
    RETURNING COALESCE(xp, 0)::int AS xp
  `
  if (updated[0]) {
    return {
      xp: Number(updated[0].xp),
      awarded: DAILY_LOGIN_XP,
      claimedToday: true,
    }
  }

  const { rows } = await sql`
    SELECT
      COALESCE(xp, 0)::int AS xp,
      (
        last_activity_date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ashgabat')::date
      ) AS claimed_today
    FROM app_users
    WHERE id = ${userId}
    LIMIT 1
  `
  const row = rows[0]
  return {
    xp: Number(row?.xp ?? 0),
    awarded: 0,
    claimedToday: Boolean(row?.claimed_today),
  }
}
