import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type ChipProps = {
  selected?: boolean
  onClick?: () => void
  children: ReactNode
  className?: string
}

export function Chip({
  selected = false,
  onClick,
  children,
  className,
}: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'inline-flex h-11 shrink-0 items-center rounded-pill border-2 px-4.5',
        'text-body font-extrabold text-tinta',
        'transition-colors duration-75',
        selected
          ? 'border-maiz-500 bg-maiz-500'
          : 'border-borde-fuerte bg-superficie',
        className,
      )}
    >
      {children}
    </button>
  )
}

type ChipOption = string | { value: string; label: string }

type ChipGroupProps = {
  options: ChipOption[]
  value: string
  onChange: (value: string) => void
  className?: string
}

function normalizeOption(option: ChipOption): { value: string; label: string } {
  return typeof option === 'string' ? { value: option, label: option } : option
}

export function ChipGroup({
  options,
  value,
  onChange,
  className,
}: ChipGroupProps) {
  return (
    <div
      role="group"
      className={cn(
        'flex gap-2 overflow-x-auto overscroll-x-contain',
        '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
    >
      {options.map((option) => {
        const { value: optionValue, label } = normalizeOption(option)
        return (
          <Chip
            key={optionValue}
            selected={optionValue === value}
            onClick={() => onChange(optionValue)}
          >
            {label}
          </Chip>
        )
      })}
    </div>
  )
}
