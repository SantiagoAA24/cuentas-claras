import Dexie, { type EntityTable } from 'dexie'
import type { Configuracion, Producto, Venta } from '../domain/types'
import { crearSeed } from '../mocks/data'

export const CONFIG_ID = 'app' as const

export type OperacionSync =
  | 'venta.registrar'
  | 'venta.anular'
  | 'producto.crear'
  | 'producto.actualizar'

export type EstadoColaSync = 'pendiente' | 'error'

/** Evento de outbox; `id` será la clave de idempotencia hacia el API. */
export type EntradaColaSync = {
  id: string
  operacion: OperacionSync
  entidadId: string
  payload: unknown
  estado: EstadoColaSync
  intentos: number
  creadoEn: string
  ultimoIntentoEn?: string
  ultimoError?: string
}

/** Venta persistida con día local denormalizado para índices. */
export type VentaRow = Venta & { dia: string }

export type ConfiguracionRow = Configuracion & { id: typeof CONFIG_ID }

/** Configuración por defecto de producción (app vacía). */
export const CONFIGURACION_DEFAULT: Configuracion = {
  negocio: {
    nombre: '',
    documento: '',
    pieRecibo: '',
  },
  dispositivo: {
    prefijo: 'A',
    ultimoConsecutivo: 0,
  },
}

/** Clave de calendario local YYYY-MM-DD. */
export function claveDiaLocal(fecha: Date): string {
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function toVentaRow(venta: Venta): VentaRow {
  return {
    ...venta,
    dia: claveDiaLocal(new Date(venta.fecha)),
  }
}

export function fromVentaRow(row: VentaRow): Venta {
  const { dia: _dia, ...venta } = row
  return venta
}

export type PersistenciaEstado = 'protegido' | 'no_garantizado' | 'desconocido'

let persistenciaEstado: PersistenciaEstado = 'desconocido'

export function getPersistenciaEstado(): PersistenciaEstado {
  return persistenciaEstado
}

export class CuentasClarasDB extends Dexie {
  productos!: EntityTable<Producto, 'id'>
  ventas!: EntityTable<VentaRow, 'id'>
  configuracion!: EntityTable<ConfiguracionRow, 'id'>
  colaSync!: EntityTable<EntradaColaSync, 'id'>

  constructor(name = 'cuentas-claras') {
    super(name)
    this.version(1).stores({
      productos: 'id, activo, categoria, [activo+categoria]',
      ventas: 'id, fecha, dia, recibo, sincronizada',
      configuracion: 'id',
      colaSync: 'id, estado, operacion, creadoEn, entidadId, [estado+creadoEn]',
    })
  }
}

export const db = new CuentasClarasDB()

async function ensureConfiguracion(database: CuentasClarasDB): Promise<void> {
  const existing = await database.configuracion.get(CONFIG_ID)
  if (existing) return
  await database.configuracion.put({
    id: CONFIG_ID,
    ...structuredClone(CONFIGURACION_DEFAULT),
  })
}

async function seedIfEmptyDev(database: CuentasClarasDB): Promise<void> {
  if (!import.meta.env.DEV) return

  const [nProductos, nVentas] = await Promise.all([
    database.productos.count(),
    database.ventas.count(),
  ])
  if (nProductos > 0 || nVentas > 0) return

  const seed = crearSeed()
  const ventaRows = seed.ventas.map(toVentaRow)
  const colaEntries: EntradaColaSync[] = seed.ventas
    .filter((v) => !v.sincronizada)
    .map((v) => ({
      id: crypto.randomUUID(),
      operacion: 'venta.registrar' as const,
      entidadId: v.id,
      payload: structuredClone(v),
      estado: 'pendiente' as const,
      intentos: 0,
      creadoEn: v.fecha,
    }))

  await database.transaction(
    'rw',
    database.productos,
    database.ventas,
    database.configuracion,
    database.colaSync,
    async () => {
      await database.productos.bulkPut(seed.productos)
      await database.ventas.bulkPut(ventaRows)
      await database.configuracion.put({
        id: CONFIG_ID,
        ...seed.configuracion,
      })
      if (colaEntries.length > 0) {
        await database.colaSync.bulkPut(colaEntries)
      }
    },
  )
}

async function requestPersistentStorage(): Promise<void> {
  if (typeof navigator === 'undefined' || !navigator.storage?.persist) {
    persistenciaEstado = 'desconocido'
    return
  }
  try {
    const already = await navigator.storage.persisted?.()
    if (already) {
      persistenciaEstado = 'protegido'
      return
    }
    const granted = await navigator.storage.persist()
    persistenciaEstado = granted ? 'protegido' : 'no_garantizado'
  } catch {
    persistenciaEstado = 'desconocido'
  }
}

let bootstrapPromise: Promise<void> | null = null

/** Abre la DB, asegura config, seed DEV si vacía, y pide almacenamiento persistente. */
export function bootstrapDb(database: CuentasClarasDB = db): Promise<void> {
  if (bootstrapPromise && database === db) return bootstrapPromise

  const run = async () => {
    await database.open()
    await ensureConfiguracion(database)
    await seedIfEmptyDev(database)
    await requestPersistentStorage()
  }

  if (database === db) {
    bootstrapPromise = run()
    return bootstrapPromise
  }
  return run()
}

/** Borra la base local y vuelve a bootstrap (seed DEV si aplica). Solo desarrollo. */
export async function resetDbAndSeed(
  database: CuentasClarasDB = db,
): Promise<void> {
  if (database === db) {
    bootstrapPromise = null
  }
  database.close()
  await database.delete()
  await bootstrapDb(database)
}

/** Helper para encolar en la misma transacción del caller. */
export function nuevaEntradaCola(
  operacion: OperacionSync,
  entidadId: string,
  payload: unknown,
): EntradaColaSync {
  return {
    id: crypto.randomUUID(),
    operacion,
    entidadId,
    payload: structuredClone(payload),
    estado: 'pendiente',
    intentos: 0,
    creadoEn: new Date().toISOString(),
  }
}
