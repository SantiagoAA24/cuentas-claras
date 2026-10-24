import { apiFetch } from './client'
import type { components } from './schema'

type SyncPushRequest = components['schemas']['SyncPushRequest']
type SyncPushResponse = components['schemas']['SyncPushResponse']
type SyncPullResponse = components['schemas']['SyncPullResponse']

export async function syncPushApi(
  body: SyncPushRequest,
): Promise<SyncPushResponse> {
  return apiFetch<SyncPushResponse>('/api/v1/sync/push', {
    method: 'POST',
    json: body,
  })
}

export async function syncPullApi(opts: {
  dispositivoId: string
  desde: number
  limite?: number
}): Promise<SyncPullResponse> {
  const params = new URLSearchParams({
    dispositivo_id: opts.dispositivoId,
    desde: String(opts.desde),
    limite: String(opts.limite ?? 100),
  })
  return apiFetch<SyncPullResponse>(`/api/v1/sync/pull?${params.toString()}`, {
    method: 'GET',
  })
}
