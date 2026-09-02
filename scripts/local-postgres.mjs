import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import EmbeddedPostgres from 'embedded-postgres'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dataDir = path.join(root, 'data', 'pg')

const DEFAULT_URL =
  'postgres://englishcore:englishcore@127.0.0.1:5432/englishcore'

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

function postgresUrl() {
  return (
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL ||
    DEFAULT_URL
  )
}

function parseLocalUrl(url) {
  const parsed = new URL(url)
  const isLocal =
    parsed.hostname === 'localhost' ||
    parsed.hostname === '127.0.0.1' ||
    parsed.hostname === '::1'
  return {
    isLocal,
    user: decodeURIComponent(parsed.username || 'englishcore'),
    password: decodeURIComponent(parsed.password || 'englishcore'),
    port: Number(parsed.port || 5432),
    database: decodeURIComponent(parsed.pathname.replace(/^\//, '') || 'englishcore'),
  }
}

async function canConnect(url) {
  const client = new pg.Client({
    connectionString: url,
    ssl: false,
    connectionTimeoutMillis: 1500,
  })
  try {
    await client.connect()
    await client.query('SELECT 1')
    return true
  } catch {
    return false
  } finally {
    try {
      await client.end()
    } catch {
      /* ignore */
    }
  }
}

function tryDockerUp() {
  return new Promise((resolve) => {
    const child = spawn('docker', ['compose', 'up', '-d'], {
      cwd: root,
      stdio: 'ignore',
      shell: true,
    })
    child.on('error', () => resolve(false))
    child.on('exit', (code) => resolve(code === 0))
  })
}

let starting = null
let embedded = null

export async function ensureLocalPostgres() {
  if (!process.env.POSTGRES_URL) {
    process.env.POSTGRES_URL = DEFAULT_URL
  }
  const url = postgresUrl()
  const parsed = parseLocalUrl(url)
  if (!parsed.isLocal) return url
  if (!starting) {
    starting = startLocalCluster(url, parsed)
  }
  return starting
}

async function startLocalCluster(url, parsed) {
  if (!(await canConnect(url))) {
    console.log('[db] Starting local Postgres…')
    const dockerOk = await tryDockerUp()
    let up = false
    if (dockerOk) {
      for (let i = 0; i < 20; i += 1) {
        if (await canConnect(url)) {
          console.log('[db] Docker Postgres is up.')
          up = true
          break
        }
        await new Promise((r) => setTimeout(r, 1000))
      }
    }
    if (!up) {
      embedded = new EmbeddedPostgres({
        databaseDir: dataDir,
        user: parsed.user,
        password: parsed.password,
        port: parsed.port,
        persistent: true,
        authMethod: 'password',
        initdbFlags: ['--encoding=UTF8', '--locale=C'],
      })
      const alreadyInit = fs.existsSync(path.join(dataDir, 'PG_VERSION'))
      if (!alreadyInit) {
        await embedded.initialise()
      }
      await embedded.start()
      try {
        await embedded.createDatabase(parsed.database)
      } catch {
        /* already exists */
      }
      if (!(await canConnect(url))) {
        throw new Error(`Local Postgres started but ${url} is still unreachable`)
      }
      console.log('[db] Embedded Postgres is up on port', parsed.port)
    }
  }
  await migrateIfNeeded(url)
  return url
}

const SQL_FILES = [
  'sql/bookings.sql',
  'sql/notifications_reviews_speaking.sql',
  'sql/admin_moderation.sql',
  'sql/auth_migration.sql',
]

async function migrateIfNeeded(url) {
  const client = new pg.Client({
    connectionString: url,
    ssl: false,
    options: '-c client_encoding=UTF8',
  })
  await client.connect()
  try {
    const { rows } = await client.query(`
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'app_users'
    `)
    const hasUsers = rows.length > 0
    let hasPassword = false
    if (hasUsers) {
      const cols = await client.query(`
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'app_users' AND column_name = 'password_hash'
      `)
      hasPassword = cols.rows.length > 0
    }
    if (hasUsers && hasPassword) return
    console.log('[db] Applying SQL migrations…')
    for (const rel of SQL_FILES) {
      const sql = fs.readFileSync(path.join(root, rel), 'utf8')
      await client.query(sql)
      console.log('[db] ', rel, 'ok')
    }
  } finally {
    await client.end()
  }
}

if (process.argv[1] && path.normalize(process.argv[1]) === path.normalize(fileURLToPath(import.meta.url))) {
  try {
    await ensureLocalPostgres()
  } catch (err) {
    console.error(err instanceof Error ? err.message : err)
    process.exit(1)
  }
}
