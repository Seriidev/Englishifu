import pg from 'pg'

function connectionString(): string {
  return (
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL ||
    ''
  )
}

function isLocalHost(url: string): boolean {
  try {
    const parsed = new URL(url)
    return (
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1' ||
      parsed.hostname === '::1'
    )
  } catch {
    return url.includes('localhost') || url.includes('127.0.0.1')
  }
}

export function isDbConfigured(): boolean {
  return Boolean(connectionString())
}

export function dbUnavailableResponse() {
  return {
    error:
      'Database is not configured. For local: npm run db:up && npm run db:migrate. Or set POSTGRES_URL.',
  }
}

let pool: pg.Pool | null = null

function getPool(): pg.Pool {
  if (pool) return pool
  const url = connectionString()
  if (!url) {
    throw new Error('POSTGRES_URL is not set')
  }
  pool = new pg.Pool({
    connectionString: url,
    max: 8,
    ssl: isLocalHost(url) ? false : { rejectUnauthorized: false },
    options: '-c client_encoding=UTF8',
  })
  return pool
}

/** Tagged template compatible with `@vercel/postgres` (`{ rows }`). */
export function sql(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<pg.QueryResult> {
  let text = strings[0] ?? ''
  const params: unknown[] = []
  values.forEach((value, index) => {
    params.push(value === undefined ? null : value)
    text += `$${params.length}${strings[index + 1] ?? ''}`
  })
  return getPool().query(text, params)
}
