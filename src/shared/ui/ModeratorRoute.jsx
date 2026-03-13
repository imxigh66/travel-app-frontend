import { Navigate } from 'react-router-dom'

// Декодирует JWT и возвращает роль
function getRoleFromToken() {
  const token = localStorage.getItem('authToken')
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return (
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
      payload.role ??
      null
    )
  } catch {
    return null
  }
}

export default function ModeratorRoute({ children }) {
  const role = getRoleFromToken()

  if (!role) return <Navigate to="/login" replace />
  if (role !== 'Moderator') return <Navigate to="/explore" replace />

  return children
}