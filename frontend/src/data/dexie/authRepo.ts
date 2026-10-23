import { USUARIOS_SEED } from '../../mocks/data'
import { CredencialesInvalidasError } from '../authErrors'
import type { AuthRepository, AuthUser } from '../repositories'

/** Login local contra credenciales seed (sin tabla IndexedDB hasta el backend). */
export function createAuthRepo(): AuthRepository {
  return {
    async login(usuario: string, password: string): Promise<AuthUser> {
      const clave = usuario.trim().toLowerCase()
      if (clave === '' || password === '') {
        throw new CredencialesInvalidasError()
      }

      const match = USUARIOS_SEED.find(
        (u) => u.usuario.toLowerCase() === clave && u.password === password,
      )

      if (match == null) {
        throw new CredencialesInvalidasError()
      }

      return {
        id: match.id,
        nombre: match.nombre,
        usuario: match.usuario,
      }
    },
  }
}
