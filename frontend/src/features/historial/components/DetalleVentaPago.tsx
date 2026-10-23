import { Card } from '../../../components/ui/Card'
import { Icon } from '../../../components/ui/Icon'
import type { MedioPago } from '../../../domain/types'
import { formatCOP } from '../../../lib/format'
import { iconoMedioPago } from '../../../lib/medioPago'

type DetalleVentaPagoProps = {
  medioPago: MedioPago
  pagaCon?: number
  vueltas?: number
}

export function DetalleVentaPago({
  medioPago,
  pagaCon,
  vueltas,
}: DetalleVentaPagoProps) {
  const esEfectivo = medioPago === 'Efectivo'

  return (
    <Card padding="none">
      <div className="flex flex-col px-4">
        <div className="flex min-h-touch items-center justify-between gap-3">
          <span className="text-body font-bold text-tinta-suave">
            Medio de pago
          </span>
          <span className="inline-flex items-center gap-1.5 text-body font-extrabold text-tinta">
            <Icon
              name={iconoMedioPago(medioPago)}
              size={20}
              className="text-tostado-500"
            />
            {medioPago}
          </span>
        </div>
        {esEfectivo && pagaCon != null ? (
          <>
            <div className="flex min-h-touch items-center justify-between gap-3 border-t border-borde">
              <span className="text-body font-bold text-tinta-suave">
                Pagó con
              </span>
              <span className="text-body font-extrabold tabular-nums text-tinta">
                {formatCOP(pagaCon)}
              </span>
            </div>
            {vueltas != null && vueltas > 0 ? (
              <div className="flex min-h-touch items-center justify-between gap-3 border-t border-borde">
                <span className="text-body font-extrabold text-exito">
                  Vueltas
                </span>
                <span className="text-title-sm font-black tabular-nums text-exito">
                  {formatCOP(vueltas)}
                </span>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </Card>
  )
}
