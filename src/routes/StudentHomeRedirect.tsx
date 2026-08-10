import { Navigate } from 'react-router-dom'

/** Legacy /dashboard → Study Place hub */
export default function StudentHomeRedirect() {
  return <Navigate to="/study" replace />
}
