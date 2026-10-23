import { useEffect, useState } from 'react'
import { ventasRepo } from '../data/client'
import { useLiveQuery } from '../data/useLiveQuery'
import { useImpresoraStore } from '../lib/impresora'
import { useSyncUiStore } from '../lib/sync'

/** Indicador de conexión en la TopBar (9a / 9b / 9c). */
export type ConnectionKind = 'offline' | 'online' | 'pending' | 'sincronizado'

export type AppStatus = {
  online: boolean
  connectionKind: ConnectionKind
  printerConnected: boolean
  /** `undefined` mientras carga la primera query. */
  pendingCount: number | undefined
}

/**
 * Estado de la TopBar (conexión, impresora, pendientes).
 * `online` lee navigator.onLine; impresora viene del servicio de emparejado.
 */
export function useAppStatus(): AppStatus {
  const [online, setOnline] = useState(
    () => typeof navigator !== 'undefined' && navigator.onLine,
  )
  const printerConnected = useImpresoraStore((s) => s.connected)
  const justSynced = useSyncUiStore((s) => s.justSynced)
  const pendingCount = useLiveQuery(() => ventasRepo.contarPendientes(), [])

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

  let connectionKind: ConnectionKind
  if (!online) {
    connectionKind = 'offline'
  } else if (justSynced) {
    connectionKind = 'sincronizado'
  } else if ((pendingCount ?? 0) > 0) {
    connectionKind = 'pending'
  } else {
    connectionKind = 'online'
  }

  return { online, connectionKind, printerConnected, pendingCount }
}
