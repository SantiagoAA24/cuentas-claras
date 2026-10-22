import { Button } from '../../../components/ui/Button'
import { Icon } from '../../../components/ui/Icon'
import { formatCOP } from '../../../lib/format'
import { cn } from '../../../lib/cn'
import type { PedidoItem } from '../../../stores/pedidoStore'
import { PedidoItemRow } from './PedidoItemRow'

type PedidoPanelProps = {
  items: PedidoItem[]
  cantidadTotal: number
  totalPesos: number
  expanded: boolean
  onToggle: () => void
  onClear: () => void
  onIncrement: (productoId: string) => void
  onDecrement: (productoId: string) => void
  onRemove: (productoId: string) => void
  onCobrar?: () => void
}

function countLabel(empty: boolean, cantidadTotal: number): string {
  if (empty) return 'Pedido vacío'
  if (cantidadTotal === 1) return '1 producto'
  return `${cantidadTotal} productos`
}

export function PedidoPanel({
  items,
  cantidadTotal,
  totalPesos,
  expanded,
  onToggle,
  onClear,
  onIncrement,
  onDecrement,
  onRemove,
  onCobrar,
}: PedidoPanelProps) {
  const empty = cantidadTotal === 0
  const hint = empty
    ? 'Toca un producto para agregarlo'
    : expanded
      ? 'Ocultar pedido'
      : 'Ver pedido'
  const chevron = empty ? null : expanded ? 'expand_more' : 'expand_less'

  return (
    <>
      {expanded && !empty ? (
        <button
          type="button"
          aria-label="Ocultar pedido"
          onClick={onToggle}
          className="fixed inset-x-0 top-0 bottom-navbar z-20 bg-tinta/45"
        />
      ) : null}

      <div
        className={cn(
          'fixed inset-x-0 bottom-navbar z-30 flex flex-col',
          'rounded-t-lg bg-superficie px-gutter pb-4 shadow-panel',
        )}
      >
        <button
          type="button"
          aria-label={empty ? undefined : expanded ? 'Ocultar pedido' : 'Ver pedido'}
          disabled={empty}
          onClick={onToggle}
          className="flex justify-center pt-2 disabled:cursor-default"
        >
          <span className="h-asa-alto w-asa-ancho rounded-pill bg-borde-fuerte" />
        </button>

        {expanded && !empty ? (
          <>
            <div className="flex items-center justify-between py-2">
              <h2 className="text-title-sm font-extrabold text-tostado-700">
                Pedido actual
              </h2>
              <Button
                variant="danger-outline"
                size="md"
                icon="delete_sweep"
                onClick={onClear}
              >
                Vaciar
              </Button>
            </div>
            <div className="max-h-80 overflow-y-auto overscroll-contain">
              {items.map((item) => (
                <PedidoItemRow
                  key={item.productoId}
                  item={item}
                  onIncrement={() => onIncrement(item.productoId)}
                  onDecrement={() => onDecrement(item.productoId)}
                  onRemove={() => onRemove(item.productoId)}
                />
              ))}
            </div>
          </>
        ) : null}

        <button
          type="button"
          disabled={empty}
          onClick={onToggle}
          className={cn(
            'flex w-full items-end justify-between gap-3 py-3 text-left',
            'disabled:cursor-default',
          )}
        >
          <span className="flex flex-col gap-0.5">
            <span className="text-item font-extrabold text-tinta">
              {countLabel(empty, cantidadTotal)}
            </span>
            <span className="flex items-center gap-0.5 text-caption font-bold text-tostado-500">
              {hint}
              {chevron ? <Icon name={chevron} size={20} /> : null}
            </span>
          </span>
          <span
            className={cn(
              'text-total-sm font-black tabular-nums leading-none',
              empty ? 'text-tinta-tenue' : 'text-tinta',
            )}
          >
            {formatCOP(totalPesos)}
          </span>
        </button>

        <Button
          variant="primary"
          size="cta"
          fullWidth
          icon="payments"
          disabled={empty}
          onClick={onCobrar}
        >
          Cobrar
        </Button>
      </div>
    </>
  )
}
