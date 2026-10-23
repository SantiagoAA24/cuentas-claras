import { Card } from '../../../components/ui/Card'
import { Icon } from '../../../components/ui/Icon'
import { SuccessMark } from '../../../components/ui/SuccessMark'
import type { Venta } from '../../../domain/types'
import { cn } from '../../../lib/cn'
import { formatCOP } from '../../../lib/format'
import type { PrintStatus } from '../hooks/useCobroState'

type VentaExitosaProps = {
  venta: Venta
  printStatus: PrintStatus
}

function printLabel(status: PrintStatus): {
  text: string
  icon: string
  tone: 'exito' | 'suave' | 'pendiente'
} {
  switch (status) {
    case 'imprimiendo':
      return {
        text: 'Imprimiendo…',
        icon: 'print',
        tone: 'pendiente',
      }
    case 'impreso':
      return {
        text: 'Recibo impreso',
        icon: 'print',
        tone: 'exito',
      }
    case 'fallo':
      // Cubierto por 9d; texto provisional debajo de la hoja.
      return {
        text: 'Imprimiendo…',
        icon: 'print',
        tone: 'pendiente',
      }
    case 'sin-imprimir':
    case 'idle':
    default:
      return {
        text: 'Guardada sin imprimir',
        icon: 'print_disabled',
        tone: 'suave',
      }
  }
}

export function VentaExitosa({ venta, printStatus }: VentaExitosaProps) {
  const showVueltas =
    venta.medioPago === 'Efectivo' &&
    venta.vueltas != null &&
    venta.vueltas > 0 &&
    venta.pagaCon != null

  const print = printLabel(printStatus)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col items-center gap-2.5 px-2 pt-6 pb-2 text-center">
        <SuccessMark />
        <h2 className="mt-3.5 text-title-lg font-black text-tinta">
          Venta registrada
        </h2>
        <span className="inline-flex h-8 items-center rounded-pill bg-tostado-100 px-3 font-mono text-body font-extrabold text-tostado-700">
          Recibo {venta.recibo}
        </span>
      </div>

      <Card variant="muted" padding="md" className="flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-item font-extrabold text-tinta-suave">
            Total
          </span>
          <span className="text-total font-black tabular-nums leading-none text-tinta">
            {formatCOP(venta.total)}
          </span>
        </div>
        <div className="flex justify-between gap-3 border-t border-dashed border-borde-fuerte pt-2.5 text-body font-bold text-tinta">
          <span>Medio de pago</span>
          <span className="font-extrabold">{venta.medioPago}</span>
        </div>
        {showVueltas ? (
          <>
            <div className="flex justify-between gap-3 text-body font-bold text-tinta">
              <span>Pagó con</span>
              <span className="font-extrabold tabular-nums">
                {formatCOP(venta.pagaCon!)}
              </span>
            </div>
            <div className="flex justify-between gap-3 text-body-lg font-extrabold text-exito">
              <span>Vueltas</span>
              <span className="font-black tabular-nums">
                {formatCOP(venta.vueltas!)}
              </span>
            </div>
          </>
        ) : null}
      </Card>

      <div
        className={cn(
          'flex items-center justify-center gap-1.5 text-label font-extrabold',
          print.tone === 'exito' && 'text-exito',
          print.tone === 'suave' && 'text-tinta-suave',
          print.tone === 'pendiente' && 'text-pendiente',
        )}
      >
        <Icon name={print.icon} size={20} />
        {print.text}
      </div>
    </div>
  )
}
