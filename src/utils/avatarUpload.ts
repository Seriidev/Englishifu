/** Max avatar size before reject (client-side until Vercel Blob is wired). */
const MAX_BYTES = 1.5 * 1024 * 1024

/**
 * Reads an image file into a data URL for localStorage-backed profiles.
 * Swap for @vercel/blob client upload when the API is available.
 */
export function fileToAvatarDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      reject(new Error('Use PNG, JPEG, or WebP'))
      return
    }
    if (file.size > MAX_BYTES) {
      reject(new Error('Image must be under 1.5 MB'))
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('Could not read image'))
    }
    reader.onerror = () => reject(new Error('Could not read image'))
    reader.readAsDataURL(file)
  })
}
