import { cn } from '../../lib/cn'

type DetalleSkeletonProps = {
  className?: string
}

/** Placeholder de carga del detalle de venta: 3 tarjetas + hueco de acciones. */
export function DetalleSkeleton({ className }: DetalleSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Cargando detalle de venta"
      className={cn('flex min-h-full flex-col', className)}
    >
      <div className="flex flex-1 flex-col gap-3 px-gutter py-4">
        <div className="h-28 animate-pulse rounded-lg bg-deshabilitado" />
        <div className="h-44 animate-pulse rounded-lg bg-deshabilitado" />
        <div className="h-24 animate-pulse rounded-lg bg-deshabilitado" />
      </div>
      <div className="sticky bottom-0 shrink-0 border-t border-borde bg-superficie px-gutter pt-3 pb-4">
        <div className="flex gap-2.5">
          <div className="h-touch-lg flex-[1.2] animate-pulse rounded-lg bg-deshabilitado" />
          <div className="h-touch-lg flex-1 animate-pulse rounded-lg bg-deshabilitado" />
        </div>
      </div>
    </div>
  )
}
