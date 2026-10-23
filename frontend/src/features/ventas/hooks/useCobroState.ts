import { useCallback, useRef, useState } from 'react'
import { toast } from '../../../components/ui/Toast'
import { ventasRepo } from '../../../data/client'
import type {
  ItemVenta,
  MedioPago,
  RegistrarVentaInput,
  Venta,
} from '../../../domain/types'
import { imprimirVenta } from '../../../lib/impresora'
import { digitsToAmount } from '../../../lib/moneyDigits'
import { syncVentasPendientes } from '../../../lib/sync'

export type CobroPaso = 'cobrando' | 'exito'

export type PrintStatus =
  | 'idle'
  | 'imprimiendo'
  | 'impreso'
  | 'sin-imprimir'
  | 'fallo'

export type CobroSnapshot = {
  items: ItemVenta[]
  total: number
  cantidadTotal: number
}

function buildRegistrarInput(
  snapshot: CobroSnapshot,
  medioPago: MedioPago,
  pagaDigits: string,
  registradaPor: string,
): RegistrarVentaInput {
  const base: RegistrarVentaInput = {
    items: snapshot.items,
    medioPago,
    impreso: false,
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
  const [printStatus, setPrintStatus] = useState<PrintStatus>('idle')
  const [retrying, setRetrying] = useState(false)

  /** Generación de sesión de hoja: invalida callbacks de print al cerrar. */
  const sessionRef = useRef(0)
  const ventaIdRef = useRef<string | null>(null)

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
    setPrintStatus('idle')
    setRetrying(false)
    ventaIdRef.current = null
  }, [])

  const openCobro = useCallback(
    (items: ItemVenta[], pedidoTotal: number, cantidadTotal: number) => {
      if (items.length === 0 || pedidoTotal <= 0) return
      sessionRef.current += 1
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
    sessionRef.current += 1
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

  const runPrint = useCallback(async (ventaId: string, session: number) => {
    const actual = await ventasRepo.obtenerPorId(ventaId)
    if (!actual) return

    try {
      await imprimirVenta(actual)
      await ventasRepo.marcarImpreso(ventaId, true)
      // Persistió aunque la hoja se haya cerrado (Nueva venta).
      if (sessionRef.current !== session) return
      setVenta((prev) =>
        prev && prev.id === ventaId ? { ...prev, impreso: true } : prev,
      )
      setPrintStatus('impreso')
    } catch {
      if (sessionRef.current !== session) return
      setPrintStatus('fallo')
    }
  }, [])

  const cobrar = useCallback(
    async (
      conImpresion: boolean,
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

      const session = sessionRef.current
      setSubmitting(true)
      try {
        const registrada = await ventasRepo.registrar(
          buildRegistrarInput(snapshot, medioPago, pagaDigits, registradaPor),
        )
        if (sessionRef.current !== session) return

        onRegistrada()
        ventaIdRef.current = registrada.id
        setVenta(registrada)
        setPaso('exito')

        if (conImpresion) {
          setPrintStatus('imprimiendo')
          void runPrint(registrada.id, session)
        } else {
          setPrintStatus('sin-imprimir')
        }

        void syncVentasPendientes()
      } catch {
        if (sessionRef.current !== session) return
        toast({
          message: 'No se pudo registrar la venta. Intenta de nuevo.',
          variant: 'error',
        })
      } finally {
        if (sessionRef.current === session) setSubmitting(false)
      }
    },
    [bloqueado, medioPago, pagaDigits, runPrint, snapshot, submitting],
  )

  const reintentarImpresion = useCallback(async () => {
    const id = ventaIdRef.current
    if (id == null || retrying) return
    const session = sessionRef.current
    setRetrying(true)
    try {
      const actual = await ventasRepo.obtenerPorId(id)
      if (!actual) return
      await imprimirVenta(actual)
      await ventasRepo.marcarImpreso(id, true)
      if (sessionRef.current !== session) return
      setVenta((prev) =>
        prev && prev.id === id ? { ...prev, impreso: true } : prev,
      )
      setPrintStatus('impreso')
    } catch {
      if (sessionRef.current !== session) return
      setPrintStatus('fallo')
    } finally {
      if (sessionRef.current === session) setRetrying(false)
    }
  }, [retrying])

  const continuarSinImprimir = useCallback(() => {
    setPrintStatus('sin-imprimir')
  }, [])

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
    printStatus,
    retrying,
    openCobro,
    closeCobro,
    handleOpenChange,
    cobrar,
    reintentarImpresion,
    continuarSinImprimir,
  }
}
