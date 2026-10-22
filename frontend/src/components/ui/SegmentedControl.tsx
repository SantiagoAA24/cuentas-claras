import {
  useCallback,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { cn } from '../../lib/cn'
import { Icon } from './Icon'

export type SegmentedOption = {
  value: string
  label: string
  icon?: string
}

type SegmentedVariant = 'segmented' | 'tiles' | 'radio-list'

type SegmentedControlProps = {
  options: SegmentedOption[]
  value: string
  onChange: (value: string) => void
  variant: SegmentedVariant
  /** Columnas iguales (solo `segmented`). Por defecto, una por opción. */
  columns?: number
  className?: string
  'aria-label'?: string
}

function moveIndex(
  current: number,
  delta: number,
  length: number,
): number {
  return (current + delta + length) % length
}

export function SegmentedControl({
  options,
  value,
  onChange,
  variant,
  columns,
  className,
  'aria-label': ariaLabel,
}: SegmentedControlProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const selectedIndex = options.findIndex((o) => o.value === value)
  const focusIndex = selectedIndex >= 0 ? selectedIndex : 0

  const selectAt = useCallback(
    (index: number) => {
      const option = options[index]
      if (option == null) return
      onChange(option.value)
      refs.current[index]?.focus()
    },
    [onChange, options],
  )

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (options.length === 0) return

    let next: number | null = null
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = moveIndex(focusIndex, 1, options.length)
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        next = moveIndex(focusIndex, -1, options.length)
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = options.length - 1
        break
      default:
        return
    }

    event.preventDefault()
    selectAt(next)
  }

  const colCount =
    variant === 'segmented' ? (columns ?? options.length) : undefined

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={cn(
        variant === 'segmented' &&
          'grid gap-1.5 rounded-lg border border-borde bg-crema p-1',
        variant === 'tiles' && 'grid grid-cols-2 gap-2',
        variant === 'radio-list' && 'flex flex-col gap-2',
        className,
      )}
      style={
        colCount != null
          ? { gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }
          : undefined
      }
    >
      {options.map((option, index) => {
        const selected = option.value === value
        const tabIndex = index === focusIndex ? 0 : -1

        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={tabIndex}
            onClick={() => onChange(option.value)}
            className={cn(
              'font-sans text-tinta transition-colors duration-75',
              'focus-visible:outline-none focus-visible:shadow-focus',
              variant === 'segmented' &&
                cn(
                  'flex h-touch items-center justify-center gap-1.5 rounded-md border-0',
                  'text-body font-extrabold',
                  selected
                    ? 'bg-maiz-500 shadow-segmento'
                    : 'bg-transparent shadow-none',
                ),
              variant === 'tiles' &&
                cn(
                  'flex h-touch-lg items-center gap-2 rounded-lg border-2 px-3',
                  'text-item font-extrabold',
                  selected
                    ? 'border-maiz-500 bg-maiz-500'
                    : 'border-borde-fuerte bg-superficie',
                ),
              variant === 'radio-list' &&
                cn(
                  'flex h-switch items-center gap-3 rounded-lg border-2 px-3.5',
                  'text-item font-extrabold text-left',
                  selected
                    ? 'border-maiz-500 bg-maiz-50'
                    : 'border-borde-fuerte bg-superficie',
                ),
            )}
          >
            {variant === 'radio-list' ? (
              <RadioDot selected={selected} />
            ) : null}
            {option.icon != null && variant !== 'radio-list' ? (
              <Icon
                name={option.icon}
                size={variant === 'tiles' ? 24 : 20}
                className={
                  variant === 'tiles'
                    ? selected
                      ? 'text-tinta'
                      : 'text-tostado-500'
                    : undefined
                }
              />
            ) : null}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function RadioDot({ selected }: { selected: boolean }): ReactNode {
  return (
    <span
      className={cn(
        'flex size-knob shrink-0 items-center justify-center rounded-full border-2 box-border',
        selected ? 'border-tinta' : 'border-icono-tenue',
      )}
      aria-hidden="true"
    >
      <span
        className={cn(
          'size-2.5 rounded-full',
          selected ? 'bg-tinta' : 'bg-transparent',
        )}
      />
    </span>
  )
}
