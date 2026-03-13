import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated } from '../lib/auth'

/**
 * Envolve rotas que exigem autenticação.
 * Redireciona para /login preservando a URL de destino no state,
 * para que o usuário volte para onde tentava ir após o login.
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation()

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}
