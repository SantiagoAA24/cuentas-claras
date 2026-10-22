import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Sesión simulada para el layout y la protección de rutas.
 * TODO: reemplazar con autenticación real (API + token).
 */
export type SessionUser = {
  id: string
  nombre: string
  usuario: string
}

type SessionState = {
  user: SessionUser | null
  login: () => void
  logout: () => void
}

const FAKE_USER: SessionUser = {
  id: '00000000-0000-4000-8000-000000000001',
  nombre: 'Carlos',
  usuario: 'carlos',
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      login: () => set({ user: FAKE_USER }),
      logout: () => set({ user: null }),
    }),
    { name: 'cc:sesion' },
  ),
)
