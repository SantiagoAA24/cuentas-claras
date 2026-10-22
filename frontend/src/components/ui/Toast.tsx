import { useEffect, useState } from 'react'
import { create } from 'zustand'
import { cn } from '../../lib/cn'
import { Icon } from './Icon'

export type ToastVariant = 'success' | 'error' | 'info'

export type ToastOptions = {
  message: string
  variant: ToastVariant
  icon?: string
  /** Milisegundos visibles antes de desaparecer. Por defecto 3000. */
  duration?: number
}

type ToastItem = {
  id: string
  message: string
  variant: ToastVariant
  icon?: string
  /** false dispara la animación de salida antes de quitar el toast. */
  open: boolean
}

const DEFAULT_DURATION_MS = 3000
const EXIT_MS = 200

const defaultIcons: Record<ToastVariant, string> = {
  success: 'cloud_done',
  error: 'error',
  info: 'info',
}

const variantClasses: Record<ToastVariant, string> = {
  success: 'bg-exito text-white',
  error: 'bg-peligro text-white',
  info: 'bg-tinta text-white',
}

type ToastStore = {
  toasts: ToastItem[]
  toast: (options: ToastOptions) => string
  dismiss: (id: string) => void
  remove: (id: string) => void
}

const timers = new Map<string, ReturnType<typeof setTimeout>>()

function clearTimer(id: string) {
  const timer = timers.get(id)
  if (timer != null) {
    clearTimeout(timer)
    timers.delete(id)
  }
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  toast({ message, variant, icon, duration = DEFAULT_DURATION_MS }) {
    const id = crypto.randomUUID()
    const item: ToastItem = {
      id,
      message,
      variant,
      icon,
      open: true,
    }

    set((state) => ({ toasts: [...state.toasts, item] }))

    if (duration > 0) {
      timers.set(
        id,
        setTimeout(() => {
          get().dismiss(id)
        }, duration),
      )
    }

    return id
  },

  dismiss(id) {
    clearTimer(id)
    set((state) => ({
      toasts: state.toasts.map((t) =>
        t.id === id ? { ...t, open: false } : t,
      ),
    }))
  },

  remove(id) {
    clearTimer(id)
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },
}))

/** Dispara toasts desde cualquier componente. */
export function useToast() {
  const toast = useToastStore((s) => s.toast)
  return { toast }
}

type ToastProps = {
  message: string
  variant?: ToastVariant
  icon?: string
  /** Controla la animación de entrada/salida. */
  open?: boolean
  className?: string
}

/** Presentación de un toast (sin ciclo de vida ni store). */
export function Toast({
  message,
  variant = 'success',
  icon,
  open = true,
  className,
}: ToastProps) {
  const iconName = icon ?? defaultIcons[variant]

  return (
    <div
      role="status"
      className={cn(
        'flex max-w-full items-center gap-2.5 rounded-lg px-4 py-3 shadow-fab',
        'text-item font-extrabold',
        'transition-[opacity,transform] duration-200 ease-out',
        open
          ? 'translate-y-0 opacity-100'
          : 'translate-y-2 opacity-0',
        variantClasses[variant],
        className,
      )}
    >
      <Icon name={iconName} size={24} className="shrink-0" />
      <span className="min-w-0">{message}</span>
    </div>
  )
}

type ToastSlotProps = {
  item: ToastItem
}

function ToastSlot({ item }: ToastSlotProps) {
  const remove = useToastStore((s) => s.remove)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (item.open) return
    const timer = setTimeout(() => remove(item.id), EXIT_MS)
    return () => clearTimeout(timer)
  }, [item.open, item.id, remove])

  const visible = item.open && entered

  return <Toast message={item.message} variant={item.variant} icon={item.icon} open={visible} />
}

export type ToasterProps = {
  /**
   * Distancia desde el borde inferior del viewport.
   * En Vender usar un valor que deje el toast por encima del panel del pedido
   * (p. ej. 240, como en el diseño 9c).
   */
  bottomOffset?: number
  className?: string
}

/**
 * Contenedor fijo de toasts. Montarlo una sola vez (p. ej. en AppShell).
 * `pointer-events-none` para no bloquear toques en el resto de la pantalla.
 */
export function Toaster({ bottomOffset = 16, className }: ToasterProps) {
  const toasts = useToastStore((s) => s.toasts)

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-gutter z-50 flex flex-col items-center gap-2',
        className,
      )}
      style={{ bottom: bottomOffset }}
      aria-live="polite"
      aria-relevant="additions text"
    >
      {toasts.map((item) => (
        <ToastSlot key={item.id} item={item} />
      ))}
    </div>
  )
}

/** Atajo imperativo (p. ej. fuera de componentes React). */
export function toast(options: ToastOptions) {
  return useToastStore.getState().toast(options)
}
