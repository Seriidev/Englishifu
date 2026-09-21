import fs from 'node:fs/promises'
import path from 'node:path'
import { persistIfDataUrl, parseDataUrl, saveDataUrl } from './saveMedia.js'

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
  return saveDataUrl(dataUrl, 'library')
}

export async function loadLibraryPdf(
  pdfUrl: string,
): Promise<{ buffer: Buffer } | { redirect: string }> {
  if (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://')) {
    const res = await fetch(pdfUrl)
    if (!res.ok) throw new Error('PDF is not available')
    const buf = Buffer.from(await res.arrayBuffer())
    return { buffer: buf }
  }
  if (pdfUrl.startsWith('data:application/pdf')) {
    const { buffer } = parseDataUrl(pdfUrl)
    return { buffer }
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

export async function persistLibraryPdfUrl(pdfUrl: string): Promise<string> {
  return persistIfDataUrl(pdfUrl, 'library') ?? pdfUrl
}
