import { clearSession, getAccessToken, getRefreshToken, setTokens } from './authTokens'
import { ApiError } from './errors'
import type { components } from './schema'

type TokenResponse = components['schemas']['TokenResponse']

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(
  /\/$/,
  '',
) ?? 'http://127.0.0.1:8000'

export type ApiFetchOptions = Omit<RequestInit, 'body'> & {
  /** Body JSON; se serializa y pone Content-Type. */
  json?: unknown
  /** Si true (default), envía Bearer access token. */
  auth?: boolean
  /** Evita intento de renovación (p. ej. la propia llamada a renovar). */
  skipRefresh?: boolean
}

let refreshPromise: Promise<boolean> | null = null

async function parseError(res: Response): Promise<ApiError> {
  let codigo = 'desconocido'
  let mensaje = res.statusText || 'Error de red'
  try {
    const body = (await res.json()) as { codigo?: string; mensaje?: string }
    if (typeof body.codigo === 'string') codigo = body.codigo
    if (typeof body.mensaje === 'string') mensaje = body.mensaje
  } catch {
    // cuerpo no JSON
  }
  return new ApiError(codigo, mensaje, res.status)
}

async function renovarAccessToken(): Promise<boolean> {
  const refresh = getRefreshToken()
  if (!refresh) return false

  try {
    const res = await fetch(`${API_BASE}/api/v1/auth/renovar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
    })
    if (!res.ok) {
      clearSession()
      return false
    }
    const data = (await res.json()) as TokenResponse
    setTokens(data.access_token, data.refresh_token)
    return true
  } catch {
    return false
  }
}

/** Una sola renovación en vuelo si varias peticiones reciben 401 a la vez. */
function renovarUnaVez(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = renovarAccessToken().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

/**
 * fetch tipado contra la API. Renueva el access token una vez ante 401
 * `no_autorizado` y reintenta; si el refresh falla, limpia la sesión.
 */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const {
    json,
    auth = true,
    skipRefresh = false,
    headers: initHeaders,
    ...rest
  } = options

  const headers = new Headers(initHeaders)
  if (!headers.has('Accept')) headers.set('Accept', 'application/json')
  if (json !== undefined) {
    headers.set('Content-Type', 'application/json')
  }
  if (auth) {
    const token = getAccessToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  const url = path.startsWith('http') ? path : `${API_BASE}${path}`
  const res = await fetch(url, {
    ...rest,
    headers,
    body: json !== undefined ? JSON.stringify(json) : undefined,
  })

  if (
    res.status === 401 &&
    auth &&
    !skipRefresh
  ) {
    const err = await parseError(res)
    if (err.codigo === 'no_autorizado' || err.codigo === 'token_invalido') {
      const ok = await renovarUnaVez()
      if (ok) {
        return apiFetch<T>(path, { ...options, skipRefresh: true })
      }
      throw err
    }
    throw err
  }

  if (!res.ok) {
    throw await parseError(res)
  }

  if (res.status === 204) {
    return undefined as T
  }

  const text = await res.text()
  if (!text) return undefined as T
  return JSON.parse(text) as T
}

export function getApiBaseUrl(): string {
  return API_BASE
}
