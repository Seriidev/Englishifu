import { useEffect, useRef, useState } from 'react'
import { Plus, User } from 'lucide-react'

interface AvatarUploadProps {
  currentAvatarUrl?: string
  onAvatarChange: (file: File) => void
  editable: boolean
  displayName?: string
  size?: 'md' | 'lg'
}

export default function AvatarUpload({
  currentAvatarUrl,
  onAvatarChange,
  editable,
  displayName = 'Profile',
  size = 'md',
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const box = size === 'lg' ? 'h-28 w-28 sm:h-32 sm:w-32' : 'h-24 w-24'
  const icon = size === 'lg' ? 'h-12 w-12' : 'h-10 w-10'
  const shownUrl = previewUrl || currentAvatarUrl

  useEffect(() => {
    // After a successful save, parent updates currentAvatarUrl — drop blob preview.
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

  return (
    <div className={`group relative shrink-0 ${box}`}>
      {shownUrl ? (
        <img
          src={shownUrl}
          alt={`${displayName} avatar`}
          className={`${box} rounded-full border-2 border-white object-cover shadow-md ring-1 ring-gray-200`}
        />
      ) : (
        <div
          className={`flex ${box} items-center justify-center rounded-full border-2 border-white bg-brand-light text-brand shadow-md ring-1 ring-gray-200`}
          aria-label={`${displayName} avatar`}
        >
          <User className={icon} aria-hidden />
        </div>
      )}

      {editable ? (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-ink opacity-100 shadow-sm transition hover:bg-gray-200 sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="Change avatar"
          >
            <Plus className="h-4 w-4" aria-hidden />
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg,.png,.jpg,.jpeg,.webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                const local = URL.createObjectURL(file)
                setPreviewUrl((prev) => {
                  if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
                  return local
                })
                onAvatarChange(file)
              }
              e.target.value = ''
            }}
          />
        </>
      ) : null}
    </div>
  )
}
