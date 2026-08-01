interface RecordingIndicatorProps {
  active: boolean
}

export default function RecordingIndicator({ active }: RecordingIndicatorProps) {
  if (!active) return null

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-600">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
      </span>
      Recording...
    </div>
  )
}
