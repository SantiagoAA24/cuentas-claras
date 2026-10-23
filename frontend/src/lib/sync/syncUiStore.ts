import { create } from 'zustand'

const SINCRONIZADO_MS = 3000

type SyncUiStore = {
  /** True ~3 s tras una sync exitosa (indicador TopBar «Sincronizado»). */
  justSynced: boolean
  flashSincronizado: () => void
}

let flashTimer: ReturnType<typeof setTimeout> | undefined

export const useSyncUiStore = create<SyncUiStore>((set) => ({
  justSynced: false,

  flashSincronizado() {
    if (flashTimer != null) clearTimeout(flashTimer)
    set({ justSynced: true })
    flashTimer = setTimeout(() => {
      set({ justSynced: false })
      flashTimer = undefined
    }, SINCRONIZADO_MS)
  },
}))
