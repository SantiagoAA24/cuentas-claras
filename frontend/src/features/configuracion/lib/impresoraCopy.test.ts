import { describe, expect, it } from 'vitest'
import {
  etiquetaDispositivo,
  etiquetaEstadoConectada,
  etiquetaEstadoDesconectada,
  etiquetaSinEmparejar,
  etiquetaUltimaUsada,
  lineaDispositivoConfig,
  metaImpresoraTermica,
} from './impresoraCopy'

describe('impresoraCopy', () => {
  it('etiqueta dispositivo con ancho 58 mm', () => {
    expect(etiquetaDispositivo('PT-210')).toBe('PT-210 · 58 mm')
  })

  it('estados de conexión', () => {
    expect(etiquetaEstadoConectada()).toBe('Conectada')
    expect(etiquetaEstadoDesconectada()).toBe('Desconectada')
  })

  it('última usada y sin emparejar', () => {
    expect(etiquetaUltimaUsada('PT-210')).toBe('Última usada: PT-210 · 58 mm')
    expect(etiquetaSinEmparejar()).toBe('Sin impresora emparejada')
  })

  it('meta de lista de búsqueda', () => {
    expect(metaImpresoraTermica()).toBe('Impresora térmica · 58 mm')
  })

  describe('lineaDispositivoConfig', () => {
    it('conectada con nombre', () => {
      expect(
        lineaDispositivoConfig({
          connected: true,
          nombreEmparejada: 'PT-210',
        }),
      ).toBe('PT-210 · 58 mm')
    })

    it('desconectada con emparejada', () => {
      expect(
        lineaDispositivoConfig({
          connected: false,
          nombreEmparejada: 'PT-210',
        }),
      ).toBe('Última usada: PT-210 · 58 mm')
    })

    it('sin emparejar', () => {
      expect(
        lineaDispositivoConfig({
          connected: false,
          nombreEmparejada: undefined,
        }),
      ).toBe('Sin impresora emparejada')
    })
  })
})
