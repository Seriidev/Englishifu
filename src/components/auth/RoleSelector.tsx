import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, GraduationCap } from 'lucide-react'
import AuthShell from './AuthShell'

export default function RoleSelector() {
  const navigate = useNavigate()

  return (
    <AuthShell
      title="Create your account"
      subtitle="Choose your account type to continue."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => navigate('/signup/student')}
          className="flex flex-col items-start gap-3 rounded-2xl border border-gray-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md hover:shadow-brand/10"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand">
            <BookOpen className="h-6 w-6" aria-hidden />
          </span>
          <span>
            <span className="block text-lg font-bold text-ink">Student</span>
            <span className="mt-1 block text-sm text-muted">
              I want to learn
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/signup/tutor')}
          className="flex flex-col items-start gap-3 rounded-2xl border border-gray-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md hover:shadow-brand/10"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand">
            <GraduationCap className="h-6 w-6" aria-hidden />
          </span>
          <span>
            <span className="block text-lg font-bold text-ink">Tutor</span>
            <span className="mt-1 block text-sm text-muted">
              I want to teach
            </span>
          </span>
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        <Link to="/start" className="font-semibold text-brand hover:underline">
          Back
        </Link>
        {' · '}
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand hover:underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  )
}
