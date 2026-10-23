import type { MemorySeed } from '../../mocks/data'
import type {
  AuthRepository,
  ConfiguracionRepository,
  ProductosRepository,
  VentasRepository,
} from '../repositories'
import { createAuthRepo } from './authRepo'
import { createConfiguracionRepo } from './configuracionRepo'
import { createDelay, DEFAULT_DELAY_MS } from './delay'
import { createProductosRepo } from './productosRepo'
import { createMemoryStore, type MemoryStore } from './store'
import { createVentasRepo } from './ventasRepo'

export type MemoryData = {
  store: MemoryStore
  productosRepo: ProductosRepository
  ventasRepo: VentasRepository
  configuracionRepo: ConfiguracionRepository
  authRepo: AuthRepository
}

export type CreateMemoryDataOpts = {
  delayMs?: number
  seed?: MemorySeed
}

export function createMemoryData(
  opts: CreateMemoryDataOpts = {},
): MemoryData {
  const delayMs = opts.delayMs ?? DEFAULT_DELAY_MS
  const store = createMemoryStore(opts.seed)
  const delay = createDelay(delayMs)

  return {
    store,
    productosRepo: createProductosRepo(store, delay),
    ventasRepo: createVentasRepo(store, delay),
    configuracionRepo: createConfiguracionRepo(store, delay),
    authRepo: createAuthRepo(store, delay),
  }
}
