import {
  forwardRef,
  useId,
  type ChangeEvent,
  type InputHTMLAttributes,
} from 'react'
import { cn } from '../../lib/cn'
import {
  amountToDigits,
  digitsToAmount,
  formatDigitsWithDots,
  sanitizeDigits,
} from '../../lib/moneyDigits'
import { Icon } from './Icon'

type MoneyFieldSize = 'md' | 'lg'

type MoneyFieldProps = {
  label: string
  value: number | null
  onChange: (value: number | null) => void
  size?: MoneyFieldSize
  error?: string
  help?: string
  /** Cuando el valor lo controla NumericKeypad: no abre el teclado del sistema. */
  readOnly?: boolean
  className?: string
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'size' | 'type' | 'inputMode' | 'className' | 'readOnly'
>

const sizeShell: Record<MoneyFieldSize, string> = {
  md: 'h-cta',
  lg: 'h-topbar',
}

const sizeText: Record<MoneyFieldSize, string> = {
  md: 'text-money',
  lg: 'text-title-lg',
}

export const MoneyField = forwardRef<HTMLInputElement, MoneyFieldProps>(
  function MoneyField(
    {
      label,
      value,
      onChange,
      size = 'md',
      error,
      help,
      readOnly = false,
      className,
      id: idProp,
      disabled,
      placeholder = '0',
      ...rest
    },
    ref,
  ) {
    const generatedId = useId()
    const id = idProp ?? generatedId
    const errorId = `${id}-error`
    const helpId = `${id}-help`
    const describedBy = error ? errorId : help ? helpId : undefined
    const hasError = error != null && error !== ''

    const digits = amountToDigits(value)
    const display = formatDigitsWithDots(digits)

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
      const next = sanitizeDigits(e.target.value)
      onChange(digitsToAmount(next))
    }

    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        <label
          htmlFor={id}
          className="text-label font-extrabold text-tostado-700"
        >
          {label}
        </label>

        <div
          className={cn(
            'flex items-center gap-1 rounded-lg border-2 bg-superficie px-4',
            sizeShell[size],
            hasError
              ? 'border-peligro focus-within:shadow-focus'
              : 'border-borde-fuerte focus-within:border-tostado-500 focus-within:shadow-focus',
          )}
        >
          <span
            className={cn(
              'shrink-0 font-black text-tinta-suave',
              sizeText[size],
            )}
            aria-hidden="true"
          >
            $
          </span>
          <input
            ref={ref}
            id={id}
            type="text"
            inputMode="numeric"
            readOnly={readOnly}
            disabled={disabled}
            placeholder={placeholder}
            value={display}
            onChange={handleChange}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
            className={cn(
              'h-full min-w-0 flex-1 bg-transparent font-black text-tinta tabular-nums outline-none',
              'placeholder:text-tinta-tenue',
              sizeText[size],
            )}
            {...rest}
          />
        </div>

        {hasError ? (
          <p
            id={errorId}
            className="flex items-center gap-1 text-caption font-extrabold text-peligro"
          >
            <Icon name="error" size={18} />
            {error}
          </p>
        ) : help != null && help !== '' ? (
          <p id={helpId} className="text-caption font-bold text-tinta-suave">
            {help}
          </p>
        ) : null}
      </div>
    )
  },
)
