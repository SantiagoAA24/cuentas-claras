import { Navigate, Outlet } from 'react-router'
import { useSessionHydrated } from '../hooks/useSessionHydrated'
import { useSessionStore } from '../stores/sessionStore'
import { ROUTES } from './routes'

/** Redirige a /vender si ya hay sesión (p. ej. /login). */
export function GuestOnly() {
  const hydrated = useSessionHydrated()
  const user = useSessionStore((s) => s.user)

  if (!hydrated) {
    return null
  }

  if (user) {
    return <Navigate to={ROUTES.vender} replace />
  }

  return <Outlet />
}
