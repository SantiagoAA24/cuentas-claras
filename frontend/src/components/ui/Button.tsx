import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { Icon } from './Icon'

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tonal'
  | 'danger'
  | 'danger-outline'
  | 'link'

type ButtonSize = 'md' | 'lg' | 'cta'

type ButtonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  /** Nombre del Material Symbol a la izquierda del texto. */
  icon?: string
  loading?: boolean
  /** Texto mostrado mientras `loading` es true (p. ej. "Intentando…"). */
  loadingLabel?: string
} & ButtonHTMLAttributes<HTMLButtonElement>

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-maiz-500 text-tinta shadow-primary enabled:active:bg-maiz-600 enabled:active:translate-y-px enabled:active:shadow-primary-pressed',
  secondary:
    'border-2 border-tostado-500 bg-superficie text-tostado-700 enabled:active:bg-tostado-100',
  tonal: 'bg-tostado-100 text-tostado-700 enabled:active:bg-tostado-200',
  danger: 'bg-peligro text-white enabled:active:bg-peligro-600',
  'danger-outline':
    'border-2 border-peligro bg-superficie text-peligro enabled:active:bg-peligro-fondo',
  link: 'bg-transparent text-tostado-700 underline underline-offset-enlace',
}

const sizeClasses: Record<ButtonSize, string> = {
  md: 'h-touch text-item font-extrabold',
  lg: 'h-touch-lg text-body-lg font-extrabold',
  cta: 'h-cta text-title-sm font-black',
}

const iconSize: Record<ButtonSize, number> = {
  md: 22,
  lg: 24,
  cta: 26,
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      icon,
      loading = false,
      loadingLabel,
      disabled,
      className,
      children,
      type = 'button',
      ...rest
    },
    ref,
  ) {
    const isDisabled = disabled || loading
    const label = loading && loadingLabel != null ? loadingLabel : children

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg px-4',
          'transition-[background-color,box-shadow,transform] duration-75',
          'disabled:bg-deshabilitado disabled:text-tinta-tenue disabled:shadow-none disabled:translate-y-0 disabled:border-transparent disabled:no-underline',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className,
        )}
        {...rest}
      >
        {!loading && icon != null ? <Icon name={icon} size={iconSize[size]} /> : null}
        {label}
      </button>
    )
  },
)
