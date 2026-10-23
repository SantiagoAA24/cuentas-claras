import { cn } from '../../lib/cn'

type ProductosListSkeletonProps = {
  /** Filas de producto placeholder. Por defecto 6. */
  rows?: number
  className?: string
}

/** Placeholder de carga del catálogo: buscador + chips + filas. */
export function ProductosListSkeleton({
  rows = 6,
  className,
}: ProductosListSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Cargando productos"
      className={cn('flex flex-col gap-2.5', className)}
    >
      <div className="h-touch-lg animate-pulse rounded-lg bg-deshabilitado" />
      <div className="flex gap-2 pb-2.5">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="h-11 w-20 shrink-0 animate-pulse rounded-pill bg-deshabilitado"
          />
        ))}
      </div>
      <div className="overflow-hidden rounded-lg bg-superficie shadow-card">
        {Array.from({ length: rows }, (_, i) => (
          <div
            key={i}
            className="flex items-center gap-2 border-b border-borde py-3 pr-2 pl-3.5 last:border-b-0"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="h-4 w-36 animate-pulse rounded bg-deshabilitado" />
              <div className="h-3.5 w-20 animate-pulse rounded bg-deshabilitado" />
            </div>
            <div className="h-5 w-14 shrink-0 animate-pulse rounded bg-deshabilitado" />
            <div className="h-switch-h w-switch shrink-0 animate-pulse rounded-pill bg-deshabilitado" />
          </div>
        ))}
      </div>
    </div>
  )
}
