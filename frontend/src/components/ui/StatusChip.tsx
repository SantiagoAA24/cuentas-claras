import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { Icon } from './Icon'

export type StatusChipStatus =
  | 'sincronizado'
  | 'pendiente'
  | 'sin-conexion'
  | 'anulada'

type StatusChipSize = 'md' | 'sm'

type StatusChipProps = {
  status: StatusChipStatus
  /** Sobrescribe el texto por defecto del estado. */
  label?: string
  size?: StatusChipSize
} & Omit<HTMLAttributes<HTMLSpanElement>, 'children'>

const STATUS_CONFIG: Record<
  StatusChipStatus,
  { icon: string; label: string; className: string }
> = {
  sincronizado: {
    icon: 'cloud_done',
    label: 'Sincronizado',
    className: 'bg-exito-fondo text-exito',
  },
  pendiente: {
    icon: 'cloud_upload',
    label: 'Pendiente',
    className: 'bg-pendiente-fondo text-pendiente',
  },
  'sin-conexion': {
    icon: 'cloud_off',
    label: 'Sin conexión',
    className: 'bg-pendiente-fondo text-pendiente',
  },
  anulada: {
    icon: 'block',
    label: 'Anulada',
    className: 'bg-peligro-fondo text-peligro',
  },
}

const sizeClasses: Record<StatusChipSize, string> = {
  md: 'h-8',
  sm: 'h-7',
}

export function StatusChip({
  status,
  label,
  size = 'md',
  className,
  ...rest
}: StatusChipProps) {
  const config = STATUS_CONFIG[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill px-3',
        'text-caption font-extrabold',
        sizeClasses[size],
        config.className,
        className,
      )}
      {...rest}
    >
      <Icon name={config.icon} size={18} />
      {label ?? config.label}
    </span>
  )
}
