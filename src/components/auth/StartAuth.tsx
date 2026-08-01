import { useNavigate } from 'react-router-dom'
import { LogIn, UserPlus } from 'lucide-react'
import AuthShell from './AuthShell'

export default function StartAuth() {
  const navigate = useNavigate()

  return (
    <AuthShell
      title="Get started"
      subtitle="Create an account or log in to continue."
    >
      <div className="grid gap-3">
        <button
          type="button"
          onClick={() => navigate('/signup')}
          className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md hover:shadow-brand/10"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-white">
            <UserPlus className="h-6 w-6" aria-hidden />
          </span>
          <span>
            <span className="block text-lg font-bold text-ink">Sign Up</span>
            <span className="mt-0.5 block text-sm text-muted">
              New here? Create a student or tutor account
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md hover:shadow-brand/10"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-brand">
            <LogIn className="h-6 w-6" aria-hidden />
          </span>
          <span>
            <span className="block text-lg font-bold text-ink">Log in</span>
            <span className="mt-0.5 block text-sm text-muted">
              Already have an account? Welcome back
            </span>
          </span>
        </button>
      </div>
    </AuthShell>
  )
}
