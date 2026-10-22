/** Rutas de la app. Deben coincidir con los paths de BottomNav. */
export const ROUTES = {
  login: '/login',
  vender: '/vender',
  historial: '/historial',
  historialDetalle: (id: string) => `/historial/${id}`,
  productos: '/productos',
  configuracion: '/configuracion',
  impresora: '/configuracion/impresora',
  devUi: '/dev/ui',
} as const

export const TAB_PATHS = [
  ROUTES.vender,
  ROUTES.historial,
  ROUTES.productos,
] as const

export type TabPath = (typeof TAB_PATHS)[number]

export function isTabPath(path: string): path is TabPath {
  return (TAB_PATHS as readonly string[]).includes(path)
}
