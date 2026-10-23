import { BottomActionBar } from '../../../components/ui/BottomActionBar'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Icon } from '../../../components/ui/Icon'
import { EMPAREJAR_PASOS } from '../lib/emparejarFases'

type EmparejarInstruccionesProps = {
  onBuscar: () => void
}

/** Emparejar · 6c instrucciones. */
export function EmparejarInstrucciones({
  onBuscar,
}: EmparejarInstruccionesProps) {
  return (
    <div className="flex min-h-full flex-col">
      <div className="flex flex-1 flex-col gap-5 px-gutter pt-6 pb-4">
        <div className="flex flex-col items-center gap-3.5 pt-4 text-center">
          <span
            aria-hidden
            className="flex size-36 items-center justify-center rounded-full bg-maiz-100"
          >
            <Icon name="print" size={68} className="text-tostado-500" />
          </span>
          <h2 className="mt-1.5 text-title font-black text-pretty text-tinta">
            Enciende la impresora y mantenla cerca
          </h2>
        </div>

        <Card padding="none">
          {EMPAREJAR_PASOS.map((text, i) => (
            <div
              key={text}
              className="flex min-h-cta items-center gap-3 border-b border-borde px-4 last:border-b-0"
            >
              <span
                aria-hidden
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-maiz-500 text-body font-black text-tinta"
              >
                {i + 1}
              </span>
              <span className="py-2 text-item font-bold leading-snug text-tinta">
                {text}
              </span>
            </div>
          ))}
        </Card>
      </div>

      <BottomActionBar className="sticky bottom-0">
        <Button
          type="button"
          variant="primary"
          size="cta"
          fullWidth
          icon="bluetooth_searching"
          onClick={onBuscar}
        >
          Buscar impresora
        </Button>
      </BottomActionBar>
    </div>
  )
}
