import { cn } from '../../lib/cn'

type ProductGridSkeletonProps = {
  /** Cantidad de tarjetas placeholder. Por defecto 6. */
  count?: number
  className?: string
}

/** Grilla 2 columnas de placeholders mientras cargan los productos. */
export function ProductGridSkeleton({
  count = 6,
  className,
}: ProductGridSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Cargando productos"
      className={cn('grid grid-cols-2 gap-3', className)}
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="min-h-tarjeta-producto animate-pulse rounded-lg bg-deshabilitado"
        />
      ))}
    </div>
  )
}
