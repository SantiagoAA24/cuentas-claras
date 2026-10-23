import { describe, expect, it, beforeEach } from 'vitest'
import { CredencialesInvalidasError } from '../authErrors'
import { crearSeed } from '../../mocks/data'
import { createMemoryData, type MemoryData } from './createMemoryData'

describe('authRepo', () => {
  let data: MemoryData

  beforeEach(() => {
    data = createMemoryData({ delayMs: 0, seed: crearSeed() })
  })

  it('acepta carlos / arepa12', async () => {
    const user = await data.authRepo.login('carlos', 'arepa12')
    expect(user).toEqual({
      id: '00000000-0000-4000-8000-000000000001',
      nombre: 'Carlos',
      usuario: 'carlos',
    })
  })

  it('acepta usuario con mayúsculas y espacios', async () => {
    const user = await data.authRepo.login('  Carlos  ', 'arepa12')
    expect(user.usuario).toBe('carlos')
  })

  it('rechaza contraseña incorrecta', async () => {
    await expect(data.authRepo.login('carlos', 'mal')).rejects.toBeInstanceOf(
      CredencialesInvalidasError,
    )
  })

  it('rechaza campos vacíos', async () => {
    await expect(data.authRepo.login('', '')).rejects.toBeInstanceOf(
      CredencialesInvalidasError,
    )
  })

  it('acepta laura / arepa12', async () => {
    const user = await data.authRepo.login('laura', 'arepa12')
    expect(user.nombre).toBe('Laura')
  })
})
