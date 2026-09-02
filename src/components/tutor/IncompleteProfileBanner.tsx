import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

export default function IncompleteProfileBanner() {
  const { user } = useAuth()
  const pending = user?.role === 'tutor' && user.status === 'pending'

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-amber-800">
        {pending
          ? 'Your profile is pending admin review. You’ll get a notification when it’s approved.'
          : 'Your profile is incomplete — finish it to start receiving students.'}
      </span>
      {!pending ? (
        <Link
          to="/tutor/complete-profile"
          className="shrink-0 text-sm font-semibold text-amber-900 underline underline-offset-2"
        >
          Complete Profile →
        </Link>
      ) : (
        <Link
          to="/tutor/profile"
          className="shrink-0 text-sm font-semibold text-amber-900 underline underline-offset-2"
        >
          Edit Profile →
        </Link>
      )}
    </div>
  )
}
