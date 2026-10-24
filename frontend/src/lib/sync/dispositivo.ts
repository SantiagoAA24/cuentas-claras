import { configuracionRepo } from '../../data/client'
import { registrarDispositivoApi } from '../api'

/**
 * Asegura un dispositivo registrado en el servidor y guarda id + prefijo local.
 * Idempotente si ya hay `dispositivo.id`.
 */
export async function asegurarDispositivo(): Promise<{
  id: string
  prefijo: string
  ultimoConsecutivo: number
}> {
  const config = await configuracionRepo.obtener()
  const id = config.dispositivo.id || crypto.randomUUID()
  const remoto = await registrarDispositivoApi(id)

  const dispositivo = {
    id: remoto.id,
    prefijo: remoto.prefijo,
    ultimoConsecutivo: Math.max(
      config.dispositivo.ultimoConsecutivo,
      remoto.ultimo_consecutivo,
    ),
  }
  await configuracionRepo.guardarDispositivo(dispositivo)
  return dispositivo
}
