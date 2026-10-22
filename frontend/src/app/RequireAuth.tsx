import { Navigate, Outlet, useLocation } from 'react-router'
import { useSessionHydrated } from '../hooks/useSessionHydrated'
import { useSessionStore } from '../stores/sessionStore'
import { ROUTES } from './routes'

/** Redirige a /login si no hay sesión. */
export function RequireAuth() {
  const hydrated = useSessionHydrated()
  const user = useSessionStore((s) => s.user)
  const location = useLocation()

  if (!hydrated) {
    return null
  }

  if (!user) {
    return (
      <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />
    )
  }

  return <Outlet />
}
