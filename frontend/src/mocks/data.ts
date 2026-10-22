import type { Configuracion, Producto, Venta } from '../domain/types'

/** IDs estables para enlazar ítems de venta con el catálogo. */
export const PRODUCTO_IDS = {
  queso: '11111111-1111-4111-8111-111111111001',
  carne: '11111111-1111-4111-8111-111111111002',
  huevo: '11111111-1111-4111-8111-111111111003',
  mixta: '11111111-1111-4111-8111-111111111004',
  choclo: '11111111-1111-4111-8111-111111111005',
  gaseosa: '11111111-1111-4111-8111-111111111006',
  jugo: '11111111-1111-4111-8111-111111111007',
  cafe: '11111111-1111-4111-8111-111111111008',
  chocolate: '11111111-1111-4111-8111-111111111009',
  quesoExtra: '11111111-1111-4111-8111-111111111010',
} as const

export const PRODUCTOS_SEED: Producto[] = [
  {
    id: PRODUCTO_IDS.queso,
    nombre: 'Arepa de queso',
    precio: 5000,
    categoria: 'Arepas',
    activo: true,
  },
  {
    id: PRODUCTO_IDS.carne,
    nombre: 'Arepa rellena de carne',
    precio: 9000,
    categoria: 'Arepas',
    activo: true,
  },
  {
    id: PRODUCTO_IDS.huevo,
    nombre: 'Arepa de huevo',
    precio: 7000,
    categoria: 'Arepas',
    activo: true,
  },
  {
    id: PRODUCTO_IDS.mixta,
    nombre: 'Arepa mixta',
    precio: 11000,
    categoria: 'Arepas',
    activo: true,
  },
  {
    id: PRODUCTO_IDS.choclo,
    nombre: 'Arepa de choclo',
    precio: 6000,
    categoria: 'Arepas',
    activo: true,
  },
  {
    id: PRODUCTO_IDS.gaseosa,
    nombre: 'Gaseosa',
    precio: 3000,
    categoria: 'Bebidas',
    activo: true,
  },
  {
    id: PRODUCTO_IDS.jugo,
    nombre: 'Jugo natural',
    precio: 4500,
    categoria: 'Bebidas',
    activo: true,
  },
  {
    id: PRODUCTO_IDS.cafe,
    nombre: 'Café',
    precio: 2000,
    categoria: 'Bebidas',
    activo: true,
  },
  {
    id: PRODUCTO_IDS.chocolate,
    nombre: 'Chocolate',
    precio: 3000,
    categoria: 'Bebidas',
    activo: false,
  },
  {
    id: PRODUCTO_IDS.quesoExtra,
    nombre: 'Queso extra',
    precio: 1500,
    categoria: 'Adicionales',
    activo: false,
  },
]

export const CONFIGURACION_SEED: Configuracion = {
  negocio: {
    nombre: 'Arepas La Esquina',
    documento: '1.098.765.432',
    pieRecibo: '¡Gracias por su compra!',
  },
  dispositivo: {
    prefijo: 'A',
    ultimoConsecutivo: 42,
  },
  impresora: {
    nombre: 'PT-210',
    id: '22222222-2222-4222-8222-222222222001',
  },
}

/** Fecha de hoy a la hora local indicada (calendario del dispositivo). */
export function hoyALas(horas: number, minutos: number): string {
  const d = new Date()
  d.setHours(horas, minutos, 0, 0)
  return d.toISOString()
}

function item(
  productoId: string,
  nombre: string,
  precioUnitario: number,
  cantidad: number,
) {
  return { productoId, nombre, precioUnitario, cantidad }
}

function totalDe(
  items: { precioUnitario: number; cantidad: number }[],
): number {
  return items.reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0)
}

/**
 * 9 ventas del prototipo Historial (A-0034…A-0042),
 * con fechas relativas a hoy para que el historial no quede vacío.
 */
