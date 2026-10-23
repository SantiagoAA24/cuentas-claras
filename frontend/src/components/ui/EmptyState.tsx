import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Icon } from './Icon'

type EmptyStateProps = {
  icon: string
  title: string
  description?: string
  action?: ReactNode
  /**
   * Ilustración hero (círculos + ícono grande), p. ej. historial vacío.
   * Sin ella se muestra el ícono compacto por defecto.
   */
  illustrated?: boolean
  className?: string
}

/** Estado vacío centrado: ícono, título y texto de ayuda opcional. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  illustrated = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 px-6 text-center',
        illustrated ? 'gap-3.5 py-10' : 'py-12',
        className,
      )}
    >
      {illustrated ? (
        <div className="relative flex size-36 items-center justify-center">
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-maiz-100"
          />
          <span
            aria-hidden
            className="absolute top-2.5 right-1 size-10 rounded-full bg-maiz-500"
          />
          <span
            aria-hidden
            className="absolute bottom-4 left-3.5 size-knob rounded-full bg-borde-fuerte"
          />
          <Icon
            name={icon}
            size={72}
            className="relative text-tostado-500"
          />
        </div>
      ) : (
        <Icon name={icon} size={40} className="text-icono-tenue" />
      )}
      <p
        className={cn(
          'font-black text-tinta',
          illustrated
            ? 'mt-2 text-title'
            : 'text-item font-extrabold text-tostado-700',
        )}
      >
        {title}
      </p>
      {description ? (
        <p
          className={cn(
            'font-semibold text-tinta-suave text-pretty',
            illustrated ? 'max-w-[260px] text-body' : 'text-label',
          )}
        >
          {description}
        </p>
      ) : null}
      {action ? (
        <div className={cn(illustrated ? 'mt-2.5' : 'mt-2')}>{action}</div>
      ) : null}
    </div>
  )
}
