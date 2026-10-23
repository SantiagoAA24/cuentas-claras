import { SegmentedControl } from '../../../components/ui/SegmentedControl'
import type { MedioPago } from '../../../domain/types'
import { MEDIOS_PAGO } from '../../../lib/medioPago'

type CobroMedioPagoProps = {
  value: MedioPago
  onChange: (value: MedioPago) => void
}

export function CobroMedioPago({ value, onChange }: CobroMedioPagoProps) {
  return (
    <SegmentedControl
      variant="tiles"
      aria-label="Medio de pago"
      options={MEDIOS_PAGO}
      value={value}
      onChange={(v) => onChange(v as MedioPago)}
    />
  )
}
