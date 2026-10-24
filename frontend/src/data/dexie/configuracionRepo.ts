import type {
  Configuracion,
  GuardarConfiguracionInput,
} from '../../domain/types'
import {
  CONFIG_ID,
  normalizarConfiguracion,
  type CuentasClarasDB,
} from '../../lib/db'
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
      return structuredClone(normalizarConfiguracion(row))
    },

    async guardar(patch: GuardarConfiguracionInput): Promise<Configuracion> {
      return database.transaction('rw', database.configuracion, async () => {
        const row = await database.configuracion.get(CONFIG_ID)
        if (!row) {
          throw new Error('No hay configuración')
        }
        const config = normalizarConfiguracion(row)

        if (patch.negocio) {
          Object.assign(config.negocio, patch.negocio)
        }
        if (patch.impresora === null) {
          delete config.impresora
        } else if (patch.impresora !== undefined) {
          config.impresora = { ...patch.impresora }
        }

        const next = { id: CONFIG_ID, ...config }
        await database.configuracion.put(next)
        return structuredClone(sinId(next))
      })
    },

    async guardarDispositivo(
      dispositivo: Configuracion['dispositivo'],
    ): Promise<Configuracion> {
      return database.transaction('rw', database.configuracion, async () => {
        const row = await database.configuracion.get(CONFIG_ID)
        if (!row) {
          throw new Error('No hay configuración')
        }
        const config = normalizarConfiguracion(row)
        config.dispositivo = { ...dispositivo }
        const next = { id: CONFIG_ID, ...config }
        await database.configuracion.put(next)
        return structuredClone(sinId(next))
      })
    },

    async guardarSync(
      patch: Partial<Configuracion['sync']>,
    ): Promise<Configuracion> {
      return database.transaction('rw', database.configuracion, async () => {
        const row = await database.configuracion.get(CONFIG_ID)
        if (!row) {
          throw new Error('No hay configuración')
        }
        const config = normalizarConfiguracion(row)
        config.sync = { ...config.sync, ...patch }
        const next = { id: CONFIG_ID, ...config }
        await database.configuracion.put(next)
        return structuredClone(sinId(next))
      })
    },
  }
}
