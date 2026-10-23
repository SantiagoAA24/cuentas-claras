import type { ReactNode } from 'react'
import { Drawer } from 'vaul'
import { cn } from '../../lib/cn'
import { IconButton } from './IconButton'

export type BottomSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Título 24 px; si se omite, se anuncia un nombre genérico a lectores de pantalla. */
  title?: string
  /** IconButton tonal con `close` a la derecha del título. */
  showClose?: boolean
  /**
   * Si es `false`, ni el velo ni el arrastre cierran la hoja (p. ej. cobro).
   * El cierre sigue siendo posible con `showClose` o desde el padre.
   * @default true
   */
  dismissible?: boolean
  /** Acciones fijas debajo del contenido con scroll. */
  footer?: ReactNode
  children: ReactNode
  className?: string
  /** Clases del velo (p. ej. z-index al apilar sobre otra hoja). */
  overlayClassName?: string
}

/**
 * Hoja inferior (vaul Drawer) según la convención de PANTALLAS.md:
 * superficie, radio superior 12 px, asa 40×5, velo scrim, máx. calc(100% − 40px).
 */
export function BottomSheet({
  open,
  onOpenChange,
  title,
  showClose = false,
  dismissible = true,
  footer,
  children,
  className,
  overlayClassName,
}: BottomSheetProps) {
  const showHeader = title != null || showClose

  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      dismissible={dismissible}
      repositionInputs
      autoFocus
      shouldScaleBackground={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay
          className={cn('fixed inset-0 z-40 bg-scrim', overlayClassName)}
        />
        <Drawer.Content
          aria-describedby={undefined}
          className={cn(
            'fixed inset-x-0 bottom-0 z-50 flex max-h-hoja flex-col gap-3',
            'rounded-t-lg bg-superficie pt-2 pr-4 pl-4 shadow-sheet outline-none',
            'pb-hoja-pad-bottom',
            className,
          )}
        >
          <div className="flex shrink-0 justify-center" aria-hidden>
            <span className="h-asa-alto w-asa-ancho rounded-pill bg-borde-fuerte" />
          </div>

          {showHeader ? (
            <div className="flex shrink-0 items-center justify-between gap-2">
              {title != null ? (
                <Drawer.Title className="min-w-0 flex-1 text-title font-black text-tostado-700">
                  {title}
                </Drawer.Title>
              ) : (
                <Drawer.Title className="sr-only">Hoja</Drawer.Title>
              )}
              {showClose ? (
                <IconButton
                  icon="close"
                  variant="tonal"
                  aria-label="Cerrar"
                  onClick={() => onOpenChange(false)}
                />
              ) : null}
            </div>
          ) : (
            <Drawer.Title className="sr-only">Hoja</Drawer.Title>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {children}
          </div>

          {footer != null ? (
            <div className="shrink-0">{footer}</div>
          ) : null}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
