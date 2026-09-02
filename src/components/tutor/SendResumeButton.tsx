import { useRef, useState } from 'react'
import { FileText } from 'lucide-react'
import type { TutorStatus } from '../../types/user'
import { uploadTutorResume } from '../../utils/adminPanelApi'

export default function SendResumeButton({
  className,
  enabled = true,
  status,
  onBeforeSend,
  onSent,
}: {
  className?: string
  enabled?: boolean
  status?: TutorStatus
  onBeforeSend?: () => Promise<boolean>
  onSent?: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const approved = status === 'approved'
  const pending = status === 'pending' || done
  const canClick = enabled && !busy && !pending && !approved

  const label = approved
    ? 'Approved'
    : busy
      ? 'Uploading…'
      : pending
        ? 'Under review'
        : 'Send resume'

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (!file) return
          setBusy(true)
          setError(null)
          void uploadTutorResume(file)
            .then(() => {
              setDone(true)
              onSent?.()
            })
            .catch((err) =>
              setError(err instanceof Error ? err.message : 'Upload failed'),
            )
            .finally(() => setBusy(false))
        }}
      />
      <button
        type="button"
        disabled={!canClick}
        title={
          approved
            ? 'Your profile is approved'
            : pending
              ? 'Waiting for admin review'
              : enabled
                ? 'Upload a PDF resume for admin review'
                : 'Fill all required profile fields first'
        }
        onClick={() => {
          void (async () => {
            if (onBeforeSend) {
              const ok = await onBeforeSend()
              if (!ok) return
            }
            inputRef.current?.click()
          })()
        }}
        className={
          className ||
          'inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60'
        }
      >
        <FileText className="h-4 w-4" aria-hidden />
        {label}
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      {!enabled && !pending && !approved ? (
        <p className="max-w-[14rem] text-right text-xs text-slate-400">
          Fill every required field to send your resume.
        </p>
      ) : null}
    </div>
  )
}
