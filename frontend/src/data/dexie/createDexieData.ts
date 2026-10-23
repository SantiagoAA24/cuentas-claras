import {
  bootstrapDb,
  CONFIG_ID,
  CONFIGURACION_DEFAULT,
  CuentasClarasDB,
  db as defaultDb,
  toVentaRow,
  type EntradaColaSync,
} from '../../lib/db'
import { crearSeed } from '../../mocks/data'
import type {
  AuthRepository,
  ConfiguracionRepository,
  ProductosRepository,
  VentasRepository,
} from '../repositories'
import { createAuthRepo } from './authRepo'
import { createConfiguracionRepo } from './configuracionRepo'
import { createProductosRepo } from './productosRepo'
import { createVentasRepo } from './ventasRepo'

export type DexieData = {
  db: CuentasClarasDB
  productosRepo: ProductosRepository
  ventasRepo: VentasRepository
  configuracionRepo: ConfiguracionRepository
  authRepo: AuthRepository
}

export type CreateDexieDataOpts = {
  /** Nombre de DB (tests: único por suite). */
  dbName?: string
  /** Si true, carga crearSeed() tras abrir (tests). */
  seed?: boolean
}

async function seedTestDb(database: CuentasClarasDB): Promise<void> {
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
      await database.productos.clear()
      await database.ventas.clear()
      await database.colaSync.clear()
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

async function ensureDefaultConfig(database: CuentasClarasDB): Promise<void> {
  const existing = await database.configuracion.get(CONFIG_ID)
  if (existing) return
  await database.configuracion.put({
    id: CONFIG_ID,
    ...structuredClone(CONFIGURACION_DEFAULT),
  })
}

/**
 * Factory de repos Dexie. En tests pasa `dbName` único y `seed: true`.
 * En la app usa el singleton `db` ya bootstrapado.
 */
export async function createDexieData(
  opts: CreateDexieDataOpts = {},
): Promise<DexieData> {
  const database =
    opts.dbName != null ? new CuentasClarasDB(opts.dbName) : defaultDb

  if (opts.dbName != null) {
    await database.open()
    if (opts.seed) {
      await seedTestDb(database)
    } else {
      await ensureDefaultConfig(database)
    }
  } else {
    await bootstrapDb(database)
  }

  return {
    db: database,
    productosRepo: createProductosRepo(database),
    ventasRepo: createVentasRepo(database),
    configuracionRepo: createConfiguracionRepo(database),
    authRepo: createAuthRepo(),
  }
}
