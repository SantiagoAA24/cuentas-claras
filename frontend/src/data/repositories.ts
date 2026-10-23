import type {
  ActualizarProductoInput,
  AnularVentaInput,
  Configuracion,
  CrearProductoInput,
  GuardarConfiguracionInput,
  Producto,
  RegistrarVentaInput,
  Venta,
} from '../domain/types'

export type ListarProductosOpts = {
  soloActivos?: boolean
}

export interface ProductosRepository {
  listar(opts?: ListarProductosOpts): Promise<Producto[]>
  obtenerPorId(id: string): Promise<Producto | undefined>
  crear(input: CrearProductoInput): Promise<Producto>
  actualizar(id: string, patch: ActualizarProductoInput): Promise<Producto>
  activar(id: string): Promise<Producto>
  desactivar(id: string): Promise<Producto>
}

export interface VentasRepository {
  listarDelDia(dia?: Date): Promise<Venta[]>
  obtenerPorId(id: string): Promise<Venta | undefined>
  registrar(input: RegistrarVentaInput): Promise<Venta>
  anular(id: string, input: AnularVentaInput): Promise<Venta>
  /** Peek del próximo recibo; no incrementa el consecutivo. */
  obtenerSiguienteConsecutivo(): Promise<string>
  /** Entradas pendientes en colaSync (outbox). */
  contarPendientes(): Promise<number>
  /**
   * Stub hasta el backend: no drena la cola; siempre retorna 0.
   * @returns Cantidad sincronizada en esta corrida.
   */
  sincronizarPendientes(): Promise<number>
  marcarImpreso(id: string, impreso: boolean): Promise<Venta>
}

export interface ConfiguracionRepository {
  obtener(): Promise<Configuracion>
  guardar(patch: GuardarConfiguracionInput): Promise<Configuracion>
}

/** Usuario autenticado (sin contraseña). */
export type AuthUser = {
  id: string
  nombre: string
  usuario: string
}

export interface AuthRepository {
  /**
   * Valida credenciales. Rechaza con CredencialesInvalidasError si fallan.
   */
  login(usuario: string, password: string): Promise<AuthUser>
}
