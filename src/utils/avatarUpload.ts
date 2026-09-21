/** Accept files up to 5 MB; we compress before saving. */
const MAX_INPUT_BYTES = 5 * 1024 * 1024
/** Longest side after resize — keeps data URLs small enough for /api/auth/me. */
const MAX_EDGE = 512
const JPEG_QUALITY = 0.82

function isAllowedImage(file: File) {
  if (
    file.type.startsWith('image/') &&
    file.type !== 'image/svg+xml' &&
    file.type !== 'image/gif'
  ) {
    return true
  }
  return /\.(png|jpe?g|webp|heic|heif|bmp)$/i.test(file.name)
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read image'))
    }
    img.src = url
  })
}

/**
 * Reads an image, resizes it, and returns a compact JPEG data URL.
 * Large phone photos (up to 5 MB) are accepted, then compressed for storage.
 */
export async function fileToAvatarDataUrl(file: File): Promise<string> {
  if (!isAllowedImage(file)) {
    throw new Error('Use PNG, JPEG, or WebP')
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error('Image must be under 5 MB')
  }

  const img = await loadImage(file)
  const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height))
  const width = Math.max(1, Math.round(img.width * scale))
  const height = Math.max(1, Math.round(img.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not process image')
  ctx.drawImage(img, 0, 0, width, height)

  const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY)
  if (!dataUrl.startsWith('data:image/')) {
    throw new Error('Could not process image')
  }
  return dataUrl
}
