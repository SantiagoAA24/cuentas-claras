import { forwardRef, useId, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { Icon } from './Icon'

type SearchFieldProps = {
  value: string
  onChange: (value: string) => void
  /** Placeholder del input. Por defecto "Buscar". */
  placeholder?: string
  className?: string
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type' | 'className' | 'placeholder'
>

/** Campo de búsqueda con ícono a la izquierda. */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  function SearchField(
    {
      value,
      onChange,
      placeholder = 'Buscar',
      className,
      id: idProp,
      disabled,
      ...rest
    },
    ref,
  ) {
    const generatedId = useId()
    const id = idProp ?? generatedId

    return (
      <div
        className={cn(
          'flex h-touch-lg items-center gap-2 rounded-lg border-2 bg-superficie px-3',
          'border-borde-fuerte focus-within:border-tostado-500 focus-within:shadow-focus',
          disabled && 'opacity-50',
          className,
        )}
      >
        <Icon name="search" size={24} className="shrink-0 text-tostado-500" />
        <input
          ref={ref}
          id={id}
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          disabled={disabled}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'h-full min-w-0 flex-1 bg-transparent text-body-lg font-semibold text-tinta outline-none',
            'placeholder:text-tinta-tenue',
            // Oculta el clear nativo de WebKit para un look uniforme
            '[&::-webkit-search-cancel-button]:hidden',
          )}
          {...rest}
        />
      </div>
    )
  },
)
