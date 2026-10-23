import { Card } from '../../../components/ui/Card'
import type { ItemVenta } from '../../../domain/types'
import { formatCOP } from '../../../lib/format'
import { cn } from '../../../lib/cn'

type DetalleVentaItemsProps = {
  items: ItemVenta[]
  total: number
  anulada?: boolean
}

export function DetalleVentaItems({
  items,
  total,
  anulada = false,
}: DetalleVentaItemsProps) {
  return (
    <Card padding="none">
      <ul className="flex flex-col px-4">
        {items.map((item, index) => {
          const subtotal = item.cantidad * item.precioUnitario
          return (
            <li
              key={`${item.productoId}-${index}`}
              className="flex items-center gap-3 border-b border-borde py-3"
            >
              <span className="flex h-8 min-w-10 shrink-0 items-center justify-center rounded-md bg-maiz-100 px-1.5 text-body font-black tabular-nums text-tinta">
                {item.cantidad}×
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span
                  className={cn(
                    'text-item font-extrabold leading-snug text-tinta',
                    anulada && 'text-tinta-suave line-through',
                  )}
                >
                  {item.nombre}
                </span>
                <span className="text-caption font-bold tabular-nums text-tinta-suave">
                  {formatCOP(item.precioUnitario)} c/u
                </span>
              </span>
              <span
                className={cn(
                  'shrink-0 text-body-lg font-black tabular-nums text-tinta',
                  anulada && 'text-tinta-suave line-through',
                )}
              >
                {formatCOP(subtotal)}
              </span>
            </li>
          )
        })}
      </ul>
      <div className="flex items-baseline justify-between px-4 pt-3.5 pb-2.5">
        <span className="text-body-lg font-extrabold text-tinta-suave">
          Total
        </span>
        <span
          className={cn(
            'text-total-sm font-black tabular-nums leading-none text-tinta',
            anulada && 'text-tinta-suave line-through',
          )}
        >
          {formatCOP(total)}
        </span>
      </div>
    </Card>
  )
}
