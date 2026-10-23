const ANCHO_MM = '58 mm'

/** Nombre con ancho de papel, p. ej. "PT-210 · 58 mm". */
export function etiquetaDispositivo(nombre: string): string {
  return `${nombre} · ${ANCHO_MM}`
}

export function etiquetaEstadoConectada(): string {
  return 'Conectada'
}

export function etiquetaEstadoDesconectada(): string {
  return 'Desconectada'
}

/** Texto bajo el estado cuando hay emparejada pero no hay enlace. */
export function etiquetaUltimaUsada(nombre: string): string {
  return `Última usada: ${etiquetaDispositivo(nombre)}`
}

export function etiquetaSinEmparejar(): string {
  return 'Sin impresora emparejada'
}

/** Subtítulo de filas en la lista de búsqueda. */
export function metaImpresoraTermica(): string {
  return `Impresora térmica · ${ANCHO_MM}`
}

/**
 * Línea de dispositivo en la tarjeta de Configuración.
 * Conectada → nombre; desconectada con emparejada → última usada; si no → vacío.
 */
export function lineaDispositivoConfig(opts: {
  connected: boolean
  nombreEmparejada: string | undefined
}): string {
  const { connected, nombreEmparejada } = opts
  if (connected && nombreEmparejada) {
    return etiquetaDispositivo(nombreEmparejada)
  }
  if (nombreEmparejada) {
    return etiquetaUltimaUsada(nombreEmparejada)
  }
  return etiquetaSinEmparejar()
}
