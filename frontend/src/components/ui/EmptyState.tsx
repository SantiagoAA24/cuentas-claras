import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Icon } from './Icon'

type EmptyStateProps = {
  icon: string
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

/** Estado vacío centrado: ícono, título y texto de ayuda opcional. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 px-6 py-12 text-center',
        className,
      )}
    >
      <Icon name={icon} size={40} className="text-icono-tenue" />
      <p className="text-item font-extrabold text-tostado-700">{title}</p>
      {description ? (
        <p className="text-label font-semibold text-tinta-suave">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}
