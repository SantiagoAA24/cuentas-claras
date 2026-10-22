import type { ReactNode } from 'react'
import { Toaster } from './ui/Toast'

type AppShellProps = {
  children: ReactNode
  /**
   * Offset inferior del Toaster. En Vender debe quedar por encima del panel
   * del pedido (p. ej. 240, como en el diseño 9c).
   */
  toastBottomOffset?: number
}

/** Contenedor de pantallas autenticadas: monta el Toaster una sola vez. */
export function AppShell({ children, toastBottomOffset }: AppShellProps) {
  return (
    <>
      {children}
      <Toaster bottomOffset={toastBottomOffset} />
    </>
  )
}
