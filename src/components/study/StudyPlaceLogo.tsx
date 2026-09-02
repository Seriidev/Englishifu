/** Reserved slot for the Study Place wordmark. Drop the SVG in here later. */
export default function StudyPlaceLogo({ className = '' }: { className?: string }) {
  return (
    <span
      className={`block h-5 w-[7.25rem] shrink-0 ${className}`}
      aria-hidden
    />
  )
}
