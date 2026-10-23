import { useCallback, useState } from 'react'
import { toast } from '../../../components/ui/Toast'
import { ventasRepo } from '../../../data/client'
import type {
  ItemVenta,
  MedioPago,
  RegistrarVentaInput,
  Venta,
} from '../../../domain/types'
import { digitsToAmount } from '../../../lib/moneyDigits'

export type CobroPaso = 'cobrando' | 'exito'

export type CobroSnapshot = {
  items: ItemVenta[]
  total: number
  cantidadTotal: number
}

function buildRegistrarInput(
  snapshot: CobroSnapshot,
  medioPago: MedioPago,
  pagaDigits: string,
  impreso: boolean,
  registradaPor: string,
): RegistrarVentaInput {
  const base: RegistrarVentaInput = {
    items: snapshot.items,
    medioPago,
    impreso,
    registradaPor,
  }

  if (medioPago !== 'Efectivo') return base

  const ingresado = digitsToAmount(pagaDigits)
  const pagaCon = ingresado ?? snapshot.total
  return {
    ...base,
    pagaCon,
    vueltas: pagaCon - snapshot.total,
  }
}

export function useCobroState() {
  const [open, setOpen] = useState(false)
  const [paso, setPaso] = useState<CobroPaso>('cobrando')
  const [medioPago, setMedioPago] = useState<MedioPago>('Efectivo')
  const [pagaDigits, setPagaDigits] = useState('')
  const [snapshot, setSnapshot] = useState<CobroSnapshot | null>(null)
  const [venta, setVenta] = useState<Venta | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const pagaCon = digitsToAmount(pagaDigits)
  const esEfectivo = medioPago === 'Efectivo'
  const total = snapshot?.total ?? 0
  const bloqueado = esEfectivo && pagaCon != null && pagaCon < total

  const resetForm = useCallback(() => {
    setMedioPago('Efectivo')
    setPagaDigits('')
    setPaso('cobrando')
    setVenta(null)
    setSubmitting(false)
  }, [])

  const openCobro = useCallback(
    (items: ItemVenta[], pedidoTotal: number, cantidadTotal: number) => {
      if (items.length === 0 || pedidoTotal <= 0) return
      setSnapshot({
        items: items.map((i) => ({ ...i })),
        total: pedidoTotal,
        cantidadTotal,
      })
      resetForm()
      setOpen(true)
    },
    [resetForm],
  )

  const closeCobro = useCallback(() => {
    setOpen(false)
    setSnapshot(null)
    resetForm()
  }, [resetForm])

  /** Cierre desde la X (solo en paso cobrando). No reapertura espuria de vaul. */
  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) return
      if (paso === 'exito' || submitting) return
      closeCobro()
    },
    [closeCobro, paso, submitting],
  )

  const cobrar = useCallback(
    async (
      impreso: boolean,
      registradaPor: string,
      onRegistrada: () => void,
    ) => {
      if (bloqueado || submitting || snapshot == null) return
      if (!registradaPor) {
        toast({
          message: 'No hay sesión activa para registrar la venta',
          variant: 'error',
        })
        return
      }

      setSubmitting(true)
      try {
        const registrada = await ventasRepo.registrar(
          buildRegistrarInput(
            snapshot,
            medioPago,
            pagaDigits,
            impreso,
            registradaPor,
          ),
        )
        onRegistrada()
        setVenta(registrada)
        setPaso('exito')
      } catch {
        toast({
          message: 'No se pudo registrar la venta. Intenta de nuevo.',
          variant: 'error',
        })
      } finally {
        setSubmitting(false)
      }
    },
    [bloqueado, medioPago, pagaDigits, snapshot, submitting],
  )

  return {
    open,
    paso,
    medioPago,
    setMedioPago,
    pagaDigits,
    setPagaDigits,
    pagaCon,
    esEfectivo,
    snapshot,
    venta,
    submitting,
    bloqueado,
    openCobro,
    closeCobro,
    handleOpenChange,
    cobrar,
  }
}
