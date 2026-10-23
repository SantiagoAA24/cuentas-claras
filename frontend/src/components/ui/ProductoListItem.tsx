import { cn } from '../../lib/cn'
import { formatCOP } from '../../lib/format'
import { Switch } from './Switch'

type ProductoListItemProps = {
  nombre: string
  /** Texto secundario: categoría, o categoría + estado inactivo. */
  meta: string
  precio: number
  activo: boolean
  onEdit: () => void
  onActivoChange: (activo: boolean) => void
  className?: string
}

/** Fila tocable de un producto en el catálogo (nombre, meta, precio + interruptor). */
export function ProductoListItem({
  nombre,
  meta,
  precio,
  activo,
  onEdit,
  onActivoChange,
  className,
}: ProductoListItemProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 pr-2',
        activo ? 'bg-superficie' : 'bg-superficie-inactiva',
        className,
      )}
    >
      <button
        type="button"
        onClick={onEdit}
        className={cn(
          'flex min-h-cta min-w-0 flex-1 items-center gap-2.5 py-2.5 pl-3.5 text-left',
          'active:bg-crema',
          !activo && 'opacity-50',
        )}
      >
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-item font-extrabold leading-snug text-tinta">
            {nombre}
          </span>
          <span className="text-caption font-bold text-tinta-suave">{meta}</span>
        </span>
        <span className="shrink-0 text-body-lg font-black tabular-nums text-tostado-700">
          {formatCOP(precio)}
        </span>
      </button>
      <Switch
        checked={activo}
        onCheckedChange={onActivoChange}
        aria-label={activo ? 'Desactivar producto' : 'Activar producto'}
      />
    </div>
  )
}
