import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type BottomActionBarProps = {
  children: ReactNode
  className?: string
}

/**
 * Barra fija inferior para pantallas apiladas (detalle, config…).
 * Usar dentro de una columna `h-full` con el contenido scrolleable arriba.
 */
export function BottomActionBar({ children, className }: BottomActionBarProps) {
  return (
    <div
      className={cn(
        'shrink-0 border-t border-borde bg-superficie',
        'px-gutter pt-3 pb-[max(1rem,env(safe-area-inset-bottom,0px))]',
        className,
      )}
    >
      <div className="flex gap-2.5">{children}</div>
    </div>
  )
}
