import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ROUTES } from '../../../app/routes'
import { AnulacionBanner } from '../../../components/ui/AnulacionBanner'
import { BottomActionBar } from '../../../components/ui/BottomActionBar'
import { Button } from '../../../components/ui/Button'
import { DetalleSkeleton } from '../../../components/ui/DetalleSkeleton'
import { EmptyState } from '../../../components/ui/EmptyState'
import { toast } from '../../../components/ui/Toast'
import { ventasRepo } from '../../../data/client'
import { useLiveQuery } from '../../../data/useLiveQuery'
import type { MotivoAnulacion } from '../../../domain/types'
import { formatAnuladaEn } from '../../../lib/format'
import { syncVentasPendientes } from '../../../lib/sync'
import { useSessionStore } from '../../../stores/sessionStore'
import { AnularVentaSheet } from '../components/AnularVentaSheet'
import { DetalleVentaEncabezado } from '../components/DetalleVentaEncabezado'
import { DetalleVentaItems } from '../components/DetalleVentaItems'
import { DetalleVentaPago } from '../components/DetalleVentaPago'
import { etiquetaMotivoAnulacion } from '../lib/motivoAnulacion'

/** Detalle de venta · 4a / 4b / 4c. */
export function DetalleVentaPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const anuladaPor = useSessionStore((s) => s.user?.nombre ?? '')

  const venta = useLiveQuery(
    () =>
      id
        ? ventasRepo.obtenerPorId(id).then((v) => v ?? null)
        : Promise.resolve(null),
    [id],
  )

  const [sheetOpen, setSheetOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [anularError, setAnularError] = useState<string | null>(null)

  if (venta === undefined) {
    return <DetalleSkeleton />
  }

  if (venta === null) {
    return (
      <div className="flex h-full flex-col px-gutter py-4">
        <EmptyState
          illustrated
          className="flex-1 justify-center"
          icon="receipt_long"
          title="No encontramos esta venta"
          description="Puede que el enlace sea incorrecto o que la venta ya no esté en este dispositivo."
          action={
            <Button
              variant="primary"
              size="lg"
              icon="history"
              onClick={() => navigate(ROUTES.historial)}
            >
              Ir al historial
            </Button>
          }
        />
      </div>
    )
  }

  const anulada = venta.anulada != null

  const handleReimprimir = () => {
    toast({
      message: 'Pronto podrás reimprimir',
      variant: 'info',
      icon: 'print',
    })
  }

  const handleAnular = async (motivo: MotivoAnulacion, texto?: string) => {
    if (!anuladaPor) {
      setAnularError('No hay sesión activa para anular')
      return
    }
    setSubmitting(true)
    setAnularError(null)
    try {
      await ventasRepo.anular(venta.id, {
        motivo,
        texto,
        por: anuladaPor,
      })
      setSheetOpen(false)
      void syncVentasPendientes()
    } catch (err) {
      setAnularError(
        err instanceof Error ? err.message : 'No se pudo anular la venta',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex flex-1 flex-col gap-3 px-gutter py-4">
        {venta.anulada ? (
          <AnulacionBanner
            motivo={etiquetaMotivoAnulacion(venta.anulada)}
            meta={`Anulada por ${venta.anulada.por} · ${formatAnuladaEn(new Date(venta.anulada.en))}`}
          />
        ) : null}

        <DetalleVentaEncabezado
          recibo={venta.recibo}
          fecha={venta.fecha}
          registradaPor={venta.registradaPor}
          sincronizada={venta.sincronizada}
          anulada={anulada}
        />

        <DetalleVentaItems
          items={venta.items}
          total={venta.total}
          anulada={anulada}
        />

        <DetalleVentaPago
          medioPago={venta.medioPago}
          pagaCon={venta.pagaCon}
          vueltas={venta.vueltas}
        />
      </div>

      <BottomActionBar className="sticky bottom-0">
        <Button
          variant="secondary"
          size="lg"
          icon="print"
          className="min-w-0 flex-[1.2]"
          onClick={handleReimprimir}
        >
          Reimprimir recibo
        </Button>
        {!anulada ? (
          <Button
            variant="danger"
            size="lg"
            icon="block"
            className="min-w-0 flex-1"
            onClick={() => {
              setAnularError(null)
              setSheetOpen(true)
            }}
          >
            Anular venta
          </Button>
        ) : null}
      </BottomActionBar>

      {!anulada ? (
        <AnularVentaSheet
          open={sheetOpen}
          onOpenChange={(open) => {
            setSheetOpen(open)
            if (!open) setAnularError(null)
          }}
          recibo={venta.recibo}
          total={venta.total}
          submitting={submitting}
          error={anularError}
          onConfirm={(motivo, texto) => {
            void handleAnular(motivo, texto)
          }}
        />
      ) : null}
    </div>
  )
}
