import { describe, expect, it } from 'vitest'
import {
  ERROR_NOMBRE_OBLIGATORIO,
  ERROR_PRECIO_MAYOR_CERO,
  productoFormEsValido,
  validarProductoForm,
} from './validarProductoForm'

describe('validarProductoForm', () => {
  it('exige nombre y precio > 0', () => {
    expect(validarProductoForm({ nombre: '', precio: null })).toEqual({
      nombre: ERROR_NOMBRE_OBLIGATORIO,
      precio: ERROR_PRECIO_MAYOR_CERO,
    })
  })

  it('rechaza nombre solo con espacios', () => {
    expect(validarProductoForm({ nombre: '  ', precio: 5000 })).toEqual({
      nombre: ERROR_NOMBRE_OBLIGATORIO,
    })
  })

  it('rechaza precio 0', () => {
    expect(
      validarProductoForm({ nombre: 'Arepa', precio: 0 }),
    ).toEqual({
      precio: ERROR_PRECIO_MAYOR_CERO,
    })
  })

  it('acepta valores válidos', () => {
    const errors = validarProductoForm({
      nombre: ' Arepa de huevo ',
      precio: 7000,
    })
    expect(errors).toEqual({})
    expect(productoFormEsValido(errors)).toBe(true)
  })
})
