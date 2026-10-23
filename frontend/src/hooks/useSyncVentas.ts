import { useEffect, useRef } from 'react'
import { syncVentasPendientes } from '../lib/sync'

/**
 * Dispara sync mock al montar (si hay red) y al recuperar conexión.
 * Tras registrar una venta, llamar `syncVentasPendientes()` aparte.
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
    return () => window.removeEventListener('online', onOnline)
  }, [])
}
