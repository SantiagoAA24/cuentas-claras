import { Card, SectionTitle } from '../../../components/ui/Card'
import type { Configuracion } from '../../../domain/types'
import { formatearRecibo } from '../../../domain/recibo'
import {
  getPersistenciaEstado,
  type PersistenciaEstado,
} from '../../../lib/db'

type ConfigDispositivoSectionProps = {
  dispositivo: Configuracion['dispositivo']
}

function etiquetaPersistencia(estado: PersistenciaEstado): string {
  switch (estado) {
    case 'protegido':
      return 'Protegido'
    case 'no_garantizado':
      return 'No garantizado'
    default:
      return 'Desconocido'
  }
}

/** Prefijo, último recibo y estado de almacenamiento persistente (solo lectura). */
export function ConfigDispositivoSection({
  dispositivo,
}: ConfigDispositivoSectionProps) {
  const ultimo = formatearRecibo(
    dispositivo.prefijo,
    dispositivo.ultimoConsecutivo,
  )
  const persistencia = etiquetaPersistencia(getPersistenciaEstado())

  return (
    <section className="flex flex-col gap-2.5">
      <SectionTitle>Dispositivo</SectionTitle>
      <Card padding="none">
        <div className="flex items-center gap-3 border-b border-borde px-4 py-3">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-body font-extrabold text-tinta">
              Prefijo del consecutivo
            </span>
            <span className="text-caption font-bold text-pretty text-tinta-suave">
              Asignado a este celular para que los recibos no se repitan con el
              otro.
            </span>
          </div>
          <span
            aria-label={`Prefijo ${dispositivo.prefijo}`}
            className="flex size-touch shrink-0 items-center justify-center rounded-lg border-2 border-maiz-500 bg-maiz-50 font-mono text-money font-medium text-tinta"
          >
            {dispositivo.prefijo}
          </span>
        </div>
        <div className="flex min-h-touch-lg items-center justify-between gap-3 border-b border-borde px-4">
          <span className="text-body font-extrabold text-tinta">
            Último recibo emitido
          </span>
          <span className="font-mono text-body-lg font-medium tabular-nums text-tinta">
            {ultimo}
          </span>
        </div>
        <div className="flex min-h-touch-lg items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5 py-2">
            <span className="text-body font-extrabold text-tinta">
              Almacenamiento persistente
            </span>
            <span className="text-caption font-bold text-pretty text-tinta-suave">
              Reduce el riesgo de que el navegador borre los datos si el
              celular tiene poco espacio.
            </span>
          </div>
          <span className="shrink-0 text-body font-medium text-tinta">
            {persistencia}
          </span>
        </div>
      </Card>
    </section>
  )
}
