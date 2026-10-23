import { Card } from '../../../components/ui/Card'
import { Icon } from '../../../components/ui/Icon'
import type { ResumenDia } from '../../../domain/types'
import { formatCOP } from '../../../lib/format'
import { iconoMedioPago } from '../../../lib/medioPago'
import {
  desgloseCantidadLabel,
  resumenConteoLabel,
} from '../lib/resumenLabel'

type ResumenDiaCardProps = {
  resumen: ResumenDia
}

/** Tarjeta tostada con total del día y desglose por medio de pago. */
export function ResumenDiaCard({ resumen }: ResumenDiaCardProps) {
  return (
    <Card variant="summary" padding="md" className="pb-2">
      <p className="text-label font-extrabold text-tostado-on-dark">
        Total vendido
      </p>
      <p className="text-total font-black tabular-nums tracking-tight text-maiz-on-dark">
        {formatCOP(resumen.totalVendido)}
      </p>
      <p className="mb-2.5 text-label font-bold text-tostado-on-dark">
        {resumenConteoLabel(resumen)}
      </p>
      <ul className="flex flex-col">
        {resumen.desglose.map((d) => (
          <li
            key={d.medio}
            className="flex min-h-touch items-center gap-2.5 border-t border-white/15"
          >
            <Icon
              name={iconoMedioPago(d.medio)}
              size={22}
              className="text-maiz-on-dark"
            />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-body font-extrabold text-white">
                {d.medio}
              </span>
              <span className="text-caption font-bold text-tostado-on-dark-suave">
                {desgloseCantidadLabel(d.cantidad)}
              </span>
            </span>
            <span className="text-title-sm font-black tabular-nums text-white">
              {formatCOP(d.monto)}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
