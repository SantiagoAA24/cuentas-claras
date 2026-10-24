export type Categoria = 'Arepas' | 'Bebidas' | 'Adicionales'

export type MedioPago = 'Efectivo' | 'Nequi' | 'Daviplata' | 'Transferencia'

export type MotivoAnulacion =
  | 'Error al registrar'
  | 'Cliente canceló'
  | 'Producto equivocado'
  | 'Otro'

export interface Producto {
  id: string
  nombre: string
  precio: number
  categoria: Categoria
  activo: boolean
}

export interface ItemVenta {
  productoId: string
  nombre: string
  precioUnitario: number
  cantidad: number
}

export interface Anulacion {
  motivo: MotivoAnulacion
  texto?: string
  por: string
  en: string
}

export interface Venta {
  id: string
  recibo: string
  fecha: string
  registradaPor: string
  items: ItemVenta[]
  total: number
  medioPago: MedioPago
  pagaCon?: number
  vueltas?: number
  impreso: boolean
  sincronizada: boolean
  /** Conflicto de recibo detectado en el servidor (mismo prefijo+consecutivo). */
  conflictoRecibo?: boolean
  anulada?: Anulacion
}

export interface Configuracion {
  negocio: {
    nombre: string
    documento: string
    pieRecibo: string
  }
  dispositivo: {
    /** UUID del dispositivo; vacío hasta el primer registro en el servidor. */
    id: string
    prefijo: string
    ultimoConsecutivo: number
  }
  /** Estado de sincronización con el backend. */
  sync: {
    cursor: number
    inicialCompleto: boolean
  }
  impresora?: {
    nombre: string
    id: string
  }
}

export type CrearProductoInput = Omit<Producto, 'id'>

export type ActualizarProductoInput = Partial<Omit<Producto, 'id'>>

export type RegistrarVentaInput = {
  items: ItemVenta[]
  medioPago: MedioPago
  pagaCon?: number
  vueltas?: number
  impreso: boolean
  registradaPor: string
}

export type AnularVentaInput = {
  motivo: MotivoAnulacion
  texto?: string
  por: string
}

export type GuardarConfiguracionInput = {
  negocio?: Partial<Configuracion['negocio']>
  impresora?: Configuracion['impresora'] | null
}

export type DesgloseMedio = {
  medio: MedioPago
  cantidad: number
  monto: number
}

export type ResumenDia = {
  totalVendido: number
  cantidadVentas: number
  cantidadAnuladas: number
  desglose: DesgloseMedio[]
}
