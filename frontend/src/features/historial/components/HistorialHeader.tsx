import { formatFechaLarga } from '../../../lib/format'

type HistorialHeaderProps = {
  fecha?: Date
}

/** Encabezado del día: "Hoy · martes 22 de septiembre". */
export function HistorialHeader({ fecha = new Date() }: HistorialHeaderProps) {
  return (
    <div className="flex items-baseline gap-2.5">
      <h1 className="text-money font-black text-tostado-700">Hoy</h1>
      <span className="text-body font-bold text-tinta-suave">
        {formatFechaLarga(fecha)}
      </span>
    </div>
  )
}
