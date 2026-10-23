import type { ImpresoraDispositivo, ImpresoraEncontrada } from './types'

/** Servicio GATT común en impresoras ESC/POS BLE (no todos lo exponen). */
const ESC_POS_SERVICE = '000018f0-0000-1000-8000-00805f9b34fb'

/** Subconjunto mínimo de Web Bluetooth tipado a mano (no hay @types oficiales). */
type BluetoothNavigator = Navigator & {
  bluetooth: {
    requestDevice: (options: {
      acceptAllDevices?: boolean
      optionalServices?: string[]
    }) => Promise<{ id: string; name?: string }>
  }
}

function getBluetoothNavigator(): BluetoothNavigator | null {
  if (typeof navigator === 'undefined') return null
  if (!('bluetooth' in navigator)) return null
  return navigator as BluetoothNavigator
}

export function bluetoothDisponible(): boolean {
  return getBluetoothNavigator() != null
}

/**
 * Abre el selector nativo de Web Bluetooth.
 * Devuelve null si el usuario cancela.
 */
export async function requestBluetoothDevice(): Promise<ImpresoraDispositivo | null> {
  const nav = getBluetoothNavigator()
  if (!nav) {
    throw new Error('Web Bluetooth no está disponible en este navegador')
  }

  try {
    const device = await nav.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [ESC_POS_SERVICE],
    })
    return {
      id: device.id,
      nombre: device.name?.trim() || 'Impresora Bluetooth',
    }
  } catch (err) {
    if (
      err instanceof DOMException &&
      (err.name === 'NotFoundError' || err.name === 'AbortError')
    ) {
      return null
    }
    throw err
  }
}

/** Dispositivos simulados para entornos sin Web Bluetooth (dev local). */
export const MOCK_DEVICES: ImpresoraEncontrada[] = [
  {
    id: 'mock-pt-210',
    nombre: 'PT-210',
    meta: 'Impresora térmica · 58 mm',
  },
  {
    id: 'mock-mtp-ii',
    nombre: 'MTP-II',
    meta: 'Impresora térmica · 58 mm',
  },
]
