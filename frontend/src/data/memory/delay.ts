export const DEFAULT_DELAY_MS = 200

export function createDelay(delayMs: number): () => Promise<void> {
  if (delayMs <= 0) {
    return () => Promise.resolve()
  }
  return () => new Promise((resolve) => setTimeout(resolve, delayMs))
}
