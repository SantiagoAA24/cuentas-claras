import { Card } from '../../../components/ui/Card'
import { Icon } from '../../../components/ui/Icon'
import type { MedioPago } from '../../../domain/types'
import { formatCOP } from '../../../lib/format'

type CobroDigitalAvisoProps = {
  total: number
  medio: Exclude<MedioPago, 'Efectivo'>
}

export function CobroDigitalAviso({ total, medio }: CobroDigitalAvisoProps) {
  return (
    <Card variant="muted" padding="md" className="flex items-start gap-2.5">
      <Icon
        name="verified"
        size={24}
        className="shrink-0 text-tostado-500"
      />
      <p className="text-body font-bold leading-snug text-tinta">
        Confirma que el pago de{' '}
        <strong className="font-black tabular-nums">{formatCOP(total)}</strong>{' '}
        llegó a {medio} antes de cobrar.
      </p>
    </Card>
  )
}
