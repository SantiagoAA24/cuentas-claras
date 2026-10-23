import { Icon } from '../../../components/ui/Icon'
import type { ImpresoraEncontrada } from '../../../lib/impresora'

type DispositivoEncontradoRowProps = {
  device: ImpresoraEncontrada
  onConectar: (device: ImpresoraEncontrada) => void
  connecting?: boolean
}

/** Fila de impresora encontrada con pill Conectar. */
export function DispositivoEncontradoRow({
  device,
  onConectar,
  connecting = false,
}: DispositivoEncontradoRowProps) {
  return (
    <button
      type="button"
      disabled={connecting}
      onClick={() => onConectar(device)}
      className="flex min-h-touch-lg w-full items-center gap-3 border-b border-borde bg-superficie px-3.5 py-2 text-left enabled:active:bg-crema disabled:opacity-60"
    >
      <Icon name="print" size={26} className="shrink-0 text-tostado-500" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-item font-extrabold text-tinta">
          {device.nombre}
        </span>
        <span className="text-caption font-bold text-tinta-suave">
          {device.meta}
        </span>
      </span>
      <span className="flex h-10 shrink-0 items-center rounded-md bg-maiz-500 px-3.5 text-label font-black text-tinta">
        Conectar
      </span>
    </button>
  )
}
