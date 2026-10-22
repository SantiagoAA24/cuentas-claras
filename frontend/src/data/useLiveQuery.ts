import { useEffect, useState } from 'react'
import { subscribeData } from './client'

/**
 * Re-ejecuta una query async al montar, al cambiar deps y cuando muta el store.
 * API cercana a useLiveQuery de dexie-react-hooks para facilitar el reemplazo.
 */
export function useLiveQuery<T>(
  querier: () => Promise<T>,
  deps: unknown[] = [],
): T | undefined {
  const [value, setValue] = useState<T | undefined>(undefined)

  useEffect(() => {
    let cancelled = false

    const run = () => {
      void querier().then((result) => {
        if (!cancelled) setValue(result)
      })
    }

    run()
    const unsubscribe = subscribeData(run)

    return () => {
      cancelled = true
      unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps controladas por el caller
  }, deps)

  return value
}
