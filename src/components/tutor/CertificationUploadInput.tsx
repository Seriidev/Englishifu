import { useRef, useState } from 'react'
import { GraduationCap, Paperclip, X } from 'lucide-react'
import type { TutorCertification } from '../../types/user'
import { uploadCertificateImage } from '../../utils/uploadCertificateImage'

const CERT_OPTIONS = [
  'TOEFL',
  'SAT',
  'Duolingo',
  'IELTS',
  'Diploma',
] as const

type CertOption = (typeof CERT_OPTIONS)[number]

interface CertificationUploadInputProps {
  certifications: TutorCertification[]
  onChange: (certs: TutorCertification[]) => void
}

export default function CertificationUploadInput({
  certifications,
  onChange,
}: CertificationUploadInputProps) {
  const [selectedType, setSelectedType] = useState<CertOption | ''>('')
  const [uniName, setUniName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isDiploma = selectedType === 'Diploma'
  const canAdd =
    selectedType !== '' &&
    (!isDiploma || uniName.trim().length > 0) &&
    !uploading

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

  const buildCertName = (): string | null => {
    if (!selectedType) return null
    if (selectedType === 'Diploma') {
      const uni = uniName.trim()
      if (!uni) return null
      return `Diploma — ${uni}`
    }
    return selectedType
  }

  const addCertification = async () => {
    const name = buildCertName()
    if (!name) return
    setError(null)

    if (certifications.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setError('This certification is already added')
      return
    }

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
      name,
      imageUrl,
      uploadedAt: new Date().toISOString(),
    }

    onChange([...certifications, newCert])
    setSelectedType('')
    setUniName('')
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

      <div className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-gray-50/80 p-3 sm:flex-row sm:flex-wrap sm:items-center">
        <select
          value={selectedType}
          onChange={(e) => {
            const next = e.target.value as CertOption | ''
            setSelectedType(next)
            if (next !== 'Diploma') setUniName('')
            setError(null)
          }}
          aria-label="Certification type"
          className="min-w-0 flex-1 rounded-xl border border-transparent bg-transparent px-1 py-1.5 text-sm text-ink outline-none focus:border-brand/30 sm:min-w-[140px]"
        >
          <option value="">Select certification…</option>
          {CERT_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        {isDiploma ? (
          <input
            value={uniName}
            onChange={(e) => setUniName(e.target.value.slice(0, 40))}
            placeholder="University short name"
            maxLength={40}
            className="min-w-0 flex-1 bg-transparent px-1 py-1.5 text-sm text-ink outline-none placeholder:text-gray-400 sm:max-w-[180px]"
            aria-label="University short name"
          />
        ) : null}

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
          disabled={!canAdd}
          className="shrink-0 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : 'Add'}
        </button>
      </div>

      {error ? (
        <p className="text-xs font-medium text-red-600">{error}</p>
      ) : (
        <p className="text-xs text-muted">
          {isDiploma
            ? 'Enter a short university name for Diploma. Optional PNG/JPG scan (max 5MB).'
            : 'Choose a certification. Optional PNG/JPG scan (max 5MB).'}
        </p>
      )}
    </div>
  )
}
