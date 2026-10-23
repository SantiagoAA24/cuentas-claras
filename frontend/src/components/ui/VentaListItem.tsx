import { Link } from 'react-router'
import type { MedioPago } from '../../domain/types'
import { cn } from '../../lib/cn'
import { formatCOP } from '../../lib/format'
import { iconoMedioPago } from '../../lib/medioPago'
import { Icon } from './Icon'
import { StatusChip } from './StatusChip'

type VentaListItemProps = {
  to: string
  /** Hora ya formateada, p. ej. "12:46 p. m." */
  hora: string
  recibo: string
  /** Resumen corto de productos, p. ej. "2 Arepa de queso, 1 Gaseosa". */
  resumenItems: string
  medioPago: MedioPago
  total: number
  pendiente?: boolean
  anulada?: boolean
  className?: string
}

/** Fila tocable de una venta en el historial del día. */
export function VentaListItem({
  to,
  hora,
  recibo,
  resumenItems,
  medioPago,
  total,
  pendiente = false,
  anulada = false,
  className,
}: VentaListItemProps) {
  return (
    <Link
      to={to}
      className={cn(
        'flex min-h-touch items-center gap-3 px-3.5 py-3 text-left',
        'active:bg-crema',
        anulada ? 'bg-superficie-anulada' : 'bg-superficie',
        className,
      )}
    >
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-1.5 text-caption font-extrabold text-tinta-suave">
          <span>{hora}</span>
          <span className="font-mono text-caption font-medium">{recibo}</span>
          {pendiente ? (
            <span title="Pendiente por sincronizar">
              <Icon
                name="cloud_upload"
                size={18}
                className="text-pendiente"
              />
            </span>
          ) : null}
        </span>
        <span
          className={cn(
            'text-item font-extrabold leading-snug',
            anulada
              ? 'text-tinta-tenue line-through'
              : 'text-tinta',
          )}
        >
          {resumenItems}
        </span>
        <span className="flex flex-wrap items-center gap-1.5 text-caption font-bold text-tinta-suave">
          <Icon
            name={iconoMedioPago(medioPago)}
            size={18}
            className="text-tostado-500"
          />
          {medioPago}
          {anulada ? <StatusChip status="anulada" size="sm" /> : null}
        </span>
      </span>
      <span
        className={cn(
          'shrink-0 text-price font-black tabular-nums',
          anulada
            ? 'text-tinta-tenue line-through'
            : 'text-tinta',
        )}
      >
        {formatCOP(total)}
      </span>
    </Link>
  )
}
