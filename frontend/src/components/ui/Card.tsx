import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { cn } from '../../lib/cn'
import { Icon } from './Icon'

type CardVariant = 'default' | 'summary' | 'alert-danger' | 'muted'
type CardPadding = 'none' | 'sm' | 'md'

type CardProps = {
  variant?: CardVariant
  /** `sm` = 12×14 px; `md` = 16 px. */
  padding?: CardPadding
  /** Solo en `alert-danger`. Por defecto `error`. */
  icon?: string
  children?: ReactNode
} & HTMLAttributes<HTMLDivElement>

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-superficie text-tinta shadow-card',
  summary: 'bg-tostado-700 text-white shadow-raised',
  'alert-danger': 'bg-peligro-fondo text-peligro-texto',
  muted: 'border border-borde bg-crema',
}

const paddingClasses: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'px-3.5 py-3',
  md: 'p-4',
}

const CardRoot = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    variant = 'default',
    padding = 'md',
    icon = 'error',
    className,
    children,
    ...rest
  },
  ref,
) {
  const isAlert = variant === 'alert-danger'

  return (
    <div
      ref={ref}
      role={isAlert ? 'alert' : undefined}
      className={cn(
        'rounded-lg',
        variantClasses[variant],
        paddingClasses[padding],
        isAlert && 'flex items-start gap-2.5',
        className,
      )}
      {...rest}
    >
      {isAlert ? (
        <>
          <Icon name={icon} size={22} className="shrink-0 text-peligro" />
          <div className="text-label font-bold leading-snug">{children}</div>
        </>
      ) : (
        children
      )}
    </div>
  )
})

type CardRowProps = {
  label: ReactNode
  children: ReactNode
  className?: string
}

function CardRow({ label, children, className }: CardRowProps) {
  return (
    <div
      className={cn(
        'flex min-h-touch items-center justify-between gap-3',
        'border-t border-borde first:border-t-0',
        className,
      )}
    >
      <span className="text-body font-bold text-tinta-suave">{label}</span>
      <span className="text-body font-extrabold">{children}</span>
    </div>
  )
}

type CardListProps = {
  children: ReactNode
  className?: string
}

function CardList({ children, className }: CardListProps) {
  return (
    <div
      className={cn(
        'flex flex-col py-0',
        '[&>*]:border-b [&>*]:border-borde [&>*:last-child]:border-b-0',
        className,
      )}
    >
      {children}
    </div>
  )
}

export const Card = Object.assign(CardRoot, {
  Row: CardRow,
  List: CardList,
})

type SectionTitleProps = {
  children: ReactNode
  className?: string
} & HTMLAttributes<HTMLHeadingElement>

/** Título de sección (Impresora, Negocio, Ventas…). */
export function SectionTitle({
  children,
  className,
  ...rest
}: SectionTitleProps) {
  return (
    <h2
      className={cn('text-body-lg font-black text-tostado-700', className)}
      {...rest}
    >
      {children}
    </h2>
  )
}
