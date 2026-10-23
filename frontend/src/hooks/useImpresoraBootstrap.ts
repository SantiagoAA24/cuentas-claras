import { useEffect } from 'react'
import { configuracionRepo } from '../data/client'
import { initImpresoraFromConfig } from '../lib/impresora'

/**
 * Al montar la app autenticada, lee la impresora emparejada y
 * intenta reconectar (marca conectada si hay dispositivo guardado).
 */
export function useImpresoraBootstrap(): void {
  useEffect(() => {
    let cancelled = false
    void configuracionRepo.obtener().then((config) => {
      if (cancelled) return
      initImpresoraFromConfig(config.impresora)
    })
    return () => {
      cancelled = true
    }
  }, [])
}
