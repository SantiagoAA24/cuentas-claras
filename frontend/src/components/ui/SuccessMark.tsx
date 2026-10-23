import { cn } from '../../lib/cn'
import { Icon } from './Icon'

type SuccessMarkProps = {
  /** Material Symbol; por defecto `check`. */
  icon?: string
  className?: string
}

/**
 * Marca de éxito grande (círculo verde con halo) para pantallas como venta registrada.
 */
export function SuccessMark({
  icon = 'check',
  className,
}: SuccessMarkProps) {
  return (
    <div
      className={cn(
        'flex size-24 items-center justify-center rounded-full bg-exito',
        'ring-[10px] ring-exito-fondo',
        className,
      )}
      aria-hidden="true"
    >
      <Icon name={icon} size={60} className="text-white" />
    </div>
  )
}
