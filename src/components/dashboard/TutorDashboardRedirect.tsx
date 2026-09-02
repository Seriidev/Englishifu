import { Navigate } from 'react-router-dom'

/** Legacy /tutor/dashboard → teacher workspace */
export default function TutorDashboardRedirect() {
  return <Navigate to="/tutor" replace />
}
