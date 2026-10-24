import { useCallback, useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { configuracionRepo } from '../data/client'
import { useLiveQuery } from '../data/useLiveQuery'
import {
  esperarBackoffSiHaceFalta,
  sincronizarInicial,
} from '../lib/sync'

/**
 * Bloquea la app hasta el primer pull exitoso en un dispositivo nuevo.
 */
export function RequireSyncInicial() {
  const config = useLiveQuery(() => configuracionRepo.obtener(), [])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const autoTried = useRef(false)

  const listo = config?.sync.inicialCompleto === true

  const correr = useCallback(async () => {
    setBusy(true)
    setError(null)
    try {
      await esperarBackoffSiHaceFalta()
      const res = await sincronizarInicial()
      if (res.error) {
        setError(res.error)
      }
    } finally {
      setBusy(false)
    }
  }, [])

  useEffect(() => {
    if (config === undefined) return
    if (config.sync.inicialCompleto) return
    if (autoTried.current) return
    autoTried.current = true
    void correr()
  }, [config, correr])

  if (config === undefined) {
    return null
  }

  if (listo) {
    return <Outlet />
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-crema px-gutter">
      {error && !busy ? (
        <EmptyState
          illustrated
          icon="cloud_off"
          title="No se pudo preparar"
          description={error}
          action={
            <Button
              type="button"
              size="cta"
              fullWidth
              onClick={() => {
                void correr()
              }}
            >
              Reintentar
            </Button>
          }
        />
      ) : (
        <EmptyState
          illustrated
          icon="cloud_sync"
          title="Preparando este dispositivo…"
          description="Descargando catálogo y ventas. Necesitas conexión la primera vez."
        />
      )}
    </div>
  )
}
