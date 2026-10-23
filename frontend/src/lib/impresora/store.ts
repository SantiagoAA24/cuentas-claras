import { create } from 'zustand'
import type { ImpresoraDispositivo, ImpresoraEstado } from './types'

type ImpresoraStore = ImpresoraEstado & {
  setConnected: (connected: boolean, device?: ImpresoraDispositivo | null) => void
  setDevice: (device: ImpresoraDispositivo | null) => void
  disconnect: () => void
}

export const useImpresoraStore = create<ImpresoraStore>((set) => ({
  connected: false,
  device: null,

  setConnected(connected, device) {
    set((state) => ({
      connected,
      device: device !== undefined ? device : state.device,
    }))
  },

  setDevice(device) {
    set({ device })
  },

  disconnect() {
    set({ connected: false })
  },
}))

export function getImpresoraEstado(): ImpresoraEstado {
  const { connected, device } = useImpresoraStore.getState()
  return { connected, device }
}
