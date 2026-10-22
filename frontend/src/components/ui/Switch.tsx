import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type SwitchProps = {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  /** Obligatorio: el interruptor no tiene texto visible. */
  'aria-label': string
  disabled?: boolean
  className?: string
} & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label' | 'children' | 'onChange' | 'role' | 'aria-checked'
>

function SwitchTrack({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'box-border flex h-switch-h w-switch shrink-0 items-center rounded-pill border-2 px-switch-pad',
        checked ? 'border-exito bg-exito' : 'border-borde-medio bg-borde-fuerte',
      )}
    >
      <span
        className={cn(
          'size-knob rounded-full bg-white shadow-knob',
          'transition-transform duration-150 ease-out',
          checked && 'translate-x-switch-travel',
        )}
      />
    </span>
  )
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  function Switch(
    {
      checked,
      onCheckedChange,
      disabled = false,
      className,
      type = 'button',
      onClick,
      ...rest
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={(event) => {
          onClick?.(event)
          if (event.defaultPrevented || disabled) return
          onCheckedChange(!checked)
        }}
        className={cn(
          'inline-flex size-touch shrink-0 items-center justify-center',
          'transition-opacity duration-75',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...rest}
      >
        <SwitchTrack checked={checked} />
      </button>
    )
  },
)

type SwitchRowProps = {
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export function SwitchRow({
  label,
  description,
  checked,
  onCheckedChange,
  disabled = false,
  className,
}: SwitchRowProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => {
        if (disabled) return
        onCheckedChange(!checked)
      }}
      className={cn(
        'flex min-h-cta w-full items-center gap-3 rounded-lg border border-borde',
        'bg-superficie py-2 pr-3 pl-4 text-left',
        'transition-opacity duration-75',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    >
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-item font-extrabold text-tinta">{label}</span>
        <span className="text-caption font-bold text-tinta-suave">
          {description}
        </span>
      </span>
      <SwitchTrack checked={checked} />
    </button>
  )
}
