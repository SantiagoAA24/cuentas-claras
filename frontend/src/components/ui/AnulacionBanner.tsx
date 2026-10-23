import { cn } from '../../lib/cn'
import { Icon } from './Icon'

type AnulacionBannerProps = {
  motivo: string
  meta: string
  className?: string
}

/** Aviso de venta anulada (4c): chip, motivo y quién/cuándo. */
export function AnulacionBanner({
  motivo,
  meta,
  className,
}: AnulacionBannerProps) {
  return (
    <div
      role="status"
      className={cn(
        'flex flex-col gap-1.5 rounded-lg border-2 border-peligro',
        'bg-peligro-fondo px-4 py-3.5',
        className,
      )}
    >
      <span className="inline-flex w-fit items-center gap-1.5 rounded-pill bg-peligro px-3 h-8 text-caption font-black text-white">
        <Icon name="block" size={18} />
        Anulada
      </span>
      <p className="text-body font-extrabold text-tinta">Motivo: {motivo}</p>
      <p className="text-label font-bold text-peligro-texto">{meta}</p>
    </div>
  )
}
