export function parsePage(
  query: Record<string, unknown> | undefined,
  defaults: { limit?: number; max?: number } = {},
): { page: number; limit: number; offset: number } {
  const max = defaults.max ?? 100
  const fallback = defaults.limit ?? 20
  const rawPage = Array.isArray(query?.page) ? query?.page[0] : query?.page
  const rawLimit = Array.isArray(query?.limit) ? query?.limit[0] : query?.limit
  const page = Math.max(1, Number(rawPage) || 1)
  const limit = Math.min(max, Math.max(1, Number(rawLimit) || fallback))
  return { page, limit, offset: (page - 1) * limit }
}
