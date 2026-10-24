import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { useSessionHydrated } from '../hooks/useSessionHydrated'
import { useSessionStore } from '../stores/sessionStore'
import { ROUTES } from './routes'

/** Redirige a /login si no hay sesión con access token. */
export function RequireAuth() {
  const hydrated = useSessionHydrated()
  const user = useSessionStore((s) => s.user)
  const accessToken = useSessionStore((s) => s.accessToken)
  const logout = useSessionStore((s) => s.logout)
  const location = useLocation()

  useEffect(() => {
    if (hydrated && user && !accessToken) {
      logout()
    }
  }, [hydrated, user, accessToken, logout])

  if (!hydrated) {
    return null
  }

  if (!user || !accessToken) {
    return (
      <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />
    )
  }

  return <Outlet />
}
