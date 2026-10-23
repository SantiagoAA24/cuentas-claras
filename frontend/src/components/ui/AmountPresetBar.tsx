import { cn } from '../../lib/cn'

const FIXED_PRESETS = [
  { amount: 10_000, label: '$10 mil' },
  { amount: 20_000, label: '$20 mil' },
  { amount: 50_000, label: '$50 mil' },
  { amount: 100_000, label: '$100 mil' },
] as const

type AmountPresetBarProps = {
  /** Monto del pedido; se usa en el preset "Exacto". */
  exactAmount: number
  /** Valor actual seleccionado; `null` si no hay coincidencia. */
  value: number | null
  onChange: (amount: number) => void
  className?: string
}

/**
 * Fila de montos rápidos para cobro en efectivo ($10 mil … Exacto).
 */
export function AmountPresetBar({
  exactAmount,
  value,
  onChange,
  className,
}: AmountPresetBarProps) {
  const presets = [
    ...FIXED_PRESETS,
    { amount: exactAmount, label: 'Exacto' },
  ]

  return (
    <div
      role="group"
      aria-label="Montos rápidos"
      className={cn('grid grid-cols-5 gap-1.5', className)}
    >
      {presets.map((preset) => {
        const selected = value === preset.amount
        return (
          <button
            key={`${preset.label}-${preset.amount}`}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(preset.amount)}
            className={cn(
              'h-touch rounded-lg border-2 px-0.5',
              'text-label font-extrabold tabular-nums text-tinta',
              'transition-colors duration-75',
              'whitespace-nowrap',
              selected
                ? 'border-maiz-500 bg-maiz-500'
                : 'border-borde-fuerte bg-superficie',
            )}
          >
            {preset.label}
          </button>
        )
      })}
    </div>
  )
}
