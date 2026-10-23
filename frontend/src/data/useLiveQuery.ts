import { useLiveQuery as useDexieLiveQuery } from 'dexie-react-hooks'

/**
 * Wrapper sobre dexie-react-hooks con la misma firma que usaban las pantallas
 * (querier + deps → T | undefined).
 */
export function useLiveQuery<T>(
  querier: () => Promise<T> | T,
  deps: unknown[] = [],
): T | undefined {
  return useDexieLiveQuery(querier, deps)
}
