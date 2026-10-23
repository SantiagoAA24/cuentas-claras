import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { Icon } from './Icon'

type FabProps = {
  /** Nombre del Material Symbol. Por defecto `add`. */
  icon?: string
  /** Obligatorio: el FAB no tiene texto visible. */
  'aria-label': string
  className?: string
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'children'>

/** Botón de acción flotante circular (64 px, maíz). */
export const Fab = forwardRef<HTMLButtonElement, FabProps>(function Fab(
  {
    icon = 'add',
    className,
    type = 'button',
    disabled,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={cn(
        'inline-flex size-fab shrink-0 items-center justify-center rounded-full',
        'bg-maiz-500 text-tinta shadow-fab',
        'transition-transform duration-75',
        'enabled:active:scale-press enabled:active:bg-maiz-600',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:outline-none focus-visible:shadow-focus',
        className,
      )}
      {...rest}
    >
      <Icon name={icon} size={36} />
    </button>
  )
})
