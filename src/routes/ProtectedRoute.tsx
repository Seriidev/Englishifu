import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import type { UserRole } from '../types/user'
import { dashboardPathForRole } from '../utils/authStorage'

interface ProtectedRouteProps {
  requiredRole?: UserRole
  children: React.ReactNode
}

export default function ProtectedRoute({
  requiredRole,
  children,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-slate-50 text-sm text-slate-600">
        Loading…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/start" replace state={{ from: location.pathname }} />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={dashboardPathForRole(user.role, user)} replace />
  }

  return <>{children}</>
}
