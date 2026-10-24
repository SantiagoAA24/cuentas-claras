import type { Producto, Venta } from '../../domain/types'
import type { EntradaColaSync, OperacionSync } from '../db'

/** Payload camelCase para `venta.registrar` en /sync/push. */
export function payloadVentaRegistrar(venta: Venta): Record<string, unknown> {
  return {
    id: venta.id,
    recibo: venta.recibo,
    fecha: venta.fecha,
    items: venta.items.map((i) => ({
      productoId: i.productoId || null,
      nombre: i.nombre,
      precioUnitario: i.precioUnitario,
      cantidad: i.cantidad,
    })),
    total: venta.total,
    medioPago: venta.medioPago,
    pagaCon: venta.pagaCon ?? null,
    vueltas: venta.vueltas ?? null,
    impreso: venta.impreso,
  }
}

/** Payload para `venta.anular`. */
export function payloadVentaAnular(raw: {
  ventaId: string
  anulada: { motivo: string; texto?: string; en: string }
}): Record<string, unknown> {
  return {
    ventaId: raw.ventaId,
    anulada: {
      motivo: raw.anulada.motivo,
      texto: raw.anulada.texto ?? null,
      en: raw.anulada.en,
    },
  }
}

/** Payload para `producto.crear` / `producto.actualizar`. */
export function payloadProducto(producto: Producto): Record<string, unknown> {
  return {
    id: producto.id,
    nombre: producto.nombre,
    precio: producto.precio,
    categoria: producto.categoria,
    activo: producto.activo,
  }
}

export function mapearPayloadCola(
  operacion: OperacionSync,
  payload: unknown,
): Record<string, unknown> {
  switch (operacion) {
    case 'venta.registrar':
      return payloadVentaRegistrar(payload as Venta)
    case 'venta.anular':
      return payloadVentaAnular(
        payload as {
          ventaId: string
          anulada: { motivo: string; texto?: string; en: string }
        },
      )
    case 'producto.crear':
    case 'producto.actualizar':
      return payloadProducto(payload as Producto)
    default: {
      const _exhaustive: never = operacion
      return _exhaustive
    }
  }
}

export function cambioDesdeEntrada(entrada: EntradaColaSync): {
  id: string
  operacion: OperacionSync
  entidadId: string
  payload: Record<string, unknown>
} {
  return {
    id: entrada.id,
    operacion: entrada.operacion,
    entidadId: entrada.entidadId,
    payload: mapearPayloadCola(entrada.operacion, entrada.payload),
  }
}
