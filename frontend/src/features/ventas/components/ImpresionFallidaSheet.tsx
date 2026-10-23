import { BottomSheet } from '../../../components/ui/BottomSheet'
import { Button } from '../../../components/ui/Button'
import { Icon } from '../../../components/ui/Icon'
import { formatCOP } from '../../../lib/format'

type ImpresionFallidaSheetProps = {
  open: boolean
  recibo: string
  total: number
  retrying: boolean
  onReintentar: () => void
  onContinuar: () => void
}

/** Estado 9d: fallo de impresión encima de Venta exitosa. */
export function ImpresionFallidaSheet({
  open,
  recibo,
  total,
  retrying,
  onReintentar,
  onContinuar,
}: ImpresionFallidaSheetProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={() => undefined}
      dismissible={false}
      overlayClassName="z-[55]"
      className="z-[60]"
      footer={
        <div className="flex flex-col gap-2">
          <Button
            variant="primary"
            size="cta"
            fullWidth
            icon="refresh"
            loading={retrying}
            loadingLabel="Intentando…"
            onClick={onReintentar}
          >
            Reintentar
          </Button>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            disabled={retrying}
            onClick={onContinuar}
          >
            Continuar sin imprimir
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3.5 pb-1">
        <div className="flex items-start gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-peligro-fondo">
            <Icon name="print_disabled" size={28} className="text-peligro" />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="text-title font-black leading-snug text-tinta">
              No se pudo imprimir
            </h2>
            <p className="flex items-center gap-1 text-item font-bold text-exito">
              <Icon name="check_circle" size={20} />
              La venta quedó registrada.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border border-borde bg-crema px-3.5 py-3">
          <span className="font-mono text-body font-medium text-tinta">
            {recibo}
          </span>
          <span className="text-title-sm font-black tabular-nums text-tinta">
            {formatCOP(total)}
          </span>
        </div>

        <p className="text-caption font-semibold leading-snug text-tinta-suave">
          Revisa que la impresora esté encendida y cerca. Puedes reimprimir el
          recibo luego desde Historial.
        </p>
      </div>
    </BottomSheet>
  )
}
