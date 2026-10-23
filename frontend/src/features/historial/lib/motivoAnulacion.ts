import type { Anulacion, MotivoAnulacion } from '../../../domain/types'

export const MOTIVOS_ANULACION: MotivoAnulacion[] = [
  'Error al registrar',
  'Cliente canceló',
  'Producto equivocado',
  'Otro',
]

/** Texto visible del motivo en el banner 4c (Otro → texto libre). */
export function etiquetaMotivoAnulacion(anulada: Anulacion): string {
  if (anulada.motivo === 'Otro') {
    return anulada.texto?.trim() || 'Otro'
  }
  return anulada.motivo
}
