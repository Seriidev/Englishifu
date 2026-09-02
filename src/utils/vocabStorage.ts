const KEY_PREFIX = 'englishcore_saved_vocab_v1'

function keyFor(userId: string | null) {
  return `${KEY_PREFIX}:${userId ?? 'guest'}`
}

export function readSavedVocabIds(userId: string | null): string[] {
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

export function writeSavedVocabIds(userId: string | null, ids: string[]) {
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify(ids))
  } catch {
    /* ignore */
  }
}
