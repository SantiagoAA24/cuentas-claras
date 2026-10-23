import type { ResumenDia } from '../../../domain/types'

function plural(n: number, singular: string, pluralForm: string): string {
  return `${n} ${n === 1 ? singular : pluralForm}`
}

/** Etiqueta de conteos del resumen: "8 ventas · 1 anulada (no suman)". */
export function resumenConteoLabel(resumen: ResumenDia): string {
  let label = plural(resumen.cantidadVentas, 'venta', 'ventas')
  if (resumen.cantidadAnuladas > 0) {
    label +=
      ' · ' +
      plural(resumen.cantidadAnuladas, 'anulada', 'anuladas') +
      ' (no suman)'
  }
  return label
}

/** Resumen corto de ítems: "2 Arepa de queso, 1 Gaseosa". */
export function resumenItemsLabel(
  items: { cantidad: number; nombre: string }[],
): string {
  return items.map((i) => `${i.cantidad} ${i.nombre}`).join(', ')
}

/** Contador de desglose: "4 ventas". */
export function desgloseCantidadLabel(cantidad: number): string {
  return plural(cantidad, 'venta', 'ventas')
}
