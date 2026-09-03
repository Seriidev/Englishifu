import { ensureLocalPostgres } from './scripts/local-postgres.mjs'
import fs from 'node:fs'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Connect, Plugin, ViteDevServer } from 'vite'

type ApiRoute = {
  file: string
  keys: string[]
  regex: RegExp
  dynamicCount: number
  staticLen: number
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function walkApiFiles(dir: string, relParts: string[], routes: ApiRoute[]) {
  if (!fs.existsSync(dir)) return
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walkApiFiles(full, [...relParts, entry.name], routes)
      continue
    }
    if (!entry.name.endsWith('.ts') || entry.name.endsWith('.d.ts')) continue
    const base = entry.name.slice(0, -3)
    const segs = base === 'index' ? relParts : [...relParts, base]
    const keys: string[] = []
    const regexParts = segs.map((seg) => {
      const dyn = /^\[([^\]]+)\]$/.exec(seg)
      if (dyn) {
        keys.push(dyn[1])
        return '([^/]+)'
      }
      return escapeRegex(seg)
    })
    routes.push({
      file: full,
      keys,
      regex: new RegExp(`^/api/${regexParts.join('/')}/?$`),
      dynamicCount: keys.length,
      staticLen: segs.filter((seg) => !seg.startsWith('[')).join('/').length,
    })
  }
}

function loadRoutes(apiDir: string): ApiRoute[] {
  const routes: ApiRoute[] = []
  walkApiFiles(path.join(apiDir, '_routes'), [], routes)
  routes.sort((a, b) => {
    if (a.dynamicCount !== b.dynamicCount) return a.dynamicCount - b.dynamicCount
    return b.staticLen - a.staticLen
  })
  return routes
}

function pathnameOf(url: string) {
  const q = url.indexOf('?')
  return q >= 0 ? url.slice(0, q) : url
}

function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {}
  if (!header) return out
  for (const part of header.split(';')) {
    const idx = part.indexOf('=')
    if (idx < 0) continue
    const name = part.slice(0, idx).trim()
    if (!name) continue
    try {
      out[name] = decodeURIComponent(part.slice(idx + 1).trim())
    } catch {
      out[name] = part.slice(idx + 1).trim()
    }
  }
  return out
}

function readBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    })
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function attachHelpers(
  req: IncomingMessage,
  res: ServerResponse,
  extras: {
    query: Record<string, string>
    cookies: Record<string, string>
    body: unknown
  },
) {
  Object.assign(req, extras)
  const vRes = res as ServerResponse & {
    status: (code: number) => typeof vRes
    json: (data: unknown) => typeof vRes
    send: (data: unknown) => typeof vRes
    redirect: (statusOrUrl: number | string, url?: string) => typeof vRes
  }
  vRes.status = (code: number) => {
    res.statusCode = code
    return vRes
  }
  vRes.json = (data: unknown) => {
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify(data))
    }
    return vRes
  }
  vRes.send = (data: unknown) => {
    if (res.headersSent) return vRes
    if (data != null && typeof data === 'object') return vRes.json(data)
    res.end(data == null ? '' : String(data))
    return vRes
  }
  vRes.redirect = (statusOrUrl: number | string, url?: string) => {
    if (typeof statusOrUrl === 'string') {
      res.statusCode = 302
      res.setHeader('Location', statusOrUrl)
    } else {
      res.statusCode = statusOrUrl
      res.setHeader('Location', url || '/')
    }
    res.end()
    return vRes
  }
  return { req, res: vRes }
}

async function runApi(
  server: ViteDevServer,
  apiDir: string,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<boolean> {
  const url = req.url || '/'
  const pathname = pathnameOf(url)
  if (!pathname.startsWith('/api/')) return false

  const routes = loadRoutes(apiDir)
  const match = routes.find((route) => route.regex.test(pathname))
  if (!match) {
    res.statusCode = 404
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ error: `No API handler for ${pathname}` }))
    return true
  }

  const captured = pathname.match(match.regex)
  const params: Record<string, string> = {}
  match.keys.forEach((key, i) => {
    params[key] = decodeURIComponent(captured?.[i + 1] || '')
  })

  const parsed = new URL(url, 'http://localhost')
  const query: Record<string, string> = { ...params }
  parsed.searchParams.forEach((value, key) => {
    query[key] = value
  })

  const contentType = String(req.headers['content-type'] || '')
  const isMultipart = contentType.includes('multipart/form-data')
  let body: unknown = undefined
  if (!isMultipart && req.method !== 'GET' && req.method !== 'HEAD') {
    const raw = await readBody(req)
    const text = raw.toString('utf8')
    if (text) {
      if (contentType.includes('application/json') || text.startsWith('{') || text.startsWith('[')) {
        try {
          body = JSON.parse(text)
        } catch {
          body = text
        }
      } else {
        body = text
      }
    } else {
      body = {}
    }
  }

  attachHelpers(req, res, {
    query,
    cookies: parseCookies(req.headers.cookie),
    body,
  })

  const mod = await server.ssrLoadModule(match.file)
  const handler = mod.default as
    | ((req: IncomingMessage, res: ServerResponse) => unknown)
    | undefined
  if (typeof handler !== 'function') {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ error: `API handler has no default export: ${match.file}` }))
    return true
  }

  await handler(req, res)
  return true
}

export function vercelApiPlugin(): Plugin {
  const apiDir = path.resolve(process.cwd(), 'api')

  const middleware = (
    server: ViteDevServer,
    dbReady: Promise<unknown>,
  ): Connect.NextHandleFunction => {
    return (req, res, next) => {
      const url = req.url || ''
      if (!pathnameOf(url).startsWith('/api/')) {
        next()
        return
      }
      void dbReady
        .then(() => runApi(server, apiDir, req, res))
        .then((handled) => {
          if (!handled) next()
        })
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : 'API handler failed'
          console.error('[api]', req.method, pathnameOf(url), err)
          if (!res.headersSent) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ error: message }))
          }
        })
    }
  }

  return {
    name: 'vercel-api-dev',
    configureServer(server) {
      const dbReady = ensureLocalPostgres().catch((err: unknown) => {
        console.error('[db]', err instanceof Error ? err.message : err)
      })
      server.middlewares.use(middleware(server, dbReady))
    },
  }
}
