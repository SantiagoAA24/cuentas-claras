import { apiFetch } from './client'
import type { components } from './schema'

type DispositivoResponse = components['schemas']['DispositivoResponse']

export async function registrarDispositivoApi(
  id: string,
): Promise<DispositivoResponse> {
  return apiFetch<DispositivoResponse>('/api/v1/dispositivos/registrar', {
    method: 'POST',
    json: { id },
  })
}
