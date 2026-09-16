/** Fisher–Yates shuffle. Mutates `items` and returns the same array. */
export function shuffleInPlace<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const current = items[i]
    const swap = items[j]
    if (current === undefined || swap === undefined) continue
    items[i] = swap
    items[j] = current
  }
  return items
}

export function shuffleCopy<T>(items: readonly T[]): T[] {
  return shuffleInPlace(items.slice())
}

export function pickRandomClone<T>(items: readonly T[], count: number): T[] {
  const pool = structuredClone(items as T[])
  shuffleInPlace(pool)
  return pool.slice(0, Math.min(count, pool.length))
}

/**
 * New random sample on every call. Each collection is shuffled independently
 * and sliced to `counts[key]` unique items (no repeats within that collection).
 */
export function getRandomSession<T extends Record<string, readonly unknown[]>>(
  collections: T,
  counts: { [K in keyof T]: number },
): { [K in keyof T]: T[K] extends readonly (infer U)[] ? U[] : never } {
  const result = {} as {
    [K in keyof T]: T[K] extends readonly (infer U)[] ? U[] : never
  }

  for (const key of Object.keys(counts) as (keyof T)[]) {
    const source = collections[key]
    result[key] = pickRandomClone(
      source as readonly unknown[],
      counts[key],
    ) as (typeof result)[keyof T]
  }

  return result
}
