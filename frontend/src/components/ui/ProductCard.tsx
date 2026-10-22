import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { formatCOP } from '../../lib/format'

type ProductCardProps = {
  name: string
  /** Precio en pesos enteros. */
  price: number
  quantity: number
  onAdd: () => void
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onClick'>

export const ProductCard = forwardRef<HTMLButtonElement, ProductCardProps>(
  function ProductCard(
    { name, price, quantity, onAdd, className, type = 'button', ...rest },
    ref,
  ) {
    const inCart = quantity > 0
    const priceLabel = formatCOP(price)
    const ariaLabel = inCart
      ? `${name}, ${priceLabel}, ${quantity} en el pedido`
      : `${name}, ${priceLabel}`

    return (
      <button
        ref={ref}
        type={type}
        onClick={onAdd}
        aria-label={ariaLabel}
        className={cn(
          'relative flex min-h-tarjeta-producto flex-col justify-between gap-2.5',
          'rounded-lg border-2 p-3.5 text-left shadow-card',
          'transition-transform duration-75 active:scale-press',
          inCart
            ? 'border-maiz-500 bg-maiz-50'
            : 'border-transparent bg-superficie',
          className,
        )}
        {...rest}
      >
        <span className="pr-8 text-nombre-producto font-extrabold text-tinta text-pretty">
          {name}
        </span>
        <span className="text-price font-black text-tostado-700 tabular-nums">
          {priceLabel}
        </span>
        {inCart ? (
          <span
            aria-live="polite"
            aria-atomic="true"
            className={cn(
              'absolute top-2 right-2 box-border flex h-9 min-w-9 items-center justify-center',
              'rounded-pill bg-maiz-500 px-1.5 text-badge font-black text-tinta',
              'shadow-badge',
            )}
          >
            {quantity}
          </span>
        ) : null}
      </button>
    )
  },
)
