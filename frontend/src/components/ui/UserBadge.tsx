import { cn } from '../../lib/cn'

type UserBadgeProps = {
  nombre: string
  /**
   * Prefijo antes del nombre (p. ej. "Registrada por").
   * Se ignora si hay `subtitle` (modo cuenta).
   * Pasa `null` o `""` para mostrar solo el nombre en una línea.
   */
  label?: string | null
  /** Subtítulo bajo el nombre (modo cuenta / sesión). */
  subtitle?: string
  /** `sm` = 28 px (detalle); `lg` = 48 px (configuración). */
  size?: 'sm' | 'lg'
  className?: string
}

/** Inicial en círculo + nombre (con label o subtítulo). */
export function UserBadge({
  nombre,
  label = 'Registrada por',
  subtitle,
  size = 'sm',
  className,
}: UserBadgeProps) {
  const inicial = nombre.trim().charAt(0).toUpperCase() || '?'
  const isAccount = subtitle != null && subtitle !== ''

  return (
    <span
      className={cn(
        'inline-flex items-center gap-3 text-tinta',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full bg-tostado-100 font-black text-tostado-700',
          size === 'lg'
            ? 'size-12 text-title-sm'
            : 'size-7 text-caption',
        )}
      >
        {inicial}
      </span>
      {isAccount ? (
        <span className="flex min-w-0 flex-col">
          <span className="text-body-lg font-black">{nombre}</span>
          <span className="text-caption font-bold text-tinta-suave">
            {subtitle}
          </span>
        </span>
      ) : (
        <span className="text-body font-bold">
          {label ? `${label} ${nombre}` : nombre}
        </span>
      )}
    </span>
  )
}
