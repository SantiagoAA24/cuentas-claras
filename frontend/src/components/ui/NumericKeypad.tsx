import { cn } from '../../lib/cn'
import { applyKeypadKey, type KeypadKey } from '../../lib/moneyDigits'
import { Icon } from './Icon'

const KEYS: KeypadKey[] = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '000',
  '0',
  'back',
]

type NumericKeypadProps = {
  /** Cadena de dígitos sin formato (sin puntos). */
  value: string
  onChange: (value: string) => void
  maxLength?: number
  className?: string
}

export function NumericKeypad({
  value,
  onChange,
  maxLength = 7,
  className,
}: NumericKeypadProps) {
  function press(key: KeypadKey) {
    onChange(applyKeypadKey(value, key, maxLength))
  }

  return (
    <div
      className={cn('grid grid-cols-3 gap-1.5', className)}
      role="group"
      aria-label="Teclado numérico"
    >
      {KEYS.map((key) =>
        key === 'back' ? (
          <button
            key={key}
            type="button"
            aria-label="Borrar"
            onClick={() => press(key)}
            className={cn(
              'flex h-keypad items-center justify-center rounded-lg',
              'bg-tostado-100 text-tinta',
              'enabled:active:bg-tostado-200',
              'transition-colors duration-75',
            )}
          >
            <Icon name="backspace" size={26} />
          </button>
        ) : (
          <button
            key={key}
            type="button"
            onClick={() => press(key)}
            className={cn(
              'flex h-keypad items-center justify-center rounded-lg',
              'bg-tostado-100 text-title font-extrabold text-tinta',
              'enabled:active:bg-tostado-200',
              'transition-colors duration-75',
            )}
          >
            {key}
          </button>
        ),
      )}
    </div>
  )
}
