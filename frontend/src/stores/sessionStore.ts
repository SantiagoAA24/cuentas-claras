import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser } from '../data/repositories'

/**
 * Sesión del usuario autenticado.
 * TODO: reemplazar persistencia local con token de API real.
 */
export type SessionUser = AuthUser

type SessionState = {
  user: SessionUser | null
  login: (user: SessionUser) => void
  logout: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: 'cc:sesion' },
  ),
)
