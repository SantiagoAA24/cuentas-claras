import { useEffect, useState } from 'react'
import { useSessionStore } from '../stores/sessionStore'

/** Espera a que el middleware persist rehidrate `cc:sesion` desde localStorage. */
export function useSessionHydrated() {
  const [hydrated, setHydrated] = useState(() =>
    useSessionStore.persist.hasHydrated(),
  )

  useEffect(() => {
    setHydrated(useSessionStore.persist.hasHydrated())
    return useSessionStore.persist.onFinishHydration(() => setHydrated(true))
  }, [])

  return hydrated
}
