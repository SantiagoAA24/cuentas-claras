import { CredencialesInvalidasError } from '../../data/authErrors'
import type { AuthSession } from '../../data/repositories'
import { apiFetch } from './client'
import { ApiError } from './errors'
import type { components } from './schema'

type TokenResponse = components['schemas']['TokenResponse']

export async function loginApi(
  usuario: string,
  password: string,
): Promise<AuthSession> {
  const clave = usuario.trim().toLowerCase()
  if (clave === '' || password === '') {
    throw new CredencialesInvalidasError()
  }

  try {
    const data = await apiFetch<TokenResponse>('/api/v1/auth/login', {
      method: 'POST',
      auth: false,
      skipRefresh: true,
      json: { usuario: clave, password },
    })
    return {
      user: {
        id: data.usuario.id,
        nombre: data.usuario.nombre,
        usuario: data.usuario.usuario,
        negocioId: data.usuario.negocio_id,
      },
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    }
  } catch (err) {
    if (err instanceof ApiError && err.codigo === 'credenciales_invalidas') {
      throw new CredencialesInvalidasError()
    }
    throw err
  }
}

export async function cerrarSesionApi(refreshToken: string | null): Promise<void> {
  if (!refreshToken) return
  try {
    await apiFetch<void>('/api/v1/auth/cerrar-sesion', {
      method: 'POST',
      auth: false,
      skipRefresh: true,
      json: { refresh_token: refreshToken },
    })
  } catch {
    // Idempotente / offline: igual se limpia la sesión local.
  }
}
