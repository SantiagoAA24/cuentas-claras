import { useEffect, useState } from 'react'

export type AppStatus = {
  online: boolean
  printerConnected: boolean
  pendingCount: number
}

/**
 * Estado de la TopBar (conexión, impresora, pendientes).
 * `online` lee navigator.onLine; impresora y pendientes son simulados.
 */
export function useAppStatus(): AppStatus {
  const [online, setOnline] = useState(
    () => typeof navigator !== 'undefined' && navigator.onLine,
  )

  useEffect(() => {
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  // TODO: conectar Web Bluetooth / estado real de impresora
  const printerConnected = true
  // TODO: contar ventas pendientes de sync desde Dexie
  const pendingCount = 0

  return { online, printerConnected, pendingCount }
}
