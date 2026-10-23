import { describe, expect, it } from 'vitest'
import {
  desgloseCantidadLabel,
  resumenConteoLabel,
  resumenItemsLabel,
} from './resumenLabel'

describe('resumenConteoLabel', () => {
  it('solo ventas vigentes', () => {
    expect(
      resumenConteoLabel({
        totalVendido: 10000,
        cantidadVentas: 8,
        cantidadAnuladas: 0,
        desglose: [],
      }),
    ).toBe('8 ventas')
  })

  it('incluye anuladas cuando hay', () => {
    expect(
      resumenConteoLabel({
        totalVendido: 10000,
        cantidadVentas: 8,
        cantidadAnuladas: 1,
        desglose: [],
      }),
    ).toBe('8 ventas · 1 anulada (no suman)')
  })

  it('pluraliza anuladas', () => {
    expect(
      resumenConteoLabel({
        totalVendido: 0,
        cantidadVentas: 1,
        cantidadAnuladas: 2,
        desglose: [],
      }),
    ).toBe('1 venta · 2 anuladas (no suman)')
  })
})

describe('resumenItemsLabel', () => {
  it('une cantidad y nombre con comas', () => {
    expect(
      resumenItemsLabel([
        { cantidad: 2, nombre: 'Arepa de queso' },
        { cantidad: 1, nombre: 'Gaseosa' },
      ]),
    ).toBe('2 Arepa de queso, 1 Gaseosa')
  })
})

describe('desgloseCantidadLabel', () => {
  it('pluraliza ventas', () => {
    expect(desgloseCantidadLabel(1)).toBe('1 venta')
    expect(desgloseCantidadLabel(4)).toBe('4 ventas')
  })
})
