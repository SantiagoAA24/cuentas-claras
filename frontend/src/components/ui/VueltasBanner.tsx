import { cn } from '../../lib/cn'
import { formatCOP } from '../../lib/format'
import { Icon } from './Icon'

export type VueltasBannerTone = 'empty' | 'ok' | 'short'

type VueltasBannerProps = {
  /** Total a cobrar en pesos. */
  total: number
  /** Monto ingresado; `null` = campo vacío (se cobra exacto). */
  pagaCon: number | null
  className?: string
}

function resolveTone(total: number, pagaCon: number | null): VueltasBannerTone {
  if (pagaCon == null) return 'empty'
  if (pagaCon < total) return 'short'
  return 'ok'
}

/**
 * Franja de feedback del cobro en efectivo: exacto / vueltas / monto insuficiente.
 */
export function VueltasBanner({
  total,
  pagaCon,
  className,
}: VueltasBannerProps) {
  const tone = resolveTone(total, pagaCon)

  const icon =
    tone === 'short' ? 'error' : tone === 'empty' ? 'info' : 'savings'
  const label =
    tone === 'short'
      ? 'Monto menor al total. Faltan'
      : tone === 'empty'
        ? 'Sin monto: se cobra exacto'
        : 'Vueltas'
  const amount =
    tone === 'short' && pagaCon != null
      ? formatCOP(total - pagaCon)
      : tone === 'ok' && pagaCon != null
        ? formatCOP(pagaCon - total)
        : null

  return (
    <div
      role="status"
      className={cn(
        'flex min-h-switch items-center justify-between gap-2 rounded-lg px-4 py-1.5',
        tone === 'short' && 'bg-peligro-fondo',
        tone === 'empty' && 'bg-tostado-100',
        tone === 'ok' && 'bg-exito-fondo',
        className,
      )}
    >
      <span
        className={cn(
          'flex items-center gap-1.5 text-body font-extrabold',
          tone === 'short' && 'text-peligro',
          tone === 'empty' && 'text-tinta-suave',
          tone === 'ok' && 'text-exito',
        )}
      >
        <Icon name={icon} size={22} />
        {label}
      </span>
      {amount != null ? (
        <span
          className={cn(
            'text-title-lg font-black tabular-nums',
            tone === 'short' ? 'text-peligro' : 'text-exito',
          )}
        >
          {amount}
        </span>
      ) : null}
    </div>
  )
}
