import { create } from 'zustand'
import type { Producto } from '../domain/types'

export type PedidoItem = {
  productoId: string
  nombre: string
  precioUnitario: number
  cantidad: number
}

type PedidoState = {
  items: Record<string, PedidoItem>
  expanded: boolean
  add: (producto: Producto) => void
  increment: (productoId: string) => void
  decrement: (productoId: string) => void
  remove: (productoId: string) => void
  clear: () => void
  setExpanded: (expanded: boolean) => void
  toggleExpanded: () => void
}

function withoutItem(
  items: Record<string, PedidoItem>,
  productoId: string,
): Record<string, PedidoItem> {
  const next = { ...items }
  delete next[productoId]
  return next
}

export const usePedidoStore = create<PedidoState>((set, get) => ({
  items: {},
  expanded: false,

  add: (producto) => {
    const existing = get().items[producto.id]
    if (existing) {
      set({
        items: {
          ...get().items,
          [producto.id]: {
            ...existing,
            cantidad: existing.cantidad + 1,
          },
        },
      })
      return
    }
    set({
      items: {
        ...get().items,
        [producto.id]: {
          productoId: producto.id,
          nombre: producto.nombre,
          precioUnitario: producto.precio,
          cantidad: 1,
        },
      },
    })
  },

  increment: (productoId) => {
    const existing = get().items[productoId]
    if (!existing) return
    set({
      items: {
        ...get().items,
        [productoId]: { ...existing, cantidad: existing.cantidad + 1 },
      },
    })
  },

  decrement: (productoId) => {
    const existing = get().items[productoId]
    if (!existing) return
    if (existing.cantidad <= 1) {
      const items = withoutItem(get().items, productoId)
      set({
        items,
        expanded: Object.keys(items).length === 0 ? false : get().expanded,
      })
      return
    }
    set({
      items: {
        ...get().items,
        [productoId]: { ...existing, cantidad: existing.cantidad - 1 },
      },
    })
  },

  remove: (productoId) => {
    const items = withoutItem(get().items, productoId)
    set({
      items,
      expanded: Object.keys(items).length === 0 ? false : get().expanded,
    })
  },

  clear: () => set({ items: {}, expanded: false }),

  setExpanded: (expanded) => {
    if (Object.keys(get().items).length === 0) {
      set({ expanded: false })
      return
    }
    set({ expanded })
  },

  toggleExpanded: () => {
    if (Object.keys(get().items).length === 0) return
    set({ expanded: !get().expanded })
  },
}))

export function selectPedidoItems(state: PedidoState): PedidoItem[] {
  return Object.values(state.items)
}

export function selectCantidadTotal(state: PedidoState): number {
  return Object.values(state.items).reduce((acc, i) => acc + i.cantidad, 0)
}

export function selectTotalPesos(state: PedidoState): number {
  return Object.values(state.items).reduce(
    (acc, i) => acc + i.precioUnitario * i.cantidad,
    0,
  )
}

export function selectIsEmpty(state: PedidoState): boolean {
  return Object.keys(state.items).length === 0
}

export function selectCantidadProducto(
  state: PedidoState,
  productoId: string,
): number {
  return state.items[productoId]?.cantidad ?? 0
}
