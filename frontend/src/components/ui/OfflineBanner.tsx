import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { Icon } from './Icon'

type OfflineBannerProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'>

/** Estado 9a: franja bajo la TopBar cuando no hay conexión. */
export function OfflineBanner({ className, ...rest }: OfflineBannerProps) {
  return (
    <div
      role="status"
      className={cn(
        'flex shrink-0 items-center gap-2 bg-pendiente px-gutter py-1.5',
        'text-caption font-bold text-white',
        className,
      )}
      {...rest}
    >
      <Icon name="cloud_off" size={20} />
      <span>
        <span className="font-black">Sin conexión</span>
        {' · Las ventas se guardan y se enviarán después'}
      </span>
    </div>
  )
}
