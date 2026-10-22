import { formatearRecibo } from '../../domain/recibo'
import type {
  AnularVentaInput,
  RegistrarVentaInput,
  Venta,
} from '../../domain/types'
import type { VentasRepository } from '../repositories'
import { mismaClaveDia, type MemoryStore } from './store'

function totalItems(items: RegistrarVentaInput['items']): number {
  return items.reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0)
}

export function createVentasRepo(
  store: MemoryStore,
  delay: () => Promise<void>,
): VentasRepository {
  return {
    async listarDelDia(dia: Date = new Date()): Promise<Venta[]> {
      await delay()
      const delDia = store.ventas
        .filter((v) => mismaClaveDia(v.fecha, dia))
        .sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0))
      return structuredClone(delDia)
    },

    async obtenerPorId(id: string): Promise<Venta | undefined> {
      await delay()
      const venta = store.ventas.find((v) => v.id === id)
      return venta ? structuredClone(venta) : undefined
    },

    async registrar(input: RegistrarVentaInput): Promise<Venta> {
      await delay()
      if (input.items.length === 0) {
        throw new Error('La venta debe tener al menos un ítem')
      }
      for (const item of input.items) {
        if (item.cantidad < 1) {
          throw new Error('Cada ítem debe tener cantidad mayor a 0')
        }
      }

      const { prefijo, ultimoConsecutivo } = store.configuracion.dispositivo
      const siguiente = ultimoConsecutivo + 1
      store.configuracion.dispositivo.ultimoConsecutivo = siguiente

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

      store.ventas.push(venta)
      store.notify()
      return structuredClone(venta)
    },

    async anular(id: string, input: AnularVentaInput): Promise<Venta> {
      await delay()
      const venta = store.ventas.find((v) => v.id === id)
      if (!venta) {
        throw new Error(`No se encontró la venta ${id}`)
      }
      if (venta.anulada) {
        throw new Error(`La venta ${venta.recibo} ya está anulada`)
      }
      if (input.motivo === 'Otro' && !input.texto?.trim()) {
        throw new Error('Debes indicar el motivo de la anulación')
      }

      venta.anulada = {
        motivo: input.motivo,
        texto: input.motivo === 'Otro' ? input.texto?.trim() : undefined,
        por: input.por,
        en: new Date().toISOString(),
      }

      store.notify()
      return structuredClone(venta)
    },

    async obtenerSiguienteConsecutivo(): Promise<string> {
      await delay()
      const { prefijo, ultimoConsecutivo } = store.configuracion.dispositivo
      return formatearRecibo(prefijo, ultimoConsecutivo + 1)
    },
  }
}
