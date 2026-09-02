const KEY_PREFIX = 'englishcore_followed_tutors_v1'

function keyFor(userId: string | null) {
  return `${KEY_PREFIX}:${userId ?? 'guest'}`
}

export function readFollowedTutorIds(userId: string | null): string[] {
  try {
    const raw = localStorage.getItem(keyFor(userId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((id): id is string => typeof id === 'string')
  } catch {
    return []
  }
}

export function writeFollowedTutorIds(userId: string | null, ids: string[]) {
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify(ids))
  } catch {
    /* ignore */
  }
}
