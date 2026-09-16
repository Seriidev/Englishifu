import dns from 'node:dns'
import pg from 'pg'

dns.setDefaultResultOrder('ipv4first')

const POOL_GEN = 9

type GlobalPg = typeof globalThis & {
  __englishcorePg?: { pool: pg.Pool; url: string; gen: number }
}

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

function stripSslMode(url: string): string {
  try {
    const parsed = new URL(url)
    parsed.searchParams.delete('sslmode')
    parsed.searchParams.delete('ssl')
    return parsed.toString()
  } catch {
    return url.replace(/[?&]sslmode=[^&]+/g, '').replace(/[?&]ssl=[^&]+/g, '')
  }
}

/** Neon transaction pooler + node-pg Pool hangs on reused clients in Vite. */
function nodePgUrl(url: string): string {
  try {
    const parsed = new URL(stripSslMode(url))
    parsed.hostname = parsed.hostname.replace(/-pooler\./, '.')
    return parsed.toString()
  } catch {
    return stripSslMode(url).replace(/-pooler\./, '.')
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

function createPool(url: string): pg.Pool {
  const local = isLocalHost(url)
  const pool = new pg.Pool({
    connectionString: local ? url : nodePgUrl(url),
    max: local ? 8 : 5,
    ssl: local ? false : { rejectUnauthorized: false },
    // Neon pooler (PgBouncer) hangs on session startup options.
    ...(local ? { options: '-c client_encoding=UTF8' } : {}),
    connectionTimeoutMillis: local ? 3_000 : 15_000,
    idleTimeoutMillis: 30_000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 5_000,
  })
  pool.on('error', (err) => {
    console.error('[db] pool error:', err.message)
  })
  return pool
}

async function endPool(old?: pg.Pool) {
  if (!old) return
  try {
    await Promise.race([
      old.end(),
      new Promise((resolve) => setTimeout(resolve, 800)),
    ])
  } catch {
    /* ignore */
  }
}

function getStore(): { pool: pg.Pool; url: string; gen: number } {
  const g = globalThis as GlobalPg
  const url = connectionString()
  if (!url) {
    throw new Error('POSTGRES_URL is not set')
  }
  if (g.__englishcorePg?.url === url && g.__englishcorePg.gen === POOL_GEN) {
    return g.__englishcorePg
  }
  const previous = g.__englishcorePg
  g.__englishcorePg = undefined
  void endPool(previous?.pool)
  try {
    const host = new URL(url.replace(/^postgres(ql)?:/, 'http:')).hostname
    console.log('[db] connecting to', host)
  } catch {
    console.log('[db] connecting (url parse failed)')
  }
  const store = { pool: createPool(url), url, gen: POOL_GEN }
  g.__englishcorePg = store
  return store
}

function resetPool() {
  const g = globalThis as GlobalPg
  const old = g.__englishcorePg
  g.__englishcorePg = undefined
  void endPool(old?.pool)
}

function isRetryable(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  const code =
    err && typeof err === 'object' && 'code' in err
      ? String((err as { code?: string }).code)
      : ''
  return (
    msg.includes('timeout exceeded') ||
    msg.includes('Query read timeout') ||
    msg.includes('Connection terminated') ||
    msg.includes('Client has encountered a connection error') ||
    msg.includes('ECONNRESET') ||
    msg.includes('ECONNREFUSED') ||
    code === 'ETIMEDOUT' ||
    code === 'ECONNRESET' ||
    code === '57P01'
  )
}

async function queryWithRetry(
  text: string,
  params: unknown[],
): Promise<pg.QueryResult> {
  try {
    return await getStore().pool.query(text, params)
  } catch (err) {
    if (!isRetryable(err)) throw err
    console.warn('[db] reconnecting after', err instanceof Error ? err.message : err)
    resetPool()
    return getStore().pool.query(text, params)
  }
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
  return queryWithRetry(text, params)
}

export async function warmupDb() {
  if (!isDbConfigured()) return
  try {
    await sql`SELECT 1`
  } catch (err) {
    console.error('[db] warmup failed:', err instanceof Error ? err.message : err)
  }
}

const hot = (import.meta as ImportMeta & { hot?: { dispose: (cb: () => void) => void } }).hot
hot?.dispose(() => {
  void resetPool()
})
