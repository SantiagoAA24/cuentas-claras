import { cn } from '../../lib/cn'

type ConfiguracionSkeletonProps = {
  className?: string
}

/** Placeholder de carga de Configuración: cuatro secciones. */
export function ConfiguracionSkeleton({
  className,
}: ConfiguracionSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Cargando configuración"
      className={cn('flex flex-col gap-6 px-gutter py-5', className)}
    >
      {/* Impresora */}
      <div className="flex flex-col gap-2.5">
        <div className="h-5 w-24 animate-pulse rounded-md bg-deshabilitado" />
        <div className="flex flex-col gap-3 rounded-lg bg-superficie p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="size-touch shrink-0 animate-pulse rounded-lg bg-deshabilitado" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-5 w-28 animate-pulse rounded bg-deshabilitado" />
              <div className="h-4 w-40 animate-pulse rounded bg-deshabilitado" />
            </div>
          </div>
          <div className="h-touch-lg animate-pulse rounded-lg bg-deshabilitado" />
          <div className="h-touch-lg animate-pulse rounded-lg bg-deshabilitado" />
        </div>
      </div>

      {/* Negocio */}
      <div className="flex flex-col gap-2.5">
        <div className="h-5 w-20 animate-pulse rounded-md bg-deshabilitado" />
        <div className="flex flex-col gap-3.5 rounded-lg bg-superficie p-4 shadow-card">
          <div className="h-touch-lg animate-pulse rounded-lg bg-deshabilitado" />
          <div className="h-touch-lg animate-pulse rounded-lg bg-deshabilitado" />
          <div className="h-20 animate-pulse rounded-lg bg-deshabilitado" />
        </div>
      </div>

      {/* Dispositivo */}
      <div className="flex flex-col gap-2.5">
        <div className="h-5 w-28 animate-pulse rounded-md bg-deshabilitado" />
        <div className="h-28 animate-pulse rounded-lg bg-deshabilitado" />
      </div>

      {/* Cuenta */}
      <div className="flex flex-col gap-2.5">
        <div className="h-5 w-16 animate-pulse rounded-md bg-deshabilitado" />
        <div className="h-32 animate-pulse rounded-lg bg-deshabilitado" />
      </div>
    </div>
  )
}
