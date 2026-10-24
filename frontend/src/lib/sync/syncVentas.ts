import { toast } from '../../components/ui/Toast'
import { sincronizar } from './motor'
import { useSyncUiStore } from './syncUiStore'

/**
 * Sincroniza cola + pull. Si confirmó cambios en push, toast 9c y flash TopBar.
 */
export async function syncVentasPendientes(): Promise<number> {
  const { confirmados } = await sincronizar()
  if (confirmados > 0) {
    toast({
      message: 'Ventas sincronizadas',
      variant: 'success',
      icon: 'cloud_done',
    })
    useSyncUiStore.getState().flashSincronizado()
  }
  return confirmados
}
