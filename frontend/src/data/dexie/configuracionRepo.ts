import type {
  Configuracion,
  GuardarConfiguracionInput,
} from '../../domain/types'
import { CONFIG_ID, type CuentasClarasDB } from '../../lib/db'
import type { ConfiguracionRepository } from '../repositories'

function sinId(row: Configuracion & { id: string }): Configuracion {
  const { id: _id, ...config } = row
  return config
}

export function createConfiguracionRepo(
  database: CuentasClarasDB,
): ConfiguracionRepository {
  return {
    async obtener(): Promise<Configuracion> {
      const row = await database.configuracion.get(CONFIG_ID)
      if (!row) {
        throw new Error('No hay configuración')
      }
      return structuredClone(sinId(row))
    },

    async guardar(patch: GuardarConfiguracionInput): Promise<Configuracion> {
      return database.transaction('rw', database.configuracion, async () => {
        const row = await database.configuracion.get(CONFIG_ID)
        if (!row) {
          throw new Error('No hay configuración')
        }

        if (patch.negocio) {
          Object.assign(row.negocio, patch.negocio)
        }
        if (patch.impresora === null) {
          delete row.impresora
        } else if (patch.impresora !== undefined) {
          row.impresora = { ...patch.impresora }
        }
        // dispositivo (prefijo / consecutivo) no se muta desde aquí

        await database.configuracion.put(row)
        return structuredClone(sinId(row))
      })
    },
  }
}
