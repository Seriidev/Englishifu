const KEY_PREFIX = 'englishcore_saved_vocab_v1'

interface SavedVocabEntry {
  id: string
  savedAt: string | null
}

function keyFor(userId: string | null) {
  return `${KEY_PREFIX}:${userId ?? 'guest'}`
}

function readEntries(userId: string | null): SavedVocabEntry[] {
  try {
    const raw = localStorage.getItem(keyFor(userId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.flatMap((item) => {
      if (typeof item === 'string') return [{ id: item, savedAt: null }]
      if (
        item &&
        typeof item === 'object' &&
        typeof (item as { id?: unknown }).id === 'string'
      ) {
        const savedAt = (item as { savedAt?: unknown }).savedAt
        return [
          {
            id: (item as { id: string }).id,
            savedAt: typeof savedAt === 'string' ? savedAt : null,
          },
        ]
      }
      return []
    })
  } catch {
    return []
  }
}

export function readSavedVocabIds(userId: string | null): string[] {
  return readEntries(userId).map((entry) => entry.id)
}

export function writeSavedVocabIds(userId: string | null, ids: string[]) {
  try {
    const previous = new Map(
      readEntries(userId).map((entry) => [entry.id, entry.savedAt]),
    )
    const now = new Date().toISOString()
    const next = ids.map((id) => ({
      id,
      savedAt: previous.has(id) ? (previous.get(id) ?? null) : now,
    }))
    localStorage.setItem(keyFor(userId), JSON.stringify(next))
  } catch {
    /* ignore */
  }
}

export function vocabLearnedStats(userId: string | null, weekStartMs: number) {
  const entries = readEntries(userId)
  const thisWeek = entries.filter((entry) => {
    if (!entry.savedAt) return false
    const at = new Date(entry.savedAt).getTime()
    return Number.isFinite(at) && at >= weekStartMs
  }).length
  return { total: entries.length, thisWeek }
}
