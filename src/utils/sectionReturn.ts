export const STUDY_RETURN_STATE = { returnTo: '/study' } as const

export function returnToFromState(state: unknown, fallback = '/toefl'): string {
  const value = (state as { returnTo?: unknown } | null)?.returnTo
  if (typeof value !== 'string') return fallback
  if (!value.startsWith('/') || value.startsWith('//')) return fallback
  return value
}
