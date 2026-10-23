export type NegocioPatch = {
  nombre?: string
  documento?: string
  pieRecibo?: string
}

export type AutoGuardarNegocio = {
  /** Acumula campos y programa un guardado diferido. */
  schedule: (partial: NegocioPatch) => void
  /** Cancela el timer pendiente (p. ej. al desmontar). */
  cancel: () => void
  /** Fuerza el guardado inmediato del patch pendiente. */
  flush: () => Promise<void>
}

const DEFAULT_DELAY_MS = 500

/**
 * Debounce de escritura de campos de negocio.
 * Varios `schedule` cercanos se fusionan en un solo `guardar`.
 */
export function createAutoGuardarNegocio(
  guardar: (patch: NegocioPatch) => Promise<void>,
  delayMs = DEFAULT_DELAY_MS,
): AutoGuardarNegocio {
  let timer: ReturnType<typeof setTimeout> | null = null
  let pending: NegocioPatch = {}
  let inFlight: Promise<void> | null = null

  async function run() {
    const patch = pending
    pending = {}
    if (Object.keys(patch).length === 0) return
    inFlight = guardar(patch).finally(() => {
      inFlight = null
    })
    await inFlight
  }

  return {
    schedule(partial) {
      pending = { ...pending, ...partial }
      if (timer != null) clearTimeout(timer)
      timer = setTimeout(() => {
        timer = null
        void run()
      }, delayMs)
    },

    cancel() {
      if (timer != null) {
        clearTimeout(timer)
        timer = null
      }
      pending = {}
    },

    async flush() {
      if (timer != null) {
        clearTimeout(timer)
        timer = null
      }
      if (inFlight) await inFlight
      await run()
    },
  }
}
