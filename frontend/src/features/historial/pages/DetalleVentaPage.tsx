import { useParams } from 'react-router'

/** Placeholder Detalle de venta · 4a */
export function DetalleVentaPage() {
  const { id } = useParams()

  return (
    <div className="px-gutter py-4">
      <h1 className="text-title-sm font-black text-tostado-700">
        Detalle de venta · 4a
      </h1>
      <p className="mt-2 text-body text-tinta-suave">id: {id}</p>
    </div>
  )
}
