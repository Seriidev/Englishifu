import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

const MAX_BYTES = 8 * 1024 * 1024

function uploadsDir() {
  return path.join(process.cwd(), 'public', 'uploads', 'library')
}

export async function saveLibraryPdf(dataUrl: string): Promise<string> {
  if (dataUrl.startsWith('/uploads/library/')) return dataUrl
  if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
    return dataUrl
  }
  if (!dataUrl.startsWith('data:application/pdf')) {
    throw new Error('Please upload a PDF file')
  }
  const comma = dataUrl.indexOf(',')
  const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : ''
  if (!base64) throw new Error('Invalid PDF')
  const buf = Buffer.from(base64, 'base64')
  if (buf.length > MAX_BYTES) {
    throw new Error('PDF must be under 8MB')
  }
  const dir = uploadsDir()
  await fs.mkdir(dir, { recursive: true })
  const name = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.pdf`
  await fs.writeFile(path.join(dir, name), buf)
  return `/uploads/library/${name}`
}

export async function loadLibraryPdf(
  pdfUrl: string,
): Promise<{ buffer: Buffer } | { redirect: string }> {
  if (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://')) {
    return { redirect: pdfUrl }
  }
  if (pdfUrl.startsWith('data:application/pdf')) {
    const comma = pdfUrl.indexOf(',')
    const base64 = comma >= 0 ? pdfUrl.slice(comma + 1) : ''
    if (!base64) throw new Error('Invalid PDF')
    return { buffer: Buffer.from(base64, 'base64') }
  }
  if (pdfUrl.startsWith('/uploads/library/')) {
    const name = path.basename(pdfUrl)
    if (!/^[a-zA-Z0-9._-]+\.pdf$/i.test(name)) {
      throw new Error('Invalid PDF path')
    }
    const file = path.join(uploadsDir(), name)
    return { buffer: await fs.readFile(file) }
  }
  throw new Error('PDF is not available')
}
