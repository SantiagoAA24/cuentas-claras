import { useEffect, useRef } from 'react'
import { syncVentasPendientes } from '../lib/sync'

const INTERVALO_MS = 30_000

/**
 * Dispara sync al montar, al recuperar conexión y cada 30s si la pestaña está visible.
 * Tras registrar una venta / anular / producto, llamar `syncVentasPendientes()` aparte.
 */
export function useSyncVentas(): void {
  const ranMount = useRef(false)

  useEffect(() => {
    if (!ranMount.current) {
      ranMount.current = true
      void syncVentasPendientes()
    }

    const onOnline = () => {
      void syncVentasPendientes()
    }
    window.addEventListener('online', onOnline)

    const tick = () => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) return
      if (document.visibilityState !== 'visible') return
      void syncVentasPendientes()
    }
    const id = window.setInterval(tick, INTERVALO_MS)

    return () => {
      window.removeEventListener('online', onOnline)
      window.clearInterval(id)
    }
  }, [])
}
