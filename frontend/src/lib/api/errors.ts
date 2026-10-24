/** Error de API con código estable del backend (`{ codigo, mensaje }`). */
export class ApiError extends Error {
  readonly codigo: string
  readonly status: number

  constructor(codigo: string, mensaje: string, status: number) {
    super(mensaje)
    this.name = 'ApiError'
    this.codigo = codigo
    this.status = status
  }
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError
}
