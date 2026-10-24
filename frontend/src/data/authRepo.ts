import { cerrarSesionApi, loginApi } from '../lib/api'
import type { AuthRepository } from './repositories'

/** Auth contra la API real. */
export function createAuthRepo(): AuthRepository {
  return {
    login: loginApi,
    cerrarSesion: cerrarSesionApi,
  }
}
