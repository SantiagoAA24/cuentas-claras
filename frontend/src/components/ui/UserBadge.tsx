import { cn } from '../../lib/cn'

type UserBadgeProps = {
  nombre: string
  /** Prefijo antes del nombre. Por defecto "Registrada por". */
  label?: string
  className?: string
}

/** Inicial en círculo + "Registrada por …". */
export function UserBadge({
  nombre,
  label = 'Registrada por',
  className,
}: UserBadgeProps) {
  const inicial = nombre.trim().charAt(0).toUpperCase() || '?'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 text-body font-bold text-tinta',
        className,
      )}
    >
      <span
        aria-hidden
        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-tostado-100 text-caption font-black text-tostado-700"
      >
        {inicial}
      </span>
      {label} {nombre}
    </span>
  )
}
