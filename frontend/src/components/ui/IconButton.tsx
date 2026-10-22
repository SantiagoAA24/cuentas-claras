import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { Icon } from './Icon'

type IconButtonVariant = 'ghost' | 'tonal'

type IconButtonProps = {
  /** Nombre del Material Symbol. */
  icon: string
  iconSize?: number
  variant?: IconButtonVariant
  /** Obligatorio: el botón no tiene texto visible. */
  'aria-label': string
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'children'>

const variantClasses: Record<IconButtonVariant, string> = {
  ghost: 'bg-transparent text-tostado-700 enabled:active:bg-tostado-100',
  tonal: 'bg-tostado-100 text-tostado-700 enabled:active:bg-tostado-200',
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      icon,
      iconSize = 26,
      variant = 'ghost',
      className,
      type = 'button',
      ...rest
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex size-touch shrink-0 items-center justify-center rounded-lg',
          'transition-colors duration-75',
          'disabled:bg-deshabilitado disabled:text-tinta-tenue',
          variantClasses[variant],
          className,
        )}
        {...rest}
      >
        <Icon name={icon} size={iconSize} />
      </button>
    )
  },
)
