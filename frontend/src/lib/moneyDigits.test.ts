import { describe, expect, it } from 'vitest'
import {
  amountToDigits,
  applyKeypadKey,
  digitsToAmount,
  formatDigitsWithDots,
  sanitizeDigits,
} from './moneyDigits'

describe('sanitizeDigits', () => {
  it('quita letras y deja solo dígitos', () => {
    expect(sanitizeDigits('abc12.3def')).toBe('123')
  })

  it('al pegar texto con letras y puntos de miles, normaliza', () => {
    expect(sanitizeDigits('$25.000 pesos')).toBe('25000')
  })

  it('elimina ceros a la izquierda', () => {
    expect(sanitizeDigits('007000')).toBe('7000')
    expect(sanitizeDigits('000')).toBe('')
  })

  it('respeta el máximo de 7 dígitos', () => {
    expect(sanitizeDigits('1234567890')).toBe('1234567')
  })

  it('acepta maxLength personalizado', () => {
    expect(sanitizeDigits('12345', 3)).toBe('123')
  })
})

describe('formatDigitsWithDots', () => {
  it('formatea con puntos de miles mientras se escribe', () => {
    expect(formatDigitsWithDots('1')).toBe('1')
    expect(formatDigitsWithDots('25')).toBe('25')
    expect(formatDigitsWithDots('250')).toBe('250')
    expect(formatDigitsWithDots('2500')).toBe('2.500')
    expect(formatDigitsWithDots('25000')).toBe('25.000')
    expect(formatDigitsWithDots('1250000')).toBe('1.250.000')
  })

  it('cadena vacía queda vacía', () => {
    expect(formatDigitsWithDots('')).toBe('')
  })
})

describe('digitsToAmount / amountToDigits', () => {
  it('convierte dígitos a entero o null', () => {
    expect(digitsToAmount('')).toBeNull()
    expect(digitsToAmount('25000')).toBe(25000)
    expect(digitsToAmount('7')).toBe(7)
  })

  it('nunca produce flotantes', () => {
    const n = digitsToAmount('1999')
    expect(Number.isInteger(n)).toBe(true)
  })

  it('amountToDigits: null y 0 → vacío', () => {
    expect(amountToDigits(null)).toBe('')
    expect(amountToDigits(0)).toBe('')
  })

  it('amountToDigits trunca y usa valor absoluto', () => {
    expect(amountToDigits(7000)).toBe('7000')
    expect(amountToDigits(7000.9)).toBe('7000')
  })
})

describe('applyKeypadKey', () => {
  it('escribe dígitos 1–9 y 0', () => {
    expect(applyKeypadKey('', '2')).toBe('2')
    expect(applyKeypadKey('2', '5')).toBe('25')
    expect(applyKeypadKey('25', '0')).toBe('250')
  })

  it('escribir 000 sobre vacío no deja ceros', () => {
    expect(applyKeypadKey('', '000')).toBe('')
  })

  it('000 después de un dígito agrega tres ceros', () => {
    expect(applyKeypadKey('2', '000')).toBe('2000')
  })

  it('borra el último dígito', () => {
    expect(applyKeypadKey('25000', 'back')).toBe('2500')
    expect(applyKeypadKey('2', 'back')).toBe('')
    expect(applyKeypadKey('', 'back')).toBe('')
  })

  it('no excede el máximo al pulsar un dígito', () => {
    expect(applyKeypadKey('1234567', '8')).toBe('1234567')
    expect(applyKeypadKey('1234567', '000')).toBe('1234567')
  })

  it('recorta si 000 empujaría más allá del máximo', () => {
    expect(applyKeypadKey('123456', '000')).toBe('1234560')
    expect(applyKeypadKey('12345', '000')).toBe('1234500')
  })

  it('0 solo sobre vacío queda vacío (sin ceros a la izquierda)', () => {
    expect(applyKeypadKey('', '0')).toBe('')
  })
})
