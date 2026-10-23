import type { MedioPago } from '../domain/types'

/** Ícono Material Symbol por medio de pago. */
export const ICONO_MEDIO_PAGO: Record<MedioPago, string> = {
  Efectivo: 'payments',
  Nequi: 'smartphone',
  Daviplata: 'account_balance_wallet',
  Transferencia: 'account_balance',
}

export const MEDIOS_PAGO: {
  value: MedioPago
  label: string
  icon: string
}[] = (
  ['Efectivo', 'Nequi', 'Daviplata', 'Transferencia'] as const
).map((value) => ({
  value,
  label: value,
  icon: ICONO_MEDIO_PAGO[value],
}))

export function iconoMedioPago(medio: MedioPago): string {
  return ICONO_MEDIO_PAGO[medio]
}
