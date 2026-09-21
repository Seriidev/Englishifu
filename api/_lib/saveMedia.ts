import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

const MAX_BYTES = 15 * 1024 * 1024

export type MediaKind =
  | 'avatars'
  | 'covers'
  | 'certs'
  | 'library'
  | 'banners'
  | 'news'
  | 'resumes'

export function isDataUrl(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('data:')
}

export function isPublicMediaUrl(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    (value.startsWith('https://') ||
      value.startsWith('http://') ||
      value.startsWith('/'))
  )
}

const MEDIA_KINDS: readonly MediaKind[] = [
  'avatars',
  'covers',
  'certs',
  'library',
  'banners',
  'news',
  'resumes',
]

export function isMediaKind(value: string): value is MediaKind {
  return (MEDIA_KINDS as readonly string[]).includes(value)
}

/**
 * Public http(s)/relative URLs, plus leftover data: URLs still stored in Postgres.
 * Local disk files are rewritten to /api/media so Vite can serve newly uploaded
 * files (public/uploads is watcher-ignored and skipped by Vite's publicFiles set).
 */
export function publicMediaUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null
  if (isDataUrl(value)) return value
  if (value.startsWith('/uploads/')) {
    return `/api/media/${value.slice('/uploads/'.length)}`
  }
  if (isPublicMediaUrl(value)) return value
  return null
}

export function contentTypeForName(name: string): string {
  const ext = path.extname(name).toLowerCase()
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  if (ext === '.png') return 'image/png'
  if (ext === '.webp') return 'image/webp'
  if (ext === '.gif') return 'image/gif'
  if (ext === '.pdf') return 'application/pdf'
  return 'application/octet-stream'
}

export function localUploadFilePath(
  kind: string,
  name: string,
): string | null {
  if (!isMediaKind(kind)) return null
  if (!name || name.includes('..') || name.includes('/') || name.includes('\\')) {
    return null
  }
  if (!/^[A-Za-z0-9._-]+$/.test(name)) return null
  const root = path.resolve(process.cwd(), 'public', 'uploads', kind)
  const file = path.resolve(root, name)
  const rel = path.relative(root, file)
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return null
  return file
}

export async function readLocalUpload(
  kind: string,
  name: string,
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const file = localUploadFilePath(kind, name)
  if (!file) return null
  try {
    const buffer = await fs.readFile(file)
    return { buffer, contentType: contentTypeForName(name) }
  } catch {
    return null
  }
}

function extForMime(mime: string, fallback: string): string {
  if (mime.includes('pdf')) return 'pdf'
  if (mime.includes('png')) return 'png'
  if (mime.includes('webp')) return 'webp'
  if (mime.includes('gif')) return 'gif'
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg'
  return fallback
}

export function parseDataUrl(dataUrl: string): { mime: string; buffer: Buffer } {
  const comma = dataUrl.indexOf(',')
  const header = comma >= 0 ? dataUrl.slice(0, comma) : 'data:application/octet-stream'
  const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : ''
  if (!base64) throw new Error('Invalid file data')
  const mime = header.slice(5).split(';')[0] || 'application/octet-stream'
  const buffer = Buffer.from(base64, 'base64')
  if (buffer.length > MAX_BYTES) {
    throw new Error('File must be under 15MB')
  }
  return { mime, buffer }
}

function fileName(kind: MediaKind, mime: string): string {
  const fallback = kind === 'library' || kind === 'resumes' ? 'pdf' : 'jpg'
  return `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${extForMime(mime, fallback)}`
}

async function putVercelBlob(
  pathname: string,
  buffer: Buffer,
  contentType: string,
): Promise<string | null> {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) return null
  const res = await fetch(
    `https://blob.vercel-storage.com/${pathname}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'x-content-type': contentType,
        'x-api-blob-access': 'public',
      },
      body: new Uint8Array(buffer),
    },
  )
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Blob upload failed (${res.status}) ${text}`.trim())
  }
  const data = (await res.json()) as { url?: string }
  if (!data.url) throw new Error('Blob upload did not return a URL')
  return data.url
}

async function writeLocalUpload(
  kind: MediaKind,
  name: string,
  buffer: Buffer,
): Promise<string> {
  const dir = path.join(process.cwd(), 'public', 'uploads', kind)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(path.join(dir, name), buffer)
  return `/uploads/${kind}/${name}`
}

/**
 * Store a data URL (or pass through an existing http(s)/relative URL).
 * Prefers Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set; otherwise writes
 * to `public/uploads` on local/dev (Vercel’s filesystem is ephemeral).
 */
export async function saveDataUrl(
  dataUrl: string,
  kind: MediaKind,
): Promise<string> {
  if (isPublicMediaUrl(dataUrl) && !isDataUrl(dataUrl)) return dataUrl
  if (!isDataUrl(dataUrl)) {
    throw new Error('Expected an uploaded file')
  }
  const { mime, buffer } = parseDataUrl(dataUrl)
  const name = fileName(kind, mime)
  const pathname = `${kind}/${name}`
  const blobUrl = await putVercelBlob(pathname, buffer, mime)
  if (blobUrl) return blobUrl
  try {
    return await writeLocalUpload(kind, name, buffer)
  } catch {
    return dataUrl
  }
}

export async function persistIfDataUrl(
  value: string | null | undefined,
  kind: MediaKind,
): Promise<string | null> {
  if (!value) return null
  if (!isDataUrl(value)) return value
  try {
    return await saveDataUrl(value, kind)
  } catch (err) {
    if (process.env.VERCEL && !process.env.BLOB_READ_WRITE_TOKEN) {
      console.error(
        'media persist skipped (set BLOB_READ_WRITE_TOKEN):',
        err instanceof Error ? err.message : err,
      )
      return value
    }
    throw err
  }
}
