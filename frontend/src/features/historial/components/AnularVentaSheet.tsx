import { useEffect, useState } from 'react'
import { BottomSheet } from '../../../components/ui/BottomSheet'
import { Button } from '../../../components/ui/Button'
import { Icon } from '../../../components/ui/Icon'
import { SegmentedControl } from '../../../components/ui/SegmentedControl'
import { TextField } from '../../../components/ui/TextField'
import type { MotivoAnulacion } from '../../../domain/types'
import { formatCOP } from '../../../lib/format'
import { MOTIVOS_ANULACION } from '../lib/motivoAnulacion'

type AnularVentaSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  recibo: string
  total: number
  submitting?: boolean
  error?: string | null
  onConfirm: (motivo: MotivoAnulacion, texto?: string) => void
}

const MOTIVO_OPTIONS = MOTIVOS_ANULACION.map((motivo) => ({
  value: motivo,
  label: motivo,
}))

export function AnularVentaSheet({
  open,
  onOpenChange,
  recibo,
  total,
  submitting = false,
  error = null,
  onConfirm,
}: AnularVentaSheetProps) {
  const [motivo, setMotivo] = useState<MotivoAnulacion | ''>('')
  const [textoOtro, setTextoOtro] = useState('')

  useEffect(() => {
    if (!open) {
      setMotivo('')
      setTextoOtro('')
    }
  }, [open])

  const esOtro = motivo === 'Otro'
  const motivoValido =
    motivo !== '' && (!esOtro || textoOtro.trim().length > 0)
  const canConfirm = motivoValido && !submitting

  const handleConfirm = () => {
    if (motivo === '' || !motivoValido) return
    onConfirm(motivo, esOtro ? textoOtro.trim() : undefined)
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      dismissible={!submitting}
      footer={
        <div className="flex gap-2.5">
          <Button
            variant="secondary"
            size="lg"
            className="flex-1"
            disabled={submitting}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            size="lg"
            className="flex-1"
            disabled={!canConfirm}
            loading={submitting}
            loadingLabel="Anulando…"
            onClick={handleConfirm}
          >
            Anular venta
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3 pb-1">
        <div className="flex flex-col items-center gap-2 pt-1 text-center">
          <Icon name="warning" size={40} className="text-peligro" />
          <h2 className="text-title-sm font-black text-tinta text-pretty">
            ¿Anular la venta {recibo}?
          </h2>
          <p className="text-body font-semibold text-tinta-suave text-pretty">
            Esta acción no se puede deshacer. La venta de {formatCOP(total)}{' '}
            dejará de sumar al total del día.
          </p>
        </div>

        <SegmentedControl
          variant="radio-list"
          aria-label="Motivo de anulación"
          options={MOTIVO_OPTIONS}
          value={motivo}
          onChange={(value) => setMotivo(value as MotivoAnulacion)}
        />

        {esOtro ? (
          <TextField
            label="Motivo"
            placeholder="Escribe el motivo"
            value={textoOtro}
            onChange={(e) => setTextoOtro(e.target.value)}
            autoFocus
          />
        ) : null}

        {error ? (
          <p
            role="alert"
            className="text-label font-bold text-peligro text-pretty"
          >
            {error}
          </p>
        ) : null}
      </div>
    </BottomSheet>
  )
}
