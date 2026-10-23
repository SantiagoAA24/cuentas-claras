import {
  bluetoothDisponible,
  MOCK_DEVICES,
  requestBluetoothDevice,
} from './bluetooth'
import { getImpresoraEstado, useImpresoraStore } from './store'
import type {
  BusquedaHandle,
  ImpresoraDispositivo,
  ImpresoraEncontrada,
} from './types'

export type BusquedaOptions = {
  onDevices: (devices: ImpresoraEncontrada[]) => void
  /**
   * Con Web Bluetooth: el usuario eligió en el selector nativo.
   * La página debe conectar, persistir y pasar a 6e.
   */
  onDevicePicked?: (device: ImpresoraDispositivo) => void
}

const MOCK_DELAY_MS = 700

let busquedaActiva: { cancelled: boolean } | null = null
let inicializado = false

/**
 * Si hay impresora emparejada en config, marca conexión
 * (reconexión al abrir la app). Sin GATT persistente real aún.
 */
export function initImpresoraFromConfig(
  impresora: ImpresoraDispositivo | undefined,
): void {
  if (inicializado) return
  inicializado = true
  if (impresora) {
    useImpresoraStore.getState().setConnected(true, impresora)
  }
}

/**
 * Inicia búsqueda. Con Web Bluetooth abre el selector nativo.
 * Sin BT, rellena una lista mock tras un breve delay.
 */
export function iniciarBusqueda(options: BusquedaOptions): BusquedaHandle {
  const { onDevices, onDevicePicked } = options
  cancelarBusqueda()
  const ctx = { cancelled: false }
  busquedaActiva = ctx
  onDevices([])

  if (bluetoothDisponible()) {
    void (async () => {
      try {
        const device = await requestBluetoothDevice()
        if (ctx.cancelled || busquedaActiva !== ctx) return
        if (device) {
          onDevices([
            {
              ...device,
              meta: 'Impresora térmica · 58 mm',
            },
          ])
          onDevicePicked?.(device)
        } else {
          onDevices([])
        }
      } catch {
        if (!ctx.cancelled) onDevices([])
      }
    })()

    return {
      cancel: () => {
        ctx.cancelled = true
        if (busquedaActiva === ctx) busquedaActiva = null
      },
    }
  }

  const timer = setTimeout(() => {
    if (ctx.cancelled || busquedaActiva !== ctx) return
    onDevices([...MOCK_DEVICES])
  }, MOCK_DELAY_MS)

  return {
    cancel: () => {
      ctx.cancelled = true
      if (busquedaActiva === ctx) busquedaActiva = null
      clearTimeout(timer)
    },
  }
}

export function cancelarBusqueda(): void {
  if (busquedaActiva) {
    busquedaActiva.cancelled = true
    busquedaActiva = null
  }
}

export async function conectarDispositivo(
  device: ImpresoraDispositivo,
): Promise<void> {
  cancelarBusqueda()
  await delay(350)
  useImpresoraStore.getState().setConnected(true, device)
}

/**
 * Imprime un ticket de prueba mínimo.
 * Sin GATT real: resuelve OK si está conectada; falla si no.
 */
export async function imprimirPrueba(): Promise<void> {
  const { connected } = getImpresoraEstado()
  if (!connected) {
    throw new Error('La impresora no está conectada')
  }
  await delay(400)
  // TODO: escribir bytes ESC/POS por Web Bluetooth GATT
}

/**
 * Imprime el recibo de una venta.
 * Stub: OK si la impresora está conectada; falla si no.
 */
export async function imprimirVenta(_venta: {
  recibo: string
  total: number
}): Promise<void> {
  const { connected } = getImpresoraEstado()
  if (!connected) {
    throw new Error('La impresora no está conectada')
  }
  await delay(400)
  // TODO: generar ESC/POS con build() del recibo y escribir por GATT
}

export function desconectarImpresora(): void {
  useImpresoraStore.getState().disconnect()
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
