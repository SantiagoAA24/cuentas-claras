import type { MedioPago, ResumenDia, Venta } from './types'

const MEDIOS: MedioPago[] = ['Efectivo', 'Nequi', 'Daviplata', 'Transferencia']

/** Totales del día: las anuladas no suman al total ni al desglose. */
export function resumenDia(ventas: Venta[]): ResumenDia {
  const vigentes = ventas.filter((v) => !v.anulada)
  const cantidadAnuladas = ventas.length - vigentes.length

  const desglose = MEDIOS.map((medio) => {
    const delMedio = vigentes.filter((v) => v.medioPago === medio)
    return {
      medio,
      cantidad: delMedio.length,
      monto: delMedio.reduce((acc, v) => acc + v.total, 0),
    }
  })

  return {
    totalVendido: vigentes.reduce((acc, v) => acc + v.total, 0),
    cantidadVentas: vigentes.length,
    cantidadAnuladas,
    desglose,
  }
}
