import { Outlet } from 'react-router'
import { Toaster } from './ui/Toast'

/**
 * Contenedor de pantallas autenticadas: monta el Toaster una sola vez
 * para TabsLayout y StackLayout.
 *
 * toastBottomOffset se podrá pasar más adelante (p. ej. Vender sobre el
 * panel del pedido) vía outlet context si hace falta.
 */
export function AppShell() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  )
}
