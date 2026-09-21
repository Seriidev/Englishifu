import { sql } from './db.js'
import {
  isDataUrl,
  persistIfDataUrl,
  publicMediaUrl,
} from './saveMedia.js'
import type { AppUserRow, TutorCertification } from './userMapper.js'

function parseCerts(raw: unknown): TutorCertification[] {
  if (!raw) return []
  let list: unknown = raw
  if (typeof raw === 'string') {
    try {
      list = JSON.parse(raw)
    } catch {
      return []
    }
  }
  if (!Array.isArray(list)) return []
  return list.map((item, index) => {
    const c = item as Record<string, unknown>
    return {
      id: typeof c.id === 'string' ? c.id : `cert-${index}`,
      name: typeof c.name === 'string' ? c.name : 'Certificate',
      imageUrl:
        typeof c.imageUrl === 'string'
          ? c.imageUrl
          : typeof c.image_url === 'string'
            ? c.image_url
            : undefined,
      uploadedAt:
        typeof c.uploadedAt === 'string'
          ? c.uploadedAt
          : typeof c.uploaded_at === 'string'
            ? c.uploaded_at
            : undefined,
    }
  })
}

async function persistCertImages(
  certs: TutorCertification[],
): Promise<{ certs: TutorCertification[]; changed: boolean }> {
  let changed = false
  const next: TutorCertification[] = []
  for (const cert of certs) {
    if (!cert.imageUrl || !isDataUrl(cert.imageUrl)) {
      next.push({
        ...cert,
        imageUrl: publicMediaUrl(cert.imageUrl) ?? undefined,
      })
      continue
    }
    try {
      const imageUrl = await persistIfDataUrl(cert.imageUrl, 'certs')
      changed = true
      next.push({ ...cert, imageUrl: imageUrl ?? cert.imageUrl })
    } catch (err) {
      console.error('persist cert image:', err)
      next.push(cert)
    }
  }
  return { certs: next, changed }
}

/**
 * Move data-URL avatars/certs out of Postgres once, then keep short URLs.
 * Caps work per request so a first-load migration cannot time out.
 */
export async function persistUserRowMedia(
  row: AppUserRow,
): Promise<AppUserRow> {
  let avatarUrl = row.avatar_url ?? null
  let avatarChanged = false
  if (isDataUrl(avatarUrl)) {
    try {
      avatarUrl = await persistIfDataUrl(avatarUrl, 'avatars')
      avatarChanged = true
    } catch (err) {
      console.error('persist avatar:', err)
    }
  } else {
    avatarUrl = publicMediaUrl(avatarUrl)
  }

  const parsed = parseCerts(row.certifications)
  const { certs, changed: certsChanged } = await persistCertImages(parsed)

  if (avatarChanged || certsChanged) {
    const certJson = JSON.stringify(certs)
    try {
      await sql`
        UPDATE app_users SET
          avatar_url = ${avatarUrl},
          certifications = ${certJson}::jsonb,
          updated_at = NOW()
        WHERE id = ${row.id}
      `
    } catch (err) {
      console.error('persist user media update:', err)
    }
  }

  return {
    ...row,
    avatar_url: avatarUrl,
    certifications: certs,
  }
}

export async function persistAvatarOnRows(
  rows: Array<{ id?: unknown; avatar_url?: unknown }>,
  max = 5,
): Promise<void> {
  let migrated = 0
  for (const row of rows) {
    if (migrated >= max) break
    const id = typeof row.id === 'string' ? row.id : null
    const avatar = typeof row.avatar_url === 'string' ? row.avatar_url : null
    if (!id || !isDataUrl(avatar)) {
      if (avatar) row.avatar_url = publicMediaUrl(avatar)
      continue
    }
    try {
      const url = await persistIfDataUrl(avatar, 'avatars')
      await sql`
        UPDATE app_users SET avatar_url = ${url}, updated_at = NOW()
        WHERE id = ${id}
      `
      row.avatar_url = url
      migrated += 1
    } catch (err) {
      console.error('persist list avatar:', err)
    }
  }
}
