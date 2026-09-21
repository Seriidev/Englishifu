import { useEffect, useId, useState } from 'react'
import { Camera, User } from 'lucide-react'

interface AvatarUploadProps {
  currentAvatarUrl?: string
  onAvatarChange: (file: File) => void
  editable: boolean
  displayName?: string
  size?: 'md' | 'lg'
  uploading?: boolean
}

export default function AvatarUpload({
  currentAvatarUrl,
  onAvatarChange,
  editable,
  displayName = 'Profile',
  size = 'md',
  uploading = false,
}: AvatarUploadProps) {
  const inputId = useId()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const box = size === 'lg' ? 'h-28 w-28 sm:h-32 sm:w-32' : 'h-24 w-24'
  const icon = size === 'lg' ? 'h-12 w-12' : 'h-10 w-10'
  const shownUrl = previewUrl || currentAvatarUrl

  useEffect(() => {
    setPreviewUrl((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
      return null
    })
  }, [currentAvatarUrl])

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const pickFile = (file: File | undefined) => {
    if (!file || uploading) return
    const local = URL.createObjectURL(file)
    setPreviewUrl((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
      return local
    })
    onAvatarChange(file)
  }

  const image = shownUrl ? (
    <img
      src={shownUrl}
      alt={`${displayName} avatar`}
      className={`${box} rounded-full border-2 border-white object-cover shadow-md ring-1 ring-gray-200`}
    />
  ) : (
    <div
      className={`flex ${box} items-center justify-center rounded-full border-2 border-white bg-brand-light text-brand shadow-md ring-1 ring-gray-200`}
      aria-hidden
    >
      <User className={icon} />
    </div>
  )

  if (!editable) {
    return <div className={`relative shrink-0 ${box}`}>{image}</div>
  }

  return (
    <div className={`relative shrink-0 ${box}`}>
      <label
        htmlFor={inputId}
        className={`group relative block ${box} cursor-pointer`}
        aria-label="Change profile photo"
      >
        {image}
        {uploading ? (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-900/40 text-xs font-semibold text-white">
            Saving…
          </span>
        ) : (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-900/0 text-xs font-semibold text-white opacity-0 transition group-hover:bg-slate-900/35 group-hover:opacity-100">
            Change photo
          </span>
        )}
        <span className="absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand text-white shadow-sm">
          <Camera className="h-4 w-4" aria-hidden />
        </span>
      </label>
      <input
        id={inputId}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg,image/heic,image/heif,.png,.jpg,.jpeg,.webp,.heic,.heif"
        className="sr-only"
        disabled={uploading}
        onChange={(e) => {
          pickFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />
    </div>
  )
}
