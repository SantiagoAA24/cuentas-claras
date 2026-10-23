import { BottomSheet } from '../../../components/ui/BottomSheet'
import { Button } from '../../../components/ui/Button'
import type { MedioPago, Venta } from '../../../domain/types'
import type { CobroPaso } from '../hooks/useCobroState'
import { CobroPagoForm } from './CobroPagoForm'
import { VentaExitosa } from './VentaExitosa'

type CobroSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  paso: CobroPaso
  total: number
  cantidadTotal: number
  medioPago: MedioPago
  onMedioPagoChange: (medio: MedioPago) => void
  pagaDigits: string
  onPagaDigitsChange: (digits: string) => void
  bloqueado: boolean
  submitting: boolean
  venta: Venta | null
  onCobrarConImpresion: () => void
  onCobrarSinImpresion: () => void
  onNuevaVenta: () => void
}

export function CobroSheet({
  open,
  onOpenChange,
  paso,
  total,
  cantidadTotal,
  medioPago,
  onMedioPagoChange,
  pagaDigits,
  onPagaDigitsChange,
  bloqueado,
  submitting,
  venta,
  onCobrarConImpresion,
  onCobrarSinImpresion,
  onNuevaVenta,
}: CobroSheetProps) {
  const cobrando = paso === 'cobrando'
  const ctaDisabled = bloqueado || submitting

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      showClose={cobrando && !submitting}
      dismissible={false}
      footer={
        cobrando ? (
          <div className="flex flex-col gap-0.5">
            <Button
              variant="primary"
              size="cta"
              fullWidth
              icon="print"
              disabled={bloqueado}
              loading={submitting}
              loadingLabel="Registrando…"
              onClick={onCobrarConImpresion}
            >
              Cobrar e imprimir
            </Button>
            <Button
              variant="link"
              size="md"
              fullWidth
              disabled={ctaDisabled}
              className="disabled:bg-transparent disabled:text-tinta-apagada"
              onClick={onCobrarSinImpresion}
            >
              Cobrar sin imprimir
            </Button>
          </div>
        ) : (
          <Button
            variant="primary"
            size="cta"
            fullWidth
            icon="add_shopping_cart"
            onClick={onNuevaVenta}
          >
            Nueva venta
          </Button>
        )
      }
    >
      {cobrando ? (
        <CobroPagoForm
          total={total}
          cantidadTotal={cantidadTotal}
          medioPago={medioPago}
          onMedioPagoChange={onMedioPagoChange}
          pagaDigits={pagaDigits}
          onPagaDigitsChange={onPagaDigitsChange}
        />
      ) : venta != null ? (
        <VentaExitosa venta={venta} />
      ) : null}
    </BottomSheet>
  )
}
