/** Pulse rings while audio plays (Listening / Listen & Repeat). */
export default function ListeningIndicator({
  title = 'Listening…',
  subtitle = 'Audio plays once. No replay.',
}: {
  title?: string
  subtitle?: string
}) {
  return (
    <div className="flex w-full max-w-sm flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white px-6 py-14 shadow-sm">
      <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand/25" />
        <span className="absolute inline-flex h-14 w-14 animate-pulse rounded-full bg-brand/35" />
        <span className="relative inline-flex h-10 w-10 rounded-full bg-brand shadow-md shadow-brand/30" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-ink">{title}</h3>
      <p className="text-center text-sm text-muted">{subtitle}</p>
    </div>
  )
}
