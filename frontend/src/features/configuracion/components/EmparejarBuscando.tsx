import { useEffect, useState } from 'react'
import { BottomActionBar } from '../../../components/ui/BottomActionBar'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Icon } from '../../../components/ui/Icon'
import type { ImpresoraEncontrada } from '../../../lib/impresora'
import { DispositivoEncontradoRow } from './DispositivoEncontradoRow'

type EmparejarBuscandoProps = {
  devices: ImpresoraEncontrada[]
  connectingId: string | null
  onConectar: (device: ImpresoraEncontrada) => void
  onCancelar: () => void
}

const EMPTY_AFTER_MS = 2500

/** Emparejar · 6d buscando. */
export function EmparejarBuscando({
  devices,
  connectingId,
  onConectar,
  onCancelar,
}: EmparejarBuscandoProps) {
  const [showEmpty, setShowEmpty] = useState(false)

  useEffect(() => {
    if (devices.length > 0) {
      setShowEmpty(false)
      return
    }
    const timer = setTimeout(() => setShowEmpty(true), EMPTY_AFTER_MS)
    return () => clearTimeout(timer)
  }, [devices])

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex flex-1 flex-col gap-5 px-gutter pt-4 pb-4">
        <div className="flex flex-col items-center gap-3 pt-2 text-center">
          <div className="relative flex size-44 items-center justify-center">
            <span
              aria-hidden
              className="absolute inset-0 rounded-full border-2 border-maiz-500/30 animate-ping"
            />
            <span
              aria-hidden
              className="absolute size-32 rounded-full border-2 border-maiz-500/40"
            />
            <span
              aria-hidden
              className="relative flex size-fab items-center justify-center rounded-full bg-maiz-500 shadow-raised"
            >
              <Icon
                name="bluetooth_searching"
                size={44}
                className="text-tinta"
              />
            </span>
          </div>
          <h2 className="text-title font-black text-tinta">
            Buscando impresoras…
          </h2>
          <p className="text-body font-semibold text-tinta-suave">
            Toca la tuya para conectarla.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-label font-extrabold text-tostado-700">
            Encontradas
          </span>
          <Card padding="none" className="overflow-hidden">
            {devices.map((d) => (
              <DispositivoEncontradoRow
                key={d.id}
                device={d}
                connecting={connectingId === d.id}
                onConectar={onConectar}
              />
            ))}
            {devices.length === 0 && showEmpty ? (
              <EmptyState
                icon="bluetooth_searching"
                title="No se encontraron impresoras"
                description="Asegúrate de que esté encendida y cerca. Puedes cancelar e intentar de nuevo."
                className="py-8"
              />
            ) : null}
            <div className="flex min-h-touch items-center gap-2.5 px-3.5 text-label font-bold text-tinta-suave">
              <span
                aria-hidden
                className="size-knob shrink-0 animate-spin rounded-full border-2 border-borde-fuerte border-t-tostado-500"
              />
              Buscando más dispositivos
            </div>
          </Card>
        </div>
      </div>

      <BottomActionBar className="sticky bottom-0">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          fullWidth
          onClick={onCancelar}
        >
          Cancelar
        </Button>
      </BottomActionBar>
    </div>
  )
}
