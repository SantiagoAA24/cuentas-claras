import { toast } from '../../components/ui/Toast'
import { ventasRepo } from '../../data/client'
import { useSyncUiStore } from './syncUiStore'

let syncing = false

/**
 * Sincroniza ventas pendientes (stub local). Si sincronizó alguna,
 * muestra el toast 9c y flashea «Sincronizado» en la TopBar.
 */
export async function syncVentasPendientes(): Promise<number> {
  if (syncing) return 0
  if (typeof navigator !== 'undefined' && !navigator.onLine) return 0

  syncing = true
  try {
    const n = await ventasRepo.sincronizarPendientes()
    if (n > 0) {
      toast({
        message: 'Ventas sincronizadas',
        variant: 'success',
        icon: 'cloud_done',
      })
      useSyncUiStore.getState().flashSincronizado()
    }
    return n
  } finally {
    syncing = false
  }
}
