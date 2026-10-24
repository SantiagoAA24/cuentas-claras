import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthSession, AuthUser } from '../data/repositories'

export type SessionUser = AuthUser

type SessionState = {
  user: SessionUser | null
  accessToken: string | null
  refreshToken: string | null
  login: (session: AuthSession) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  logout: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      login: (session) =>
        set({
          user: session.user,
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
        }),
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),
      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null }),
    }),
    { name: 'cc:sesion' },
  ),
)
