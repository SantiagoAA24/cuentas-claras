import { describe, expect, it } from 'vitest'
import { formatCOP, formatFechaLarga, formatHora, formatRecibo } from './format'

describe('formatCOP', () => {
  it('formatea con punto de miles y sin decimales', () => {
    expect(formatCOP(12500)).toBe('$12.500')
  })

  it('maneja 0', () => {
    expect(formatCOP(0)).toBe('$0')
  })

  it('maneja millones', () => {
    expect(formatCOP(1_250_000)).toBe('$1.250.000')
  })

  it('redondea decimales', () => {
    expect(formatCOP(12500.4)).toBe('$12.500')
    expect(formatCOP(12500.6)).toBe('$12.501')
  })

  it('maneja valores negativos', () => {
    expect(formatCOP(-3500)).toBe('$-3.500')
  })
})

describe('formatHora', () => {
  it('formatea la tarde con p. m.', () => {
    expect(formatHora(new Date(2026, 8, 22, 12, 46))).toBe('12:46 p. m.')
  })

  it('formatea la mañana con a. m.', () => {
    expect(formatHora(new Date(2026, 8, 22, 9, 5))).toBe('9:05 a. m.')
  })

  it('maneja medianoche', () => {
    expect(formatHora(new Date(2026, 8, 22, 0, 0))).toBe('12:00 a. m.')
  })

  it('maneja mediodía', () => {
    expect(formatHora(new Date(2026, 8, 22, 12, 0))).toBe('12:00 p. m.')
  })
})

describe('formatFechaLarga', () => {
  it('formatea día, número y mes', () => {
    expect(formatFechaLarga(new Date(2026, 8, 22))).toBe('martes 22 de septiembre')
  })

  it('incluye acentos en miércoles y sábado', () => {
    expect(formatFechaLarga(new Date(2026, 8, 23))).toBe('miércoles 23 de septiembre')
    expect(formatFechaLarga(new Date(2026, 8, 26))).toBe('sábado 26 de septiembre')
  })
})

describe('formatRecibo', () => {
  it('rellena el consecutivo a 4 dígitos', () => {
    expect(formatRecibo('A', 42)).toBe('A-0042')
  })

  it('maneja consecutivo 0', () => {
    expect(formatRecibo('A', 0)).toBe('A-0000')
  })

  it('no trunca consecutivos de más de 4 dígitos', () => {
    expect(formatRecibo('B', 10042)).toBe('B-10042')
  })
})
