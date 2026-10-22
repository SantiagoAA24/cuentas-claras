import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { Icon } from './Icon'
import { IconButton } from './IconButton'

type TopBarMainProps = {
  variant?: 'main'
  online: boolean
  printerConnected: boolean
  pendingCount: number
  onSettings: () => void
} & Omit<HTMLAttributes<HTMLElement>, 'children'>

type TopBarStackedProps = {
  variant: 'stacked'
  title: string
  onBack: () => void
} & Omit<HTMLAttributes<HTMLElement>, 'children' | 'title'>

export type TopBarProps = TopBarMainProps | TopBarStackedProps

const barBase =
  'flex h-topbar shrink-0 items-center border-b border-borde bg-superficie'

export function TopBar(props: TopBarProps) {
  if (props.variant === 'stacked') {
    const { title, onBack, className, variant: _variant, ...rest } = props
    return (
      <header className={cn(barBase, 'gap-1 px-2', className)} {...rest}>
        <IconButton
          icon="arrow_back"
          iconSize={28}
          variant="ghost"
          aria-label="Volver"
          onClick={onBack}
        />
        <h1 className="min-w-0 truncate text-title-sm font-black text-tostado-700">
          {title}
        </h1>
      </header>
    )
  }

  const {
    online,
    printerConnected,
    pendingCount,
    onSettings,
    className,
    variant: _variant,
    ...rest
  } = props

  return (
    <header
      className={cn(barBase, 'justify-between pr-2 pl-4', className)}
      {...rest}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-title-sm leading-none font-black text-tostado-700">
          Cuentas Claras
        </span>
        <div className="flex gap-2.5 text-estado font-extrabold">
          <span
            className={cn(
              'inline-flex items-center gap-1',
              online ? 'text-exito' : 'text-pendiente',
            )}
          >
            <span
              className={cn(
                'size-2 shrink-0 rounded-full',
                online ? 'bg-exito' : 'bg-pendiente',
              )}
              aria-hidden
            />
            {online ? 'En línea' : 'Sin conexión'}
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1',
              printerConnected ? 'text-exito' : 'text-peligro',
            )}
          >
            <Icon
              name={printerConnected ? 'print' : 'print_disabled'}
              size={14}
            />
            Impresora
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {pendingCount > 0 ? (
          <span className="inline-flex h-9 items-center gap-1.5 rounded-pill bg-pendiente-fondo px-2.5 text-caption font-black text-pendiente">
            <Icon name="cloud_upload" size={20} />
            {pendingCount} pendientes
          </span>
        ) : null}
        <IconButton
          icon="settings"
          iconSize={28}
          variant="ghost"
          aria-label="Configuración"
          onClick={onSettings}
        />
      </div>
    </header>
  )
}
