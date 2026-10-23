import { BottomActionBar } from '../../../components/ui/BottomActionBar'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Icon } from '../../../components/ui/Icon'
import { SuccessMark } from '../../../components/ui/SuccessMark'
import { etiquetaDispositivo, etiquetaEstadoConectada } from '../lib/impresoraCopy'

type EmparejarConectadaProps = {
  nombre: string
  onImprimirPrueba: () => void
  onListo: () => void
  imprimiendo?: boolean
}

/** Emparejar · 6e conectada. */
export function EmparejarConectada({
  nombre,
  onImprimirPrueba,
  onListo,
  imprimiendo = false,
}: EmparejarConectadaProps) {
  return (
    <div className="flex min-h-full flex-col">
      <div className="flex flex-1 flex-col gap-5 px-gutter pt-10 pb-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <SuccessMark />
          <h2 className="mt-4 text-title-lg font-black text-tinta">
            Impresora conectada
          </h2>
          <p className="max-w-[280px] text-body font-semibold text-pretty text-tinta-suave">
            Los recibos se imprimirán en esta impresora. Se reconectará sola la
            próxima vez.
          </p>
        </div>

        <Card className="flex items-center gap-3 py-3.5">
          <span
            aria-hidden
            className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-exito-fondo"
          >
            <Icon name="print_connect" size={26} className="text-exito" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-item font-extrabold text-tinta">
              {etiquetaDispositivo(nombre)}
            </span>
            <span className="text-caption font-extrabold text-exito">
              {etiquetaEstadoConectada()}
            </span>
          </div>
        </Card>
      </div>

      <BottomActionBar className="sticky bottom-0">
        <div className="flex w-full flex-col gap-2">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            fullWidth
            icon="receipt"
            loading={imprimiendo}
            loadingLabel="Imprimiendo…"
            onClick={onImprimirPrueba}
          >
            Imprimir prueba
          </Button>
          <Button
            type="button"
            variant="primary"
            size="cta"
            fullWidth
            onClick={onListo}
          >
            Listo
          </Button>
        </div>
      </BottomActionBar>
    </div>
  )
}
