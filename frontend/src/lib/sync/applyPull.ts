import type {
  Anulacion,
  Categoria,
  MedioPago,
  MotivoAnulacion,
  Producto,
  Venta,
} from '../../domain/types'
import {
  CONFIG_ID,
  normalizarConfiguracion,
  toVentaRow,
  type CuentasClarasDB,
} from '../db'
import type { components } from '../api/schema'

type ProductoPull = components['schemas']['ProductoPull']
type VentaPull = components['schemas']['VentaPull']
type AnulacionPull = components['schemas']['AnulacionPull']
type DispositivoPull = components['schemas']['DispositivoPull']

const MEDIOS: readonly MedioPago[] = [
  'Efectivo',
  'Nequi',
  'Daviplata',
  'Transferencia',
]
const MOTIVOS: readonly MotivoAnulacion[] = [
  'Error al registrar',
  'Cliente canceló',
  'Producto equivocado',
  'Otro',
]
const CATEGORIAS: readonly Categoria[] = ['Arepas', 'Bebidas', 'Adicionales']

function asMedioPago(v: string): MedioPago {
  return (MEDIOS as readonly string[]).includes(v) ? (v as MedioPago) : 'Efectivo'
}

function asMotivo(v: string): MotivoAnulacion {
  return (MOTIVOS as readonly string[]).includes(v)
    ? (v as MotivoAnulacion)
    : 'Otro'
}

function asCategoria(v: string): Categoria {
  return (CATEGORIAS as readonly string[]).includes(v)
    ? (v as Categoria)
    : 'Arepas'
}

async function entidadConPendiente(
  database: CuentasClarasDB,
  entidadId: string,
  operaciones: string[],
): Promise<boolean> {
  const rows = await database.colaSync
    .where('entidadId')
    .equals(entidadId)
    .filter(
      (e) => e.estado === 'pendiente' && operaciones.includes(e.operacion),
    )
    .count()
  return rows > 0
}

function ventaDesdePull(v: VentaPull, anulada?: Anulacion): Venta {
  return {
    id: v.id,
    recibo: v.recibo,
    fecha: v.fecha,
    registradaPor: v.registradaPorId,
    items: v.items.map((i) => ({
      productoId: i.productoId ?? '',
      nombre: i.nombre,
      precioUnitario: i.precioUnitario,
      cantidad: i.cantidad,
    })),
    total: v.total,
    medioPago: asMedioPago(v.medioPago),
    pagaCon: v.pagaCon ?? undefined,
    vueltas: v.vueltas ?? undefined,
    impreso: v.impreso,
    sincronizada: true,
    conflictoRecibo: v.conflictoRecibo || undefined,
    anulada,
  }
}

function productoDesdePull(p: ProductoPull): Producto {
  return {
    id: p.id,
    nombre: p.nombre,
    precio: p.precio,
    categoria: asCategoria(p.categoria),
    activo: p.activo,
  }
}

/**
 * Aplica un lote de pull a Dexie sin pisar cambios locales aún en cola.
 */
export async function aplicarPull(
  database: CuentasClarasDB,
  data: {
    productos: ProductoPull[]
    ventas: VentaPull[]
    anulaciones: AnulacionPull[]
    dispositivo: DispositivoPull
    cursor: number
  },
): Promise<void> {
  await database.transaction(
    'rw',
    database.productos,
    database.ventas,
    database.configuracion,
    database.colaSync,
    async () => {
      for (const p of data.productos) {
        const pendiente = await entidadConPendiente(database, p.id, [
          'producto.crear',
          'producto.actualizar',
        ])
        if (pendiente) continue
        await database.productos.put(productoDesdePull(p))
      }

      const anulacionesPorVenta = new Map<string, AnulacionPull>()
      for (const a of data.anulaciones) {
        anulacionesPorVenta.set(a.ventaId, a)
      }

      for (const v of data.ventas) {
        const pendienteReg = await entidadConPendiente(database, v.id, [
          'venta.registrar',
        ])
        if (pendienteReg) continue

        const existing = await database.ventas.get(v.id)
        const anulaPull = anulacionesPorVenta.get(v.id)
        const pendienteAnula = await entidadConPendiente(database, v.id, [
          'venta.anular',
        ])

        let anulada = existing ? fromAnuladaRow(existing.anulada) : undefined
        if (anulaPull && !pendienteAnula) {
          anulada = {
            motivo: asMotivo(anulaPull.motivo),
            texto: anulaPull.texto ?? undefined,
            por: anulaPull.anuladaPorId,
            en: anulaPull.anuladaEn,
          }
        }

        await database.ventas.put(toVentaRow(ventaDesdePull(v, anulada)))
      }

      // Anulaciones de ventas que ya estaban locales (sin re-enviar la venta).
      for (const a of data.anulaciones) {
        const pendienteAnula = await entidadConPendiente(database, a.ventaId, [
          'venta.anular',
        ])
        if (pendienteAnula) continue
        const row = await database.ventas.get(a.ventaId)
        if (!row) continue
        if (row.anulada) continue
        row.anulada = {
          motivo: asMotivo(a.motivo),
          texto: a.texto ?? undefined,
          por: a.anuladaPorId,
          en: a.anuladaEn,
        }
        row.sincronizada = true
        await database.ventas.put(row)
      }

      const configRow = await database.configuracion.get(CONFIG_ID)
      if (configRow) {
        const config = normalizarConfiguracion(configRow)
        config.dispositivo = {
          id: data.dispositivo.id || config.dispositivo.id,
          prefijo: data.dispositivo.prefijo || config.dispositivo.prefijo,
          ultimoConsecutivo: Math.max(
            config.dispositivo.ultimoConsecutivo,
            data.dispositivo.ultimoConsecutivo,
          ),
        }
        config.sync.cursor = data.cursor
        await database.configuracion.put({ id: CONFIG_ID, ...config })
      }
    },
  )
}

function fromAnuladaRow(
  anulada: Venta['anulada'],
): Anulacion | undefined {
  return anulada ? { ...anulada } : undefined
}
