import { Card } from '../../../components/ui/Card'
import { ProductoListItem } from '../../../components/ui/ProductoListItem'
import type { Producto } from '../../../domain/types'
import { metaProducto } from '../lib/filtrarProductos'

type ProductosListaProps = {
  productos: Producto[]
  onEdit: (producto: Producto) => void
  onToggleActivo: (producto: Producto, activo: boolean) => void
}

export function ProductosLista({
  productos,
  onEdit,
  onToggleActivo,
}: ProductosListaProps) {
  if (productos.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-body font-bold text-tinta-suave">
        No encontramos productos con esa búsqueda.
      </p>
    )
  }

  return (
    <Card padding="none">
      <Card.List>
        {productos.map((producto) => (
          <ProductoListItem
            key={producto.id}
            nombre={producto.nombre}
            meta={metaProducto(producto)}
            precio={producto.precio}
            activo={producto.activo}
            onEdit={() => onEdit(producto)}
            onActivoChange={(activo) => onToggleActivo(producto, activo)}
          />
        ))}
      </Card.List>
    </Card>
  )
}
