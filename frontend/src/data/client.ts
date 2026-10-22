import { createMemoryData } from './memory/createMemoryData'

const data = createMemoryData()

export const productosRepo = data.productosRepo
export const ventasRepo = data.ventasRepo
export const configuracionRepo = data.configuracionRepo

/** Suscripción a cambios del store en memoria (para useLiveQuery). */
export function subscribeData(listener: () => void): () => void {
  return data.store.subscribe(listener)
}
