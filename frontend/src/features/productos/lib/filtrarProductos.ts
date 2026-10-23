import type { Categoria, Producto } from '../../../domain/types'

export type FiltroCategoriaProductos = 'Todas' | Categoria

/** Filtra por categoría y por substring case-insensitive en el nombre. */
export function filtrarProductos(
  productos: Producto[],
  opts: { categoria: FiltroCategoriaProductos; query: string },
): Producto[] {
  const q = opts.query.trim().toLowerCase()
  return productos.filter((p) => {
    if (opts.categoria !== 'Todas' && p.categoria !== opts.categoria) {
      return false
    }
    if (q && !p.nombre.toLowerCase().includes(q)) {
      return false
    }
    return true
  })
}

/** Meta visible bajo el nombre en la lista de productos. */
export function metaProducto(producto: Producto): string {
  if (producto.activo) return producto.categoria
  return `${producto.categoria} · Inactivo · no aparece en Vender`
}
