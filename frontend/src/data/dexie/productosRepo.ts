import type {
  ActualizarProductoInput,
  CrearProductoInput,
  Producto,
} from '../../domain/types'
import {
  nuevaEntradaCola,
  type CuentasClarasDB,
} from '../../lib/db'
import type {
  ListarProductosOpts,
  ProductosRepository,
} from '../repositories'

export function createProductosRepo(database: CuentasClarasDB): ProductosRepository {
  async function requireProducto(id: string): Promise<Producto> {
    const producto = await database.productos.get(id)
    if (!producto) {
      throw new Error(`No se encontró el producto ${id}`)
    }
    return producto
  }

  return {
    async listar(opts?: ListarProductosOpts): Promise<Producto[]> {
      // Índice [activo+categoria] disponible para filtros por categoría;
      // listado general usa toArray (+ filtro activo en cliente).
      const all = await database.productos.toArray()
      const lista = opts?.soloActivos ? all.filter((p) => p.activo) : all
      return structuredClone(lista)
    },

    async obtenerPorId(id: string): Promise<Producto | undefined> {
      const producto = await database.productos.get(id)
      return producto ? structuredClone(producto) : undefined
    },

    async crear(input: CrearProductoInput): Promise<Producto> {
      const producto: Producto = {
        id: crypto.randomUUID(),
        ...input,
      }

      await database.transaction(
        'rw',
        database.productos,
        database.colaSync,
        async () => {
          await database.productos.put(producto)
          await database.colaSync.put(
            nuevaEntradaCola('producto.crear', producto.id, producto),
          )
        },
      )

      return structuredClone(producto)
    },

    async actualizar(
      id: string,
      patch: ActualizarProductoInput,
    ): Promise<Producto> {
      return database.transaction(
        'rw',
        database.productos,
        database.colaSync,
        async () => {
          const producto = await requireProducto(id)
          Object.assign(producto, patch)
          await database.productos.put(producto)
          await database.colaSync.put(
            nuevaEntradaCola('producto.actualizar', producto.id, producto),
          )
          return structuredClone(producto)
        },
      )
    },

    async activar(id: string): Promise<Producto> {
      return database.transaction(
        'rw',
        database.productos,
        database.colaSync,
        async () => {
          const producto = await requireProducto(id)
          producto.activo = true
          await database.productos.put(producto)
          await database.colaSync.put(
            nuevaEntradaCola('producto.actualizar', producto.id, producto),
          )
          return structuredClone(producto)
        },
      )
    },

    async desactivar(id: string): Promise<Producto> {
      return database.transaction(
        'rw',
        database.productos,
        database.colaSync,
        async () => {
          const producto = await requireProducto(id)
          producto.activo = false
          await database.productos.put(producto)
          await database.colaSync.put(
            nuevaEntradaCola('producto.actualizar', producto.id, producto),
          )
          return structuredClone(producto)
        },
      )
    },
  }
}
