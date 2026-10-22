import type { HTMLAttributes } from 'react'
import { NavLink } from 'react-router'
import { cn } from '../../lib/cn'
import { Icon } from './Icon'

const TABS = [
  { to: '/vender', label: 'Vender', icon: 'point_of_sale', end: true },
  { to: '/historial', label: 'Historial', icon: 'receipt_long', end: false },
  { to: '/productos', label: 'Productos', icon: 'inventory_2', end: true },
] as const

export type BottomNavTab = (typeof TABS)[number]['to']

type BottomNavProps = {
  /**
   * Modo controlado (p. ej. demos sin rutas reales).
   * Si se pasa, no usa NavLink.
   */
  activeTo?: BottomNavTab
  onNavigate?: (to: BottomNavTab) => void
} & Omit<HTMLAttributes<HTMLElement>, 'children'>

function TabContent({
  label,
  icon,
  isActive,
}: {
  label: string
  icon: string
  isActive: boolean
}) {
  return (
    <>
      <span
        className={cn(
          'flex h-switch-h w-touch-lg items-center justify-center rounded-pill',
          isActive && 'bg-maiz-500',
        )}
      >
        <Icon name={icon} size={24} />
      </span>
      <span
        className={cn(
          'text-caption',
          isActive ? 'font-black' : 'font-extrabold',
        )}
      >
        {label}
      </span>
    </>
  )
}

export function BottomNav({
  className,
  activeTo,
  onNavigate,
  ...rest
}: BottomNavProps) {
  const controlled = activeTo != null

  return (
    <nav
      aria-label="Navegación principal"
      className={cn(
        'fixed inset-x-0 bottom-0 border-t border-borde bg-superficie',
        'h-navbar-safe',
        'pb-safe-bottom',
        className,
      )}
      {...rest}
    >
      <div className="grid h-navbar grid-cols-3 gap-1.5 p-1.5">
        {TABS.map((tab) => {
          const tabClass = (isActive: boolean) =>
            cn(
              'flex flex-col items-center justify-center gap-0.5',
              isActive ? 'text-tinta' : 'text-tinta-suave',
            )

          if (controlled) {
            const isActive = activeTo === tab.to
            return (
              <button
                key={tab.to}
                type="button"
                className={tabClass(isActive)}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onNavigate?.(tab.to)}
              >
                <TabContent
                  label={tab.label}
                  icon={tab.icon}
                  isActive={isActive}
                />
              </button>
            )
          }

          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) => tabClass(isActive)}
            >
              {({ isActive }) => (
                <TabContent
                  label={tab.label}
                  icon={tab.icon}
                  isActive={isActive}
                />
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
