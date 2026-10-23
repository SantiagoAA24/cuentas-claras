import type { MedioPago } from '../../../domain/types'
import { formatCOP } from '../../../lib/format'
import { CobroDigitalAviso } from './CobroDigitalAviso'
import { CobroEfectivo } from './CobroEfectivo'
import { CobroMedioPago } from './CobroMedioPago'

type CobroPagoFormProps = {
  total: number
  cantidadTotal: number
  medioPago: MedioPago
  onMedioPagoChange: (medio: MedioPago) => void
  pagaDigits: string
  onPagaDigitsChange: (digits: string) => void
}

function productosLabel(cantidadTotal: number): string {
  if (cantidadTotal === 1) return '1 producto'
  return `${cantidadTotal} productos`
}

export function CobroPagoForm({
  total,
  cantidadTotal,
  medioPago,
  onMedioPagoChange,
  pagaDigits,
  onPagaDigitsChange,
}: CobroPagoFormProps) {
  const esEfectivo = medioPago === 'Efectivo'

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-label font-extrabold text-tinta-suave">
          Total a cobrar · {productosLabel(cantidadTotal)}
        </span>
        <span className="text-total-xl font-black tabular-nums tracking-tight text-tinta">
          {formatCOP(total)}
        </span>
      </div>

      <CobroMedioPago value={medioPago} onChange={onMedioPagoChange} />

      {esEfectivo ? (
        <CobroEfectivo
          total={total}
          pagaDigits={pagaDigits}
          onPagaDigitsChange={onPagaDigitsChange}
        />
      ) : (
        <CobroDigitalAviso
          total={total}
          medio={medioPago}
        />
      )}
    </div>
  )
}
