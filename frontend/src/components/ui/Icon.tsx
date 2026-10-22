import { cn } from '../../lib/cn'

type IconProps = {
  name: string
  size?: number
  className?: string
}

/** Material Symbols Rounded (relleno, peso 500 vía la fuente cargada). */
export function Icon({ name, size = 24, className }: IconProps) {
  return (
    <span
      className={cn('material-symbols-rounded', className)}
      style={{ fontSize: size, fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" }}
      aria-hidden="true"
    >
      {name}
    </span>
  )
}
