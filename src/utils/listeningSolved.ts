const KEY = 'englishifu_listening_solved_v1'

function readMap(): Record<string, number> {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, number>
  } catch {
    return {}
  }
}

export function getLocalSolvedBonus(practiceId: string): number {
  return readMap()[practiceId] ?? 0
}

export function incrementPracticeSolved(practiceId: string): void {
  try {
    const map = readMap()
    map[practiceId] = (map[practiceId] ?? 0) + 1
    localStorage.setItem(KEY, JSON.stringify(map))
  } catch {
    /* ignore */
  }
}

export function formatSolvedCount(n: number): string {
  return new Intl.NumberFormat('en-US').format(n)
}
