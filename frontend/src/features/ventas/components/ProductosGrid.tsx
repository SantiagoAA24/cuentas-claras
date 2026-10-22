import { EmptyState } from '../../../components/ui/EmptyState'
import { ProductCard } from '../../../components/ui/ProductCard'
import { ProductGridSkeleton } from '../../../components/ui/ProductGridSkeleton'
import type { Producto } from '../../../domain/types'
import type { FiltroCategoria } from './CategoriaChips'

type ProductosGridProps = {
  productos: Producto[] | undefined
  categoria: FiltroCategoria
  cantidadDe: (productoId: string) => number
  onAdd: (producto: Producto) => void
}

function tituloVacio(categoria: FiltroCategoria): string {
  if (categoria === 'Todas') return 'Aún no hay productos'
  return `Aún no hay ${categoria.toLowerCase()}`
}

export function ProductosGrid({
  productos,
  categoria,
  cantidadDe,
  onAdd,
}: ProductosGridProps) {
  if (productos === undefined) {
    return <ProductGridSkeleton className="px-gutter" />
  }

  const filtrados =
    categoria === 'Todas'
      ? productos
      : productos.filter((p) => p.categoria === categoria)

  if (filtrados.length === 0) {
    return (
      <EmptyState
        icon="inventory_2"
        title={tituloVacio(categoria)}
        description="Agrégalos en la pestaña Productos."
      />
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 px-gutter">
      {filtrados.map((producto) => (
        <ProductCard
          key={producto.id}
          name={producto.nombre}
          price={producto.precio}
          quantity={cantidadDe(producto.id)}
          onAdd={() => onAdd(producto)}
        />
      ))}
    </div>
  )
}