export function crearVentasSeed(): Venta[] {
  const a0034Items = [
    item(PRODUCTO_IDS.carne, 'Arepa rellena de carne', 9000, 2),
  ]
  const a0035Items = [
    item(PRODUCTO_IDS.huevo, 'Arepa de huevo', 7000, 1),
    item(PRODUCTO_IDS.cafe, 'Café', 2000, 1),
  ]
  const a0036Items = [
    item(PRODUCTO_IDS.queso, 'Arepa de queso', 5000, 2),
    item(PRODUCTO_IDS.gaseosa, 'Gaseosa', 3000, 1),
  ]
  const a0037Items = [
    item(PRODUCTO_IDS.mixta, 'Arepa mixta', 11000, 1),
    item(PRODUCTO_IDS.jugo, 'Jugo natural', 4500, 1),
  ]
  const a0038Items = [
    item(PRODUCTO_IDS.choclo, 'Arepa de choclo', 6000, 2),
    item(PRODUCTO_IDS.gaseosa, 'Gaseosa', 3000, 1),
  ]
  const a0039Items = [item(PRODUCTO_IDS.huevo, 'Arepa de huevo', 7000, 3)]
  const a0040Items = [
    item(PRODUCTO_IDS.carne, 'Arepa rellena de carne', 9000, 1),
    item(PRODUCTO_IDS.jugo, 'Jugo natural', 4500, 1),
  ]
  const a0041Items = [
    item(PRODUCTO_IDS.queso, 'Arepa de queso', 5000, 2),
    item(PRODUCTO_IDS.cafe, 'Café', 2000, 2),
  ]
  const a0042Items = [
    item(PRODUCTO_IDS.mixta, 'Arepa mixta', 11000, 1),
    item(PRODUCTO_IDS.queso, 'Arepa de queso', 5000, 1),
    item(PRODUCTO_IDS.gaseosa, 'Gaseosa', 3000, 1),
  ]

  const total39 = totalDe(a0039Items)
  const total42 = totalDe(a0042Items)
  const fecha39 = hoyALas(12, 20)
  const anuladaEn = new Date(fecha39)
  anuladaEn.setMinutes(anuladaEn.getMinutes() + 4)

  const ventas: Venta[] = [
    {
      id: '33333333-3333-4333-8333-333333333034',
      recibo: 'A-0034',
      fecha: hoyALas(10, 55),
      registradaPor: 'Carlos',
      items: a0034Items,
      total: totalDe(a0034Items),
      medioPago: 'Efectivo',
      pagaCon: totalDe(a0034Items),
      vueltas: 0,
      impreso: true,
      sincronizada: true,
    },
    {
      id: '33333333-3333-4333-8333-333333333035',
      recibo: 'A-0035',
      fecha: hoyALas(11, 22),
      registradaPor: 'Carlos',
      items: a0035Items,
      total: totalDe(a0035Items),
      medioPago: 'Nequi',
      impreso: true,
      sincronizada: true,
    },
    {
      id: '33333333-3333-4333-8333-333333333036',
      recibo: 'A-0036',
      fecha: hoyALas(11, 40),
      registradaPor: 'Carlos',
      items: a0036Items,
      total: totalDe(a0036Items),
      medioPago: 'Efectivo',
      pagaCon: totalDe(a0036Items),
      vueltas: 0,
      impreso: true,
      sincronizada: true,
    },
    {
      id: '33333333-3333-4333-8333-333333333037',
      recibo: 'A-0037',
      fecha: hoyALas(11, 58),
      registradaPor: 'Carlos',
      items: a0037Items,
      total: totalDe(a0037Items),
      medioPago: 'Transferencia',
      impreso: true,
      sincronizada: true,
    },
    {
      id: '33333333-3333-4333-8333-333333333038',
      recibo: 'A-0038',
      fecha: hoyALas(12, 12),
      registradaPor: 'Carlos',
      items: a0038Items,
      total: totalDe(a0038Items),
      medioPago: 'Efectivo',
      pagaCon: totalDe(a0038Items),
      vueltas: 0,
      impreso: true,
      sincronizada: true,
    },
    {
      id: '33333333-3333-4333-8333-333333333039',
      recibo: 'A-0039',
      fecha: fecha39,
      registradaPor: 'Carlos',
      items: a0039Items,
      total: total39,
      medioPago: 'Efectivo',
      pagaCon: 50000,
      vueltas: 50000 - total39,
      impreso: true,
      sincronizada: true,
      anulada: {
        motivo: 'Producto equivocado',
        por: 'Laura',
        en: anuladaEn.toISOString(),
      },
    },
    {
      id: '33333333-3333-4333-8333-333333333040',
      recibo: 'A-0040',
      fecha: hoyALas(12, 31),
      registradaPor: 'Carlos',
      items: a0040Items,
      total: totalDe(a0040Items),
      medioPago: 'Daviplata',
      impreso: true,
      sincronizada: true,
    },
    {
      id: '33333333-3333-4333-8333-333333333041',
      recibo: 'A-0041',
      fecha: hoyALas(12, 38),
      registradaPor: 'Carlos',
      items: a0041Items,
      total: totalDe(a0041Items),
      medioPago: 'Nequi',
      impreso: true,
      sincronizada: false,
    },
    {
      id: '33333333-3333-4333-8333-333333333042',
      recibo: 'A-0042',
      fecha: hoyALas(12, 46),
      registradaPor: 'Carlos',
      items: a0042Items,
      total: total42,
      medioPago: 'Efectivo',
      pagaCon: 25000,
      vueltas: 25000 - total42,
      impreso: true,
      sincronizada: false,
    },
  ]

  return ventas
}

export type MemorySeed = {
  productos: Producto[]
  ventas: Venta[]
  configuracion: Configuracion
}

export function crearSeed(): MemorySeed {
  return {
    productos: structuredClone(PRODUCTOS_SEED),
    ventas: crearVentasSeed(),
    configuracion: structuredClone(CONFIGURACION_SEED),
  }
}
