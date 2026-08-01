import { Link } from 'react-router-dom'

export default function IncompleteProfileBanner() {
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-amber-800">
        Your profile is incomplete — finish it to start receiving students.
      </span>
      <Link
        to="/tutor/complete-profile"
        className="shrink-0 text-sm font-semibold text-amber-900 underline underline-offset-2"
      >
        Complete Profile →
      </Link>
    </div>
  )
}
