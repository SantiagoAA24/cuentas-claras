import { Card, SectionTitle } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Icon } from '../../../components/ui/Icon'
import {
  etiquetaEstadoConectada,
  etiquetaEstadoDesconectada,
  lineaDispositivoConfig,
} from '../lib/impresoraCopy'

type ConfigImpresoraSectionProps = {
  connected: boolean
  nombreEmparejada: string | undefined
  onBuscar: () => void
  onImprimirPrueba: () => void
  imprimiendo?: boolean
}

/** Sección Impresora · estados 6a (conectada) / 6b (desconectada). */
export function ConfigImpresoraSection({
  connected,
  nombreEmparejada,
  onBuscar,
  onImprimirPrueba,
  imprimiendo = false,
}: ConfigImpresoraSectionProps) {
  const statusLabel = connected
    ? etiquetaEstadoConectada()
    : etiquetaEstadoDesconectada()
  const deviceLine = lineaDispositivoConfig({
    connected,
    nombreEmparejada,
  })

  return (
    <section className="flex flex-col gap-2.5">
      <SectionTitle>Impresora</SectionTitle>
      <Card className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className={
              connected
                ? 'flex size-touch shrink-0 items-center justify-center rounded-lg bg-exito-fondo'
                : 'flex size-touch shrink-0 items-center justify-center rounded-lg bg-peligro-fondo'
            }
          >
            <Icon
              name={connected ? 'print_connect' : 'print_disabled'}
              size={28}
              className={connected ? 'text-exito' : 'text-peligro'}
            />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span
              className={
                connected
                  ? 'text-body-lg font-black text-exito'
                  : 'text-body-lg font-black text-peligro'
              }
            >
              {statusLabel}
            </span>
            <span className="text-label font-bold text-tinta">{deviceLine}</span>
          </div>
        </div>

        <Button
          type="button"
          variant={connected ? 'secondary' : 'primary'}
          size="lg"
          fullWidth
          icon="bluetooth_searching"
          onClick={onBuscar}
        >
          Buscar impresora
        </Button>

        <Button
          type="button"
          variant="tonal"
          size="lg"
          fullWidth
          icon="receipt"
          disabled={!connected}
          loading={imprimiendo}
          loadingLabel="Imprimiendo…"
          onClick={onImprimirPrueba}
        >
          Imprimir prueba
        </Button>
      </Card>
    </section>
  )
}
