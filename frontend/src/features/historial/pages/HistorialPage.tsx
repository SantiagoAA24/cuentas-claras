import { Link } from 'react-router'
import { ROUTES } from '../../../app/routes'

/** Placeholder Historial · 3a */
export function HistorialPage() {
  return (
    <div className="flex flex-col gap-3 px-gutter py-4">
      <h1 className="text-title-sm font-black text-tostado-700">
        Historial · 3a
      </h1>
      <Link
        to={ROUTES.historialDetalle('demo')}
        className="text-body font-extrabold text-tostado-500 underline underline-offset-enlace"
      >
        Ver detalle de prueba
      </Link>
    </div>
  )
}
