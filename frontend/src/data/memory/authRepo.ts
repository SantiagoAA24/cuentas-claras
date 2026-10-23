import { CredencialesInvalidasError } from '../authErrors'
import type { AuthRepository, AuthUser } from '../repositories'
import type { MemoryStore } from './store'

export function createAuthRepo(
  store: MemoryStore,
  delay: () => Promise<void>,
): AuthRepository {
  return {
    async login(usuario: string, password: string): Promise<AuthUser> {
      await delay()

      const clave = usuario.trim().toLowerCase()
      if (clave === '' || password === '') {
        throw new CredencialesInvalidasError()
      }

      const match = store.usuarios.find(
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
