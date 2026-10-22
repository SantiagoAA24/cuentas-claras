import { cn } from '../../lib/cn'
import { Icon } from './Icon'

type QuantityStepperProps = {
  value: number
  onIncrement: () => void
  onDecrement: () => void
  /** Se llama al restar cuando `removable` es true y `value` es 1. */
  onRemove?: () => void
  /** Si true y value es 1, el botón restar muestra "delete" y llama onRemove. */
  removable?: boolean
  /** Tope de cantidad; deshabilita el botón sumar al alcanzarlo. */
  max?: number
  /** Nombre del producto para aria-label (p. ej. "Arepa de queso"). */
  itemName: string
  className?: string
}

export function QuantityStepper({
  value,
  onIncrement,
  onDecrement,
  onRemove,
  removable = false,
  max,
  itemName,
  className,
}: QuantityStepperProps) {
  const isRemoveMode = removable && value === 1
  const canDecrement = isRemoveMode || value > 1
  const canIncrement = max == null || value < max

  const handleDecrement = () => {
    if (isRemoveMode) {
      onRemove?.()
      return
    }
    onDecrement()
  }

  return (
    <div
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-lg border border-borde bg-crema p-1',
        className,
      )}
    >
      <button
        type="button"
        aria-label={
          isRemoveMode
            ? `Quitar ${itemName} del pedido`
            : `Quitar una ${itemName}`
        }
        disabled={!canDecrement}
        onClick={handleDecrement}
        className={cn(
          'inline-flex size-touch shrink-0 items-center justify-center rounded-md',
          'bg-superficie shadow-tecla',
          'transition-colors duration-75',
          'disabled:bg-deshabilitado disabled:text-tinta-tenue disabled:shadow-none',
          isRemoveMode ? 'text-peligro' : 'text-tostado-700',
        )}
      >
        <Icon name={isRemoveMode ? 'delete' : 'remove'} size={26} />
      </button>

      <span
        className="min-w-9 text-center text-price font-black tabular-nums text-tinta"
        aria-live="polite"
      >
        {value}
      </span>

      <button
        type="button"
        aria-label={`Agregar una ${itemName}`}
        disabled={!canIncrement}
        onClick={onIncrement}
        className={cn(
          'inline-flex size-touch shrink-0 items-center justify-center rounded-md',
          'bg-maiz-500 text-tinta',
          'transition-colors duration-75',
          'enabled:active:bg-maiz-600',
          'disabled:bg-deshabilitado disabled:text-tinta-tenue',
        )}
      >
        <Icon name="add" size={26} />
      </button>
    </div>
  )
}
