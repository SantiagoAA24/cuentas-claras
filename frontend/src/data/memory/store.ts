import type { Configuracion, Producto, Venta } from '../../domain/types'
import {
  crearSeed,
  type MemorySeed,
  type UsuarioAuthSeed,
} from '../../mocks/data'

export type MemoryStoreListener = () => void

export type MemoryStore = {
  productos: Producto[]
  ventas: Venta[]
  configuracion: Configuracion
  usuarios: UsuarioAuthSeed[]
  subscribe: (listener: MemoryStoreListener) => () => void
  notify: () => void
}

export function createMemoryStore(seed?: MemorySeed): MemoryStore {
  const data = seed ?? crearSeed()
  const listeners = new Set<MemoryStoreListener>()

  return {
    productos: data.productos,
    ventas: data.ventas,
    configuracion: data.configuracion,
    usuarios: data.usuarios,
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    notify() {
      for (const listener of listeners) {
        listener()
      }
    },
  }
}

/** Clave de calendario local YYYY-MM-DD. */
export function claveDiaLocal(fecha: Date): string {
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function mismaClaveDia(iso: string, dia: Date): boolean {
  return claveDiaLocal(new Date(iso)) === claveDiaLocal(dia)
}
