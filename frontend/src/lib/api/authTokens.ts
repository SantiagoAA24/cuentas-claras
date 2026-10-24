import { useSessionStore } from '../../stores/sessionStore'

export function getAccessToken(): string | null {
  return useSessionStore.getState().accessToken
}

export function getRefreshToken(): string | null {
  return useSessionStore.getState().refreshToken
}

export function setTokens(accessToken: string, refreshToken: string): void {
  useSessionStore.getState().setTokens(accessToken, refreshToken)
}

/** Limpia la sesión local (p. ej. refresh inválido). No borra Dexie. */
export function clearSession(): void {
  useSessionStore.getState().logout()
}
