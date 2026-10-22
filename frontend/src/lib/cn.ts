import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * Tamaños tipográficos del tema (`--text-*` en theme.css).
 * Sin esto, tailwind-merge confunde p. ej. `text-badge` con un color
 * y lo elimina al chocar con `text-tinta`.
 */
const textSizes = [
  'estado',
  'caption',
  'label',
  'body',
  'item',
  'body-lg',
  'nombre-producto',
  'badge',
  'title-sm',
  'price',
  'title',
  'money',
  'title-lg',
  'total-sm',
  'total',
  'total-xl',
] as const

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: [...textSizes] }],
    },
  },
})

/** Combina clases de Tailwind resolviendo conflictos con tailwind-merge. */
export function cn(...clases: ClassValue[]) {
  return twMerge(clsx(clases))
}
