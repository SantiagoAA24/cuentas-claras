import { Outlet, useLocation, useNavigate } from 'react-router'
import { ROUTES } from '../app/routes'
import { BottomNav } from '../components/ui/BottomNav'
import { OfflineBanner } from '../components/ui/OfflineBanner'
import { TopBar } from '../components/ui/TopBar'
import { useAppStatus } from '../hooks/useAppStatus'

export function TabsLayout() {
  const { online, connectionKind, printerConnected, pendingCount } =
    useAppStatus()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="flex h-dvh flex-col bg-crema">
      <TopBar
        connectionKind={connectionKind}
        printerConnected={printerConnected}
        pendingCount={pendingCount}
        onSettings={() =>
          navigate(ROUTES.configuracion, {
            state: { from: location.pathname },
          })
        }
      />
      {!online ? <OfflineBanner /> : null}
      <main className="min-h-0 flex-1 overflow-y-auto pb-navbar-safe">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
