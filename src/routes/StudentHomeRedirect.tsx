import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { studentPublicProfilePath } from '../utils/authStorage'

/** Legacy /dashboard → student profile */
export default function StudentHomeRedirect() {
  const { user } = useAuth()
  if (user?.role === 'student' && user.handle) {
    return <Navigate to={studentPublicProfilePath(user.handle)} replace />
  }
  return <Navigate to="/start" replace />
}
