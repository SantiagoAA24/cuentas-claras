export type ImpresoraDispositivo = {
  id: string
  nombre: string
}

export type ImpresoraEncontrada = ImpresoraDispositivo & {
  /** Subtítulo de lista, p. ej. "Impresora térmica · 58 mm". */
  meta: string
}

export type ImpresoraEstado = {
  connected: boolean
  device: ImpresoraDispositivo | null
}

export type BusquedaHandle = {
  /** Cancela la búsqueda en curso (mock o diálogo nativo). */
  cancel: () => void
}
