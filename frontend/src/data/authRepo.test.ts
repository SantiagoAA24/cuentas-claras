import { afterEach, describe, expect, it, vi } from 'vitest'
import { CredencialesInvalidasError } from './authErrors'
import { createAuthRepo } from './authRepo'

describe('authRepo', () => {
  const authRepo = createAuthRepo()

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('acepta login y devuelve sesión con tokens', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            access_token: 'access-1',
            refresh_token: 'refresh-1',
            token_type: 'bearer',
            usuario: {
              id: '00000000-0000-4000-8000-000000000001',
              nombre: 'Carlos',
              usuario: 'carlos',
              negocio_id: '00000000-0000-4000-8000-000000000099',
            },
          }),
      }),
    )

    const session = await authRepo.login('  Carlos  ', 'arepa12')
    expect(session.user).toEqual({
      id: '00000000-0000-4000-8000-000000000001',
      nombre: 'Carlos',
      usuario: 'carlos',
      negocioId: '00000000-0000-4000-8000-000000000099',
    })
    expect(session.accessToken).toBe('access-1')
    expect(session.refreshToken).toBe('refresh-1')
  })

  it('rechaza credenciales inválidas', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({
          codigo: 'credenciales_invalidas',
          mensaje: 'Usuario o contraseña incorrectos',
        }),
      }),
    )

    await expect(authRepo.login('carlos', 'mal')).rejects.toBeInstanceOf(
      CredencialesInvalidasError,
    )
  })

  it('rechaza campos vacíos sin llamar a la API', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await expect(authRepo.login('', '')).rejects.toBeInstanceOf(
      CredencialesInvalidasError,
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('cerrarSesion no falla si la red cae', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('offline')),
    )
    await expect(authRepo.cerrarSesion('refresh-x')).resolves.toBeUndefined()
  })
})
