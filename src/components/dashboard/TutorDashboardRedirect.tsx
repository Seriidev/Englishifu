import { Navigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { tutorProfilePath } from '../../utils/authStorage'

/** Legacy /tutor/dashboard → public profile */
export default function TutorDashboardRedirect() {
  const { user } = useAuth()
  if (user?.role === 'tutor') {
    return <Navigate to={tutorProfilePath(user.handle)} replace />
  }
  return <Navigate to="/start" replace />
}
