/** Shared public counter key — unique enough to avoid collisions. */
const COUNTER_KEY = 'englishifu_toefl_practice_tries_v1'
const LOCAL_FLAG = 'englishifu_toefl_try_registered'

const BASE = 'https://countapi.mileshilliard.com/api/v1'

function parseValue(data: unknown): number | null {
  if (!data || typeof data !== 'object') return null
  const raw = (data as { value?: string | number }).value
  const n = typeof raw === 'number' ? raw : Number(raw)
  return Number.isFinite(n) ? n : null
}

/** Current global try count (does not increment). */
export async function fetchToeflTryCount(): Promise<number> {
  try {
    const res = await fetch(`${BASE}/get/${COUNTER_KEY}`)
    if (res.status === 404) return 0
    if (!res.ok) throw new Error(`get failed: ${res.status}`)
    const n = parseValue(await res.json())
    return n ?? 0
  } catch {
    return 0
  }
}

/**
 * Register one unique try for this browser (localStorage dedupe),
 * then return the updated global count.
 */
export async function registerToeflTryOnce(): Promise<number> {
  try {
    if (typeof localStorage !== 'undefined' && localStorage.getItem(LOCAL_FLAG)) {
      return fetchToeflTryCount()
    }

    const res = await fetch(`${BASE}/hit/${COUNTER_KEY}`)
    if (!res.ok) throw new Error(`hit failed: ${res.status}`)
    const n = parseValue(await res.json()) ?? (await fetchToeflTryCount())

    try {
      localStorage.setItem(LOCAL_FLAG, '1')
    } catch {
      /* private mode */
    }

    return n
  } catch {
    return fetchToeflTryCount()
  }
}
