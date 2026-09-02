import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function loadEnvFile(fileName) {
  const filePath = path.join(root, fileName)
  if (!fs.existsSync(filePath)) return
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq < 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = value
  }
}

loadEnvFile('.env')
loadEnvFile('.env.local')

const url =
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.DATABASE_URL

if (!url) {
  console.error('POSTGRES_URL is missing. Check frontend/.env')
  process.exit(1)
}

const ssl = /localhost|127\.0\.0\.1|::1/.test(url)
  ? false
  : { rejectUnauthorized: false }

const files = [
  'sql/bookings.sql',
  'sql/notifications_reviews_speaking.sql',
  'sql/admin_moderation.sql',
  'sql/auth_migration.sql',
  'sql/admin_panel.sql',
  'sql/library_books.sql',
  'sql/student_boosts.sql',
]

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function connectWithRetry(attempts = 25) {
  let lastError = null
  for (let i = 1; i <= attempts; i += 1) {
    const client = new pg.Client({
      connectionString: url,
      ssl,
      options: '-c client_encoding=UTF8',
    })
    try {
      await client.connect()
      return client
    } catch (err) {
      lastError = err
      try {
        await client.end()
      } catch {
        /* ignore */
      }
      await sleep(1000)
    }
  }
  throw lastError ?? new Error('Postgres is not reachable')
}

const client = await connectWithRetry()
try {
  for (const rel of files) {
    const sql = fs.readFileSync(path.join(root, rel), 'utf8')
    process.stdout.write(`Applying ${rel}… `)
    await client.query(sql)
    console.log('ok')
  }
  console.log('Local database is ready.')
} catch (err) {
  console.error(err instanceof Error ? err.message : err)
  process.exitCode = 1
} finally {
  await client.end()
}
