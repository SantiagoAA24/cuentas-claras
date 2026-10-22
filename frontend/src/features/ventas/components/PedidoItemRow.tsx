import { QuantityStepper } from '../../../components/ui/QuantityStepper'
import { formatCOP } from '../../../lib/format'
import type { PedidoItem } from '../../../stores/pedidoStore'

type PedidoItemRowProps = {
  item: PedidoItem
  onIncrement: () => void
  onDecrement: () => void
  onRemove: () => void
}

export function PedidoItemRow({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}: PedidoItemRowProps) {
  const subtotal = item.precioUnitario * item.cantidad

  return (
    <div className="flex items-center gap-3 border-b border-borde py-3">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-item font-extrabold text-tinta text-pretty">
          {item.nombre}
        </span>
        <span className="text-caption font-bold tabular-nums text-tinta-suave">
          {formatCOP(item.precioUnitario)} c/u
        </span>
        <span className="text-body-lg font-black tabular-nums text-tostado-700">
          {formatCOP(subtotal)}
        </span>
      </div>
      <QuantityStepper
        value={item.cantidad}
        itemName={item.nombre}
        removable
        onIncrement={onIncrement}
        onDecrement={onDecrement}
        onRemove={onRemove}
      />
    </div>
  )
}
