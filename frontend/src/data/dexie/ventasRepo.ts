import { formatearRecibo } from '../../domain/recibo'
import type {
  AnularVentaInput,
  RegistrarVentaInput,
  Venta,
} from '../../domain/types'
import {
  claveDiaLocal,
  CONFIG_ID,
  fromVentaRow,
  nuevaEntradaCola,
  toVentaRow,
  type CuentasClarasDB,
} from '../../lib/db'
import type { VentasRepository } from '../repositories'

function totalItems(items: RegistrarVentaInput['items']): number {
  return items.reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0)
}

export function createVentasRepo(database: CuentasClarasDB): VentasRepository {
  return {
    async listarDelDia(dia: Date = new Date()): Promise<Venta[]> {
      const clave = claveDiaLocal(dia)
      const rows = await database.ventas
        .where('dia')
        .equals(clave)
        .reverse()
        .sortBy('fecha')
      return rows.map((row) => structuredClone(fromVentaRow(row)))
    },

    async obtenerPorId(id: string): Promise<Venta | undefined> {
      const row = await database.ventas.get(id)
      return row ? structuredClone(fromVentaRow(row)) : undefined
    },

    async registrar(input: RegistrarVentaInput): Promise<Venta> {
      if (input.items.length === 0) {
        throw new Error('La venta debe tener al menos un ítem')
      }
      for (const item of input.items) {
        if (item.cantidad < 1) {
          throw new Error('Cada ítem debe tener cantidad mayor a 0')
        }
      }

      return database.transaction(
        'rw',
        database.ventas,
        database.configuracion,
        database.colaSync,
        async () => {
          const config = await database.configuracion.get(CONFIG_ID)
          if (!config) {
            throw new Error('No hay configuración del dispositivo')
          }

          const { prefijo, ultimoConsecutivo } = config.dispositivo
          const siguiente = ultimoConsecutivo + 1
          config.dispositivo.ultimoConsecutivo = siguiente
          await database.configuracion.put(config)

          const venta: Venta = {
            id: crypto.randomUUID(),
            recibo: formatearRecibo(prefijo, siguiente),
            fecha: new Date().toISOString(),
            registradaPor: input.registradaPor,
            items: structuredClone(input.items),
            total: totalItems(input.items),
            medioPago: input.medioPago,
            pagaCon: input.pagaCon,
            vueltas: input.vueltas,
            impreso: input.impreso,
            sincronizada: false,
          }

          await database.ventas.put(toVentaRow(venta))
          await database.colaSync.put(
            nuevaEntradaCola('venta.registrar', venta.id, venta),
          )

          return structuredClone(venta)
        },
      )
    },

    async anular(id: string, input: AnularVentaInput): Promise<Venta> {
      return database.transaction(
        'rw',
        database.ventas,
        database.colaSync,
        async () => {
          const row = await database.ventas.get(id)
          if (!row) {
            throw new Error(`No se encontró la venta ${id}`)
          }
          if (row.anulada) {
            throw new Error(`La venta ${row.recibo} ya está anulada`)
          }
          if (input.motivo === 'Otro' && !input.texto?.trim()) {
            throw new Error('Debes indicar el motivo de la anulación')
          }

          row.anulada = {
            motivo: input.motivo,
            texto: input.motivo === 'Otro' ? input.texto?.trim() : undefined,
            por: input.por,
            en: new Date().toISOString(),
          }
          row.sincronizada = false

          await database.ventas.put(row)

          const venta = fromVentaRow(row)
          await database.colaSync.put(
            nuevaEntradaCola('venta.anular', venta.id, {
              ventaId: venta.id,
              anulada: venta.anulada,
            }),
          )

          return structuredClone(venta)
        },
      )
    },

    async obtenerSiguienteConsecutivo(): Promise<string> {
      const config = await database.configuracion.get(CONFIG_ID)
      if (!config) {
        throw new Error('No hay configuración del dispositivo')
      }
      const { prefijo, ultimoConsecutivo } = config.dispositivo
      return formatearRecibo(prefijo, ultimoConsecutivo + 1)
    },

    async contarPendientes(): Promise<number> {
      return database.colaSync.where('estado').equals('pendiente').count()
    },

    /**
     * Stub hasta el backend: la cola solo se llena; no drena.
     */
    async sincronizarPendientes(): Promise<number> {
      return 0
    },

    async marcarImpreso(id: string, impreso: boolean): Promise<Venta> {
      const row = await database.ventas.get(id)
      if (!row) {
        throw new Error(`No se encontró la venta ${id}`)
      }
      row.impreso = impreso
      await database.ventas.put(row)
      return structuredClone(fromVentaRow(row))
    },
  }
}
