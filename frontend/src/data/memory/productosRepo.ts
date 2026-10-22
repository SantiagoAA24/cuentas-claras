import type {
  ActualizarProductoInput,
  CrearProductoInput,
  Producto,
} from '../../domain/types'
import type {
  ListarProductosOpts,
  ProductosRepository,
} from '../repositories'
import type { MemoryStore } from './store'

export function createProductosRepo(
  store: MemoryStore,
  delay: () => Promise<void>,
): ProductosRepository {
  async function requireProducto(id: string): Promise<Producto> {
    const producto = store.productos.find((p) => p.id === id)
    if (!producto) {
      throw new Error(`No se encontró el producto ${id}`)
    }
    return producto
  }

  return {
    async listar(opts?: ListarProductosOpts): Promise<Producto[]> {
      await delay()
      const lista = opts?.soloActivos
        ? store.productos.filter((p) => p.activo)
        : store.productos
      return structuredClone(lista)
    },

    async obtenerPorId(id: string): Promise<Producto | undefined> {
      await delay()
      const producto = store.productos.find((p) => p.id === id)
      return producto ? structuredClone(producto) : undefined
    },

    async crear(input: CrearProductoInput): Promise<Producto> {
      await delay()
      const producto: Producto = {
        id: crypto.randomUUID(),
        ...input,
      }
      store.productos.push(producto)
      store.notify()
      return structuredClone(producto)
    },

    async actualizar(
      id: string,
      patch: ActualizarProductoInput,
    ): Promise<Producto> {
      await delay()
      const producto = await requireProducto(id)
      Object.assign(producto, patch)
      store.notify()
      return structuredClone(producto)
    },

    async activar(id: string): Promise<Producto> {
      await delay()
      const producto = await requireProducto(id)
      producto.activo = true
      store.notify()
      return structuredClone(producto)
    },

    async desactivar(id: string): Promise<Producto> {
      await delay()
      const producto = await requireProducto(id)
      producto.activo = false
      store.notify()
      return structuredClone(producto)
    },
  }
}
