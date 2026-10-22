/** Prefijo + consecutivo de 4 dígitos → "A-0042" */
export function formatearRecibo(prefijo: string, consecutivo: number): string {
  return `${prefijo}-${String(consecutivo).padStart(4, '0')}`
}
