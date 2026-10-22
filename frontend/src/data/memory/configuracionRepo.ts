import type {
  Configuracion,
  GuardarConfiguracionInput,
} from '../../domain/types'
import type { ConfiguracionRepository } from '../repositories'
import type { MemoryStore } from './store'

export function createConfiguracionRepo(
  store: MemoryStore,
  delay: () => Promise<void>,
): ConfiguracionRepository {
  return {
    async obtener(): Promise<Configuracion> {
      await delay()
      return structuredClone(store.configuracion)
    },

    async guardar(patch: GuardarConfiguracionInput): Promise<Configuracion> {
      await delay()
      if (patch.negocio) {
        Object.assign(store.configuracion.negocio, patch.negocio)
      }
      if (patch.impresora === null) {
        delete store.configuracion.impresora
      } else if (patch.impresora !== undefined) {
        store.configuracion.impresora = { ...patch.impresora }
      }
      // dispositivo (prefijo / consecutivo) no se muta desde aquí
      store.notify()
      return structuredClone(store.configuracion)
    },
  }
}
