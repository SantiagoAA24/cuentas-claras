import { Outlet, useLocation } from 'react-router'
import { ROUTES } from '../app/routes'
import { useImpresoraBootstrap } from '../hooks/useImpresoraBootstrap'
import { useSyncVentas } from '../hooks/useSyncVentas'
import { Toaster } from './ui/Toast'

/** Offset del toast 9c sobre el panel del pedido en Vender. */
const TOAST_OFFSET_VENDER = 240

/**
 * Contenedor de pantallas autenticadas: monta el Toaster una sola vez
 * para TabsLayout y StackLayout.
 */
export function AppShell() {
  useImpresoraBootstrap()
  useSyncVentas()
  const location = useLocation()
  const bottomOffset =
    location.pathname === ROUTES.vender ? TOAST_OFFSET_VENDER : 16

  return (
    <>
      <Outlet />
      <Toaster bottomOffset={bottomOffset} />
    </>
  )
}
