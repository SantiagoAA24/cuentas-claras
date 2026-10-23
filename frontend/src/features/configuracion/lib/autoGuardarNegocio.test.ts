import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createAutoGuardarNegocio } from './autoGuardarNegocio'

describe('createAutoGuardarNegocio', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('no guarda hasta pasar el delay', async () => {
    const guardar = vi.fn().mockResolvedValue(undefined)
    const auto = createAutoGuardarNegocio(guardar, 500)

    auto.schedule({ nombre: 'Arepas' })
    expect(guardar).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(499)
    expect(guardar).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1)
    expect(guardar).toHaveBeenCalledTimes(1)
    expect(guardar).toHaveBeenCalledWith({ nombre: 'Arepas' })
  })

  it('fusiona varios schedule en un solo guardado', async () => {
    const guardar = vi.fn().mockResolvedValue(undefined)
    const auto = createAutoGuardarNegocio(guardar, 500)

    auto.schedule({ nombre: 'A' })
    await vi.advanceTimersByTimeAsync(200)
    auto.schedule({ documento: '1.2.3' })
    await vi.advanceTimersByTimeAsync(200)
    auto.schedule({ pieRecibo: 'Gracias' })

    await vi.advanceTimersByTimeAsync(500)
    expect(guardar).toHaveBeenCalledTimes(1)
    expect(guardar).toHaveBeenCalledWith({
      nombre: 'A',
      documento: '1.2.3',
      pieRecibo: 'Gracias',
    })
  })

  it('cancel evita el guardado pendiente', async () => {
    const guardar = vi.fn().mockResolvedValue(undefined)
    const auto = createAutoGuardarNegocio(guardar, 500)

    auto.schedule({ nombre: 'Temp' })
    auto.cancel()
    await vi.advanceTimersByTimeAsync(500)
    expect(guardar).not.toHaveBeenCalled()
  })

  it('flush guarda de inmediato', async () => {
    const guardar = vi.fn().mockResolvedValue(undefined)
    const auto = createAutoGuardarNegocio(guardar, 500)

    auto.schedule({ nombre: 'Ahora' })
    await auto.flush()
    expect(guardar).toHaveBeenCalledTimes(1)
    expect(guardar).toHaveBeenCalledWith({ nombre: 'Ahora' })
  })
})
