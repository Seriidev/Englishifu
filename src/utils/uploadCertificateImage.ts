/** Max certificate image size (client-side until Vercel Blob is wired). */
const MAX_BYTES = 5 * 1024 * 1024

/**
 * Reads a certificate image into a data URL for localStorage-backed profiles.
 * Swap for /api/upload-certificate + @vercel/blob when the API is available.
 */
export async function uploadCertificateImage(file: File): Promise<string> {
  if (!['image/png', 'image/jpeg'].includes(file.type)) {
    throw new Error('Please upload a PNG or JPG file')
  }
  if (file.size > MAX_BYTES) {
    throw new Error('File must be under 5MB')
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('Could not read image'))
    }
    reader.onerror = () => reject(new Error('Could not read image'))
    reader.readAsDataURL(file)
  })
}
