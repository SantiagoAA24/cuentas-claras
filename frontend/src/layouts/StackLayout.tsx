import { Outlet, useLocation } from 'react-router'
import { isTabPath, ROUTES } from '../app/routes'
import { TopBar } from '../components/ui/TopBar'
import { useSmartBack } from '../hooks/useSmartBack'

type ConfigLocationState = { from?: string }

function titleForPath(pathname: string): string {
  if (pathname === ROUTES.impresora) return 'Emparejar impresora'
  if (pathname === ROUTES.configuracion) return 'Configuración'
  if (pathname.startsWith(`${ROUTES.historial}/`)) return 'Detalle de venta'
  return ''
}

function backFallback(pathname: string, from: string | undefined): string {
  if (pathname.startsWith(`${ROUTES.historial}/`)) {
    return ROUTES.historial
  }
  if (pathname === ROUTES.impresora) {
    return ROUTES.configuracion
  }
  if (pathname === ROUTES.configuracion) {
    return from && isTabPath(from) ? from : ROUTES.vender
  }
  return ROUTES.vender
}

export function StackLayout() {
  const location = useLocation()
  const state = location.state as ConfigLocationState | null
  const title = titleForPath(location.pathname)
  const onBack = useSmartBack(backFallback(location.pathname, state?.from))

  return (
    <div className="flex h-dvh flex-col bg-crema">
      <TopBar variant="stacked" title={title} onBack={onBack} />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
