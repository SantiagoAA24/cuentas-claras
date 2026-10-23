import { describe, expect, it } from 'vitest'
import type { Producto } from '../../../domain/types'
import { filtrarProductos, metaProducto } from './filtrarProductos'

const BASE: Producto[] = [
  {
    id: '1',
    nombre: 'Arepa de queso',
    precio: 5000,
    categoria: 'Arepas',
    activo: true,
  },
  {
    id: '2',
    nombre: 'Gaseosa',
    precio: 3000,
    categoria: 'Bebidas',
    activo: true,
  },
  {
    id: '3',
    nombre: 'Chocolate',
    precio: 3000,
    categoria: 'Bebidas',
    activo: false,
  },
]

describe('filtrarProductos', () => {
  it('devuelve todos con Todas y query vacía', () => {
    expect(
      filtrarProductos(BASE, { categoria: 'Todas', query: '' }),
    ).toHaveLength(3)
  })

  it('filtra por categoría', () => {
    const result = filtrarProductos(BASE, {
      categoria: 'Bebidas',
      query: '',
    })
    expect(result.map((p) => p.id)).toEqual(['2', '3'])
  })

  it('filtra por nombre sin importar mayúsculas', () => {
    const result = filtrarProductos(BASE, {
      categoria: 'Todas',
      query: '  AREPA  ',
    })
    expect(result.map((p) => p.id)).toEqual(['1'])
  })

  it('combina categoría y búsqueda', () => {
    const result = filtrarProductos(BASE, {
      categoria: 'Bebidas',
      query: 'cho',
    })
    expect(result.map((p) => p.id)).toEqual(['3'])
  })
})

describe('metaProducto', () => {
  it('muestra solo la categoría si está activo', () => {
    expect(metaProducto(BASE[0]!)).toBe('Arepas')
  })

  it('añade el aviso de inactivo', () => {
    expect(metaProducto(BASE[2]!)).toBe(
      'Bebidas · Inactivo · no aparece en Vender',
    )
  })
})
