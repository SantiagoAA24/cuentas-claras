import { describe, expect, it } from 'vitest'
import { crearVentasSeed } from '../mocks/data'
import { resumenDia } from './resumenDia'

describe('resumenDia', () => {
  const ventas = crearVentasSeed()
  const resumen = resumenDia(ventas)

  it('excluye anuladas del total vendido', () => {
    // 9 ventas, 1 anulada (A-0039 = 21.000); total prototipo Historial
    expect(resumen.cantidadAnuladas).toBe(1)
    expect(resumen.cantidadVentas).toBe(8)
    expect(resumen.totalVendido).toBe(
      18000 + 9000 + 13000 + 15500 + 15000 + 13500 + 14000 + 19000,
    )
  })

  it('desglosa por medio de pago sin contar anuladas', () => {
    const porMedio = Object.fromEntries(
      resumen.desglose.map((d) => [d.medio, d]),
    )

    // Efectivo vigentes: 34(18000), 36(13000), 38(15000), 42(19000) — no 39
    expect(porMedio.Efectivo).toEqual({
      medio: 'Efectivo',
      cantidad: 4,
      monto: 18000 + 13000 + 15000 + 19000,
    })

    // Nequi: 35(9000), 41(14000)
    expect(porMedio.Nequi).toEqual({
      medio: 'Nequi',
      cantidad: 2,
      monto: 9000 + 14000,
    })

    // Daviplata: 40(13500)
    expect(porMedio.Daviplata).toEqual({
      medio: 'Daviplata',
      cantidad: 1,
      monto: 13500,
    })

    // Transferencia: 37(15500)
    expect(porMedio.Transferencia).toEqual({
      medio: 'Transferencia',
      cantidad: 1,
      monto: 15500,
    })
  })

  it('con lista vacía devuelve ceros', () => {
    expect(resumenDia([])).toEqual({
      totalVendido: 0,
      cantidadVentas: 0,
      cantidadAnuladas: 0,
      desglose: [
        { medio: 'Efectivo', cantidad: 0, monto: 0 },
        { medio: 'Nequi', cantidad: 0, monto: 0 },
        { medio: 'Daviplata', cantidad: 0, monto: 0 },
        { medio: 'Transferencia', cantidad: 0, monto: 0 },
      ],
    })
  })
})
