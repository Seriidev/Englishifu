import { sql } from './db'
import { createNotification } from './createNotification'

export const REFERRAL_CREDIT = 1
export const REFERRAL_XP = 50

export async function grantReward(params: {
  userId: string
  source: string
  amount: number
  unit: 'xp' | 'credit'
  description: string
  relatedReferralId?: number | null
}): Promise<void> {
  await sql`
    INSERT INTO reward_ledger (
      user_id, source, amount, unit, description, related_referral_id
    )
    VALUES (
      ${params.userId},
      ${params.source},
      ${params.amount},
      ${params.unit},
      ${params.description},
      ${params.relatedReferralId ?? null}
    )
  `
  if (params.unit === 'xp') {
    await sql`
      UPDATE app_users
      SET xp = COALESCE(xp, 0) + ${params.amount}, updated_at = NOW()
      WHERE id = ${params.userId}
    `
  } else {
    await sql`
      UPDATE app_users
      SET discount_credits = COALESCE(discount_credits, 0) + ${params.amount},
          updated_at = NOW()
      WHERE id = ${params.userId}
    `
  }
}

async function grantReferralPair(referralId: number, referrerId: string, invitedId: string) {
  const desc = 'Referral reward — first completed lesson'
  await grantReward({
    userId: referrerId,
    source: 'referral',
    amount: REFERRAL_CREDIT,
    unit: 'credit',
    description: desc,
    relatedReferralId: referralId,
  })
  await grantReward({
    userId: referrerId,
    source: 'referral',
    amount: REFERRAL_XP,
    unit: 'xp',
    description: desc,
    relatedReferralId: referralId,
  })
  await grantReward({
    userId: invitedId,
    source: 'referral',
    amount: REFERRAL_CREDIT,
    unit: 'credit',
    description: desc,
    relatedReferralId: referralId,
  })
  await grantReward({
    userId: invitedId,
    source: 'referral',
    amount: REFERRAL_XP,
    unit: 'xp',
    description: desc,
    relatedReferralId: referralId,
  })

  await sql`
    UPDATE referrals
    SET status = ${'completed'}, reward_granted = true
    WHERE id = ${referralId}
  `

  await createNotification({
    userId: referrerId,
    type: 'referral_reward',
    title: 'Referral credit earned',
    message: `A friend finished their first lesson. You earned ${REFERRAL_CREDIT} discount credit and ${REFERRAL_XP} XP.`,
    linkPath: '/study/settings',
  })
  await createNotification({
    userId: invitedId,
    type: 'referral_reward',
    title: 'Welcome credit unlocked',
    message: `Thanks for taking your first lesson. You earned ${REFERRAL_CREDIT} discount credit and ${REFERRAL_XP} XP.`,
    linkPath: '/study/settings',
  })
}

/** After a student completes a real lesson, convert pending referral if any. */
export async function maybeCompleteReferralReward(studentId: string): Promise<void> {
  try {
    const completed = await sql`
      SELECT COUNT(*)::int AS n
      FROM bookings
      WHERE student_id = ${studentId} AND status = 'completed'
    `
    if (Number(completed.rows[0]?.n ?? 0) < 1) return

    const pending = await sql`
      SELECT id, referrer_id, invited_user_id
      FROM referrals
      WHERE invited_user_id = ${studentId}
        AND reward_granted = false
      ORDER BY id ASC
      LIMIT 1
    `
    const row = pending.rows[0] as
      | { id: number; referrer_id: string; invited_user_id: string }
      | undefined
    if (!row?.invited_user_id) return

    await grantReferralPair(row.id, row.referrer_id, row.invited_user_id)
  } catch (err) {
    console.error('maybeCompleteReferralReward:', err)
  }
}

export async function allocateReferralCode(handle: string): Promise<string> {
  const base = handle
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 12) || 'USER'
  for (let i = 0; i < 20; i++) {
    const suffix = String(Math.floor(10 + Math.random() * 90))
    const code = `${base}${suffix}`.slice(0, 16)
    const existing = await sql`
      SELECT id FROM app_users WHERE referral_code = ${code} LIMIT 1
    `
    if (existing.rows.length === 0) return code
  }
  return `${base}${Date.now().toString().slice(-5)}`.slice(0, 16)
}

export async function ensureUserReferralCode(
  userId: string,
  handle: string,
): Promise<string> {
  const { rows } = await sql`
    SELECT referral_code FROM app_users WHERE id = ${userId} LIMIT 1
  `
  const existing = rows[0]?.referral_code
  if (typeof existing === 'string' && existing) return existing
  const code = await allocateReferralCode(handle)
  await sql`
    UPDATE app_users SET referral_code = ${code}, updated_at = NOW()
    WHERE id = ${userId} AND referral_code IS NULL
  `
  const again = await sql`
    SELECT referral_code FROM app_users WHERE id = ${userId} LIMIT 1
  `
  return String(again.rows[0]?.referral_code || code)
}
