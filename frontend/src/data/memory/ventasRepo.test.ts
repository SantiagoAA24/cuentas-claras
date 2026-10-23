import { beforeEach, describe, expect, it } from 'vitest'
import { crearSeed } from '../../mocks/data'
import { createMemoryData, type MemoryData } from './createMemoryData'

describe('ventasRepo (memoria)', () => {
  let data: MemoryData

  beforeEach(() => {
    data = createMemoryData({ delayMs: 0, seed: crearSeed() })
  })

  it('no permite anular una venta ya anulada', async () => {
    const anulada = (await data.ventasRepo.listarDelDia()).find(
      (v) => v.recibo === 'A-0039',
    )
    expect(anulada?.anulada).toBeDefined()

    await expect(
      data.ventasRepo.anular(anulada!.id, {
        motivo: 'Error al registrar',
        por: 'Carlos',
      }),
    ).rejects.toThrow(/ya está anulada/)
  })

  it('exige texto si el motivo es Otro', async () => {
    const venta = (await data.ventasRepo.listarDelDia()).find(
      (v) => v.recibo === 'A-0042',
    )

    await expect(
      data.ventasRepo.anular(venta!.id, {
        motivo: 'Otro',
        texto: '   ',
        por: 'Carlos',
      }),
    ).rejects.toThrow(/motivo/)
  })

  it('anula una venta vigente', async () => {
    const venta = (await data.ventasRepo.listarDelDia()).find(
      (v) => v.recibo === 'A-0042',
    )

    const result = await data.ventasRepo.anular(venta!.id, {
      motivo: 'Cliente canceló',
      por: 'Carlos',
    })

    expect(result.anulada).toMatchObject({
      motivo: 'Cliente canceló',
      por: 'Carlos',
    })
    expect(result.anulada?.en).toBeTruthy()
  })

  it('registrar incrementa el consecutivo y formatea el recibo', async () => {
    const peekAntes = await data.ventasRepo.obtenerSiguienteConsecutivo()
    expect(peekAntes).toBe('A-0043')

    const venta = await data.ventasRepo.registrar({
      items: [
        {
          productoId: 'x',
          nombre: 'Arepa de queso',
          precioUnitario: 5000,
          cantidad: 1,
        },
      ],
      medioPago: 'Nequi',
      impreso: false,
      registradaPor: 'Carlos',
    })

    expect(venta.recibo).toBe('A-0043')
    expect(venta.total).toBe(5000)
    expect(venta.sincronizada).toBe(false)

    const config = await data.configuracionRepo.obtener()
    expect(config.dispositivo.ultimoConsecutivo).toBe(43)

    const peekDespues = await data.ventasRepo.obtenerSiguienteConsecutivo()
    expect(peekDespues).toBe('A-0044')
  })

  it('obtenerSiguienteConsecutivo no incrementa', async () => {
    const a = await data.ventasRepo.obtenerSiguienteConsecutivo()
    const b = await data.ventasRepo.obtenerSiguienteConsecutivo()
    expect(a).toBe('A-0043')
    expect(b).toBe('A-0043')

    const config = await data.configuracionRepo.obtener()
    expect(config.dispositivo.ultimoConsecutivo).toBe(42)
  })

  it('conserva nombre y precio del ítem aunque el producto cambie después', async () => {
    const productos = await data.productosRepo.listar({ soloActivos: true })
    const queso = productos.find((p) => p.nombre === 'Arepa de queso')!

    const venta = await data.ventasRepo.registrar({
      items: [
        {
          productoId: queso.id,
          nombre: queso.nombre,
          precioUnitario: queso.precio,
          cantidad: 2,
        },
      ],
      medioPago: 'Efectivo',
      pagaCon: 10000,
      vueltas: 0,
      impreso: true,
      registradaPor: 'Carlos',
    })

    await data.productosRepo.actualizar(queso.id, {
      nombre: 'Arepa de queso grande',
      precio: 6000,
    })

    const guardada = await data.ventasRepo.obtenerPorId(venta.id)
    expect(guardada?.items[0]).toMatchObject({
      nombre: 'Arepa de queso',
      precioUnitario: 5000,
      cantidad: 2,
    })
    expect(guardada?.total).toBe(10000)
  })

  it('listarDelDia ordena de más reciente a más antigua', async () => {
    const lista = await data.ventasRepo.listarDelDia()
    expect(lista).toHaveLength(9)
    expect(lista[0]?.recibo).toBe('A-0042')
    expect(lista[lista.length - 1]?.recibo).toBe('A-0034')
  })

  it('guardar configuración no altera prefijo ni consecutivo', async () => {
    await data.configuracionRepo.guardar({
      negocio: { nombre: 'Nuevo nombre' },
    })
    const config = await data.configuracionRepo.obtener()
    expect(config.negocio.nombre).toBe('Nuevo nombre')
    expect(config.dispositivo).toEqual({ prefijo: 'A', ultimoConsecutivo: 42 })
  })

  it('contarPendientes incluye no sincronizadas del seed', async () => {
    const n = await data.ventasRepo.contarPendientes()
    expect(n).toBe(2)
  })

  it('sincronizarPendientes marca todas y retorna la cantidad', async () => {
    const n = await data.ventasRepo.sincronizarPendientes()
    expect(n).toBe(2)
    expect(await data.ventasRepo.contarPendientes()).toBe(0)

    const otra = await data.ventasRepo.sincronizarPendientes()
    expect(otra).toBe(0)
  })

  it('marcarImpreso actualiza el flag', async () => {
    const venta = (await data.ventasRepo.listarDelDia()).find(
      (v) => v.recibo === 'A-0042',
    )!
    expect(venta.impreso).toBe(true)

    const sinPrint = await data.ventasRepo.marcarImpreso(venta.id, false)
    expect(sinPrint.impreso).toBe(false)

    const conPrint = await data.ventasRepo.marcarImpreso(venta.id, true)
    expect(conPrint.impreso).toBe(true)
  })
})
