const DEFAULT_MAX = 7

/**
 * Solo dígitos, sin ceros a la izquierda, acotado a `maxLength`.
 * Útil al pegar o al escribir en MoneyField.
 */
export function sanitizeDigits(
  raw: string,
  maxLength: number = DEFAULT_MAX,
): string {
  return raw.replace(/\D/g, '').replace(/^0+/, '').slice(0, maxLength)
}

/** "25000" → "25.000"; cadena vacía → "". */
export function formatDigitsWithDots(digits: string): string {
  if (digits === '') return ''
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/** Digitos → entero o null si vacío. Nunca produce flotantes. */
export function digitsToAmount(digits: string): number | null {
  if (digits === '') return null
  return Number.parseInt(digits, 10)
}

/** Valor controlado → cadena de dígitos (sin puntos). null y 0 → "". */
export function amountToDigits(value: number | null): string {
  if (value == null || value === 0) return ''
  return String(Math.trunc(Math.abs(value)))
}

export type KeypadKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '000' | 'back'

/**
 * Aplica una tecla del NumericKeypad sobre la cadena de dígitos actual.
 * Misma regla que el prototipo: append + quitar ceros a la izquierda + tope.
 */
export function applyKeypadKey(
  current: string,
  key: KeypadKey,
  maxLength: number = DEFAULT_MAX,
): string {
  if (key === 'back') return current.slice(0, -1)
  if (current.length >= maxLength) return current
  return (current + key).replace(/^0+/, '').slice(0, maxLength)
}
