import { describe, expect, it } from 'vitest'
import { etiquetaMotivoAnulacion } from './motivoAnulacion'

describe('etiquetaMotivoAnulacion', () => {
  it('devuelve el motivo fijo', () => {
    expect(
      etiquetaMotivoAnulacion({
        motivo: 'Producto equivocado',
        por: 'Laura',
        en: '2026-09-22T17:24:00.000Z',
      }),
    ).toBe('Producto equivocado')
  })

  it('usa el texto libre cuando es Otro', () => {
    expect(
      etiquetaMotivoAnulacion({
        motivo: 'Otro',
        texto: 'Se registró dos veces',
        por: 'Carlos',
        en: '2026-09-22T17:52:00.000Z',
      }),
    ).toBe('Se registró dos veces')
  })

  it('cae a Otro si el texto está vacío', () => {
    expect(
      etiquetaMotivoAnulacion({
        motivo: 'Otro',
        texto: '  ',
        por: 'Carlos',
        en: '2026-09-22T17:52:00.000Z',
      }),
    ).toBe('Otro')
  })
})
