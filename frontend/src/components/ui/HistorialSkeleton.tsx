import { cn } from '../../lib/cn'

type HistorialSkeletonProps = {
  /** Filas de venta placeholder. Por defecto 5. */
  rows?: number
  className?: string
}

/** Placeholder de carga del historial: resumen + filas. */
export function HistorialSkeleton({
  rows = 5,
  className,
}: HistorialSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Cargando historial"
      className={cn('flex flex-col gap-4', className)}
    >
      <div className="h-7 w-48 animate-pulse rounded-md bg-deshabilitado" />
      <div className="h-52 animate-pulse rounded-lg bg-deshabilitado" />
      <div className="flex flex-col gap-2">
        <div className="h-5 w-20 animate-pulse rounded-md bg-deshabilitado" />
        <div className="overflow-hidden rounded-lg bg-superficie shadow-card">
          {Array.from({ length: rows }, (_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-b border-borde px-3.5 py-3 last:border-b-0"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="h-3.5 w-28 animate-pulse rounded bg-deshabilitado" />
                <div className="h-4 w-40 animate-pulse rounded bg-deshabilitado" />
                <div className="h-3.5 w-24 animate-pulse rounded bg-deshabilitado" />
              </div>
              <div className="h-5 w-16 shrink-0 animate-pulse rounded bg-deshabilitado" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
