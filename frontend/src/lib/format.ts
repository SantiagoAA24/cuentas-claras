const DIAS = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
] as const

const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const

/** Moneda COP: "$12.500" — punto de miles, sin decimales. */
export function formatCOP(n: number): string {
  return '$' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/** Hora en español de Colombia: "12:46 p. m." */
export function formatHora(fecha: Date): string {
  let horas = fecha.getHours()
  const minutos = fecha.getMinutes()
  const periodo = horas < 12 ? 'a. m.' : 'p. m.'
  horas = horas % 12
  if (horas === 0) horas = 12
  return `${horas}:${String(minutos).padStart(2, '0')} ${periodo}`
}

/** Fecha larga: "martes 22 de septiembre" */
export function formatFechaLarga(fecha: Date): string {
  return `${DIAS[fecha.getDay()]} ${fecha.getDate()} de ${MESES[fecha.getMonth()]}`
}

/** Recibo: prefijo + consecutivo de 4 dígitos → "A-0042" */
export function formatRecibo(prefijo: string, consecutivo: number): string {
  return `${prefijo}-${String(consecutivo).padStart(4, '0')}`
}
