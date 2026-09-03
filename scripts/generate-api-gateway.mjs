import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const apiDir = path.join(root, 'api')
const routesDir = path.join(apiDir, '_routes')

function walk(dir, relParts, files) {
  if (!fs.existsSync(dir)) return
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue
    if (entry.name === '[[...path]].ts') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(full, [...relParts, entry.name], files)
      continue
    }
    if (!entry.name.endsWith('.ts') || entry.name.endsWith('.d.ts')) continue
    files.push({ full, relParts, name: entry.name })
  }
}

function rewriteLibImports(source) {
  return source
    .replaceAll("'../../../_lib/", "'../../../../_lib/")
    .replaceAll("'../../_lib/", "'../../../_lib/")
    .replaceAll("'../_lib/", "'../../_lib/")
    .replaceAll("'./_lib/", "'../_lib/")
    .replaceAll('"../../../_lib/', '"../../../../_lib/')
    .replaceAll('"../../_lib/', '"../../../_lib/')
    .replaceAll('"../_lib/', '"../../_lib/')
    .replaceAll('"./_lib/', '"../_lib/')
}

function identFrom(relFile) {
  return (
    'r_' +
    relFile
      .replace(/\.ts$/, '')
      .replace(/\[|\]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
  )
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function toPosix(p) {
  return p.split(path.sep).join('/')
}

const pending = []
walk(apiDir, [], pending)

if (!fs.existsSync(routesDir)) fs.mkdirSync(routesDir, { recursive: true })

for (const file of pending) {
  const destDir = path.join(routesDir, ...file.relParts)
  fs.mkdirSync(destDir, { recursive: true })
  const dest = path.join(destDir, file.name)
  const source = rewriteLibImports(fs.readFileSync(file.full, 'utf8'))
  fs.writeFileSync(dest, source)
  fs.unlinkSync(file.full)
}

function pruneEmpty(dir) {
  if (!fs.existsSync(dir) || dir === apiDir || dir === routesDir) return
  const entries = fs.readdirSync(dir)
  for (const name of entries) {
    const full = path.join(dir, name)
    if (fs.statSync(full).isDirectory()) pruneEmpty(full)
  }
  if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir)
}

for (const name of fs.readdirSync(apiDir)) {
  if (name.startsWith('_') || name === '[[...path]].ts') continue
  const full = path.join(apiDir, name)
  if (fs.statSync(full).isDirectory()) pruneEmpty(full)
}

const moved = []
walk(routesDir, [], moved)

const routes = moved.map((file) => {
  const base = file.name.slice(0, -3)
  const segs = base === 'index' ? file.relParts : [...file.relParts, base]
  const keys = []
  const regexParts = segs.map((seg) => {
    const dyn = /^\[([^\]]+)\]$/.exec(seg)
    if (dyn) {
      keys.push(dyn[1])
      return '([^/]+)'
    }
    return escapeRegex(seg)
  })
  const relFile = toPosix(path.join(...file.relParts, file.name))
  return {
    relFile,
    ident: identFrom(relFile),
    importPath: `./_routes/${relFile.replace(/\.ts$/, '')}`,
    regex: `^/api/${regexParts.join('/')}/?$`,
    keys,
    dynamicCount: keys.length,
    staticLen: segs.filter((seg) => !seg.startsWith('[')).join('/').length,
  }
})

routes.sort((a, b) => {
  if (a.dynamicCount !== b.dynamicCount) return a.dynamicCount - b.dynamicCount
  return b.staticLen - a.staticLen
})

const imports = routes
  .map((r) => `import ${r.ident} from '${r.importPath}'`)
  .join('\n')

const routeEntries = routes
  .map(
    (r) =>
      `  { re: new RegExp(${JSON.stringify(r.regex)}), keys: ${JSON.stringify(r.keys)}, handler: ${r.ident} },`,
  )
  .join('\n')

const gateway = `import type { VercelRequest, VercelResponse } from '@vercel/node'
${imports}

type ApiHandler = (
  req: VercelRequest,
  res: VercelResponse,
) => unknown | Promise<unknown>

const routes: { re: RegExp; keys: string[]; handler: ApiHandler }[] = [
${routeEntries}
]

export const config = {
  api: { bodyParser: false },
  maxDuration: 60,
}

async function readJsonBody(req: VercelRequest): Promise<unknown> {
  const contentType = String(req.headers['content-type'] || '')
  if (contentType.includes('multipart/form-data')) return undefined
  if (req.body !== undefined) return req.body
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  const text = Buffer.concat(chunks).toString('utf8')
  if (!text) return {}
  if (contentType.includes('application/json') || text.startsWith('{') || text.startsWith('[')) {
    try {
      return JSON.parse(text)
    } catch {
      return text
    }
  }
  return text
}

function pathnameOf(req: VercelRequest): string {
  const url = req.url || '/'
  const pathOnly = url.split('?')[0]
  if (pathOnly.startsWith('/api/')) return pathOnly
  const pathQ = req.query.path
  const segs = Array.isArray(pathQ) ? pathQ : pathQ ? [String(pathQ)] : []
  return segs.length ? \`/api/\${segs.join('/')}\` : '/api'
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const pathname = pathnameOf(req)
  const match = routes.find((route) => route.re.test(pathname))
  if (!match) {
    res.status(404).json({ error: \`No API handler for \${pathname}\` })
    return
  }

  const captured = pathname.match(match.re)
  const params: Record<string, string> = {}
  match.keys.forEach((key, i) => {
    params[key] = decodeURIComponent(captured?.[i + 1] || '')
  })
  req.query = { ...req.query, ...params }

  const body = await readJsonBody(req)
  if (body !== undefined) req.body = body

  return match.handler(req, res)
}
`

fs.writeFileSync(path.join(apiDir, '[[...path]].ts'), gateway)
console.log(`Moved ${moved.length} routes into api/_routes and wrote api/[[...path]].ts`)
