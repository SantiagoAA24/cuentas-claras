import { describe, expect, it } from 'vitest'
import { CredencialesInvalidasError } from '../authErrors'
import { createAuthRepo } from './authRepo'

describe('authRepo', () => {
  const authRepo = createAuthRepo()

  it('acepta carlos / arepa12', async () => {
    const user = await authRepo.login('carlos', 'arepa12')
    expect(user).toEqual({
      id: '00000000-0000-4000-8000-000000000001',
      nombre: 'Carlos',
      usuario: 'carlos',
    })
  })

  it('acepta usuario con mayúsculas y espacios', async () => {
    const user = await authRepo.login('  Carlos  ', 'arepa12')
    expect(user.usuario).toBe('carlos')
  })

  it('rechaza contraseña incorrecta', async () => {
    await expect(authRepo.login('carlos', 'mal')).rejects.toBeInstanceOf(
      CredencialesInvalidasError,
    )
  })

  it('rechaza campos vacíos', async () => {
    await expect(authRepo.login('', '')).rejects.toBeInstanceOf(
      CredencialesInvalidasError,
    )
  })

  it('acepta laura / arepa12', async () => {
    const user = await authRepo.login('laura', 'arepa12')
    expect(user.nombre).toBe('Laura')
  })
})
