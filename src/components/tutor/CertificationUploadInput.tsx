import { useRef, useState } from 'react'
import { GraduationCap, Paperclip, X } from 'lucide-react'
import type { TutorCertification } from '../../types/user'
import { uploadCertificateImage } from '../../utils/uploadCertificateImage'

interface CertificationUploadInputProps {
  certifications: TutorCertification[]
  onChange: (certs: TutorCertification[]) => void
}

export default function CertificationUploadInput({
  certifications,
  onChange,
}: CertificationUploadInputProps) {
  const [nameInput, setNameInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)

    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      setError('Please upload a PNG or JPG file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB')
      return
    }
    setPendingFile(file)
  }

  const addCertification = async () => {
    if (!nameInput.trim()) return
    setError(null)

    let imageUrl: string | undefined
    if (pendingFile) {
      setUploading(true)
      try {
        imageUrl = await uploadCertificateImage(pendingFile)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
        setUploading(false)
        return
      }
      setUploading(false)
    }

    const newCert: TutorCertification = {
      id: crypto.randomUUID(),
      name: nameInput.trim(),
      imageUrl,
      uploadedAt: new Date().toISOString(),
    }

    onChange([...certifications, newCert])
    setNameInput('')
    setPendingFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeCertification = (id: string) => {
    onChange(certifications.filter((c) => c.id !== id))
  }

  return (
    <div className="space-y-3">
      {certifications.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {certifications.map((cert) => (
            <div
              key={cert.id}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 pr-3 shadow-sm"
            >
              {cert.imageUrl ? (
                <img
                  src={cert.imageUrl}
                  alt={cert.name}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light">
                  <GraduationCap className="h-[18px] w-[18px] text-brand" />
                </div>
              )}
              <span className="text-sm font-medium text-ink">{cert.name}</span>
              <button
                type="button"
                onClick={() => removeCertification(cert.id)}
                className="text-muted transition hover:text-red-500"
                aria-label={`Remove ${cert.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-gray-50/80 p-3 sm:flex-row sm:items-center">
        <input
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Certification name (e.g. TEFL)"
          className="min-w-0 flex-1 bg-transparent px-1 py-1.5 text-sm text-ink outline-none placeholder:text-gray-400"
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex shrink-0 items-center gap-1 text-sm text-muted transition hover:text-ink"
        >
          <Paperclip className="h-3.5 w-3.5" />
          {pendingFile
            ? `${pendingFile.name.slice(0, 15)}${pendingFile.name.length > 15 ? '…' : ''}`
            : 'Attach image'}
        </button>

        <button
          type="button"
          onClick={() => void addCertification()}
          disabled={!nameInput.trim() || uploading}
          className="shrink-0 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : 'Add'}
        </button>
      </div>

      {error ? (
        <p className="text-xs font-medium text-red-600">{error}</p>
      ) : (
        <p className="text-xs text-muted">
          Optional PNG/JPG scan (max 5MB). Name is required.
        </p>
      )}
    </div>
  )
}
