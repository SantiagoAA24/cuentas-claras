import { useNavigate } from 'react-router'
import { ROUTES } from '../../../app/routes'
import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { HistorialSkeleton } from '../../../components/ui/HistorialSkeleton'
import { ventasRepo } from '../../../data/client'
import { useLiveQuery } from '../../../data/useLiveQuery'
import { resumenDia } from '../../../domain/resumenDia'
import { HistorialHeader } from '../components/HistorialHeader'
import { ResumenDiaCard } from '../components/ResumenDiaCard'
import { VentasDelDiaList } from '../components/VentasDelDiaList'

/** Historial · 3a (con ventas) / 3b (vacío). */
export function HistorialPage() {
  const navigate = useNavigate()
  const ventas = useLiveQuery(() => ventasRepo.listarDelDia(), [])

  if (ventas === undefined) {
    return (
      <div className="px-gutter py-4">
        <HistorialSkeleton />
      </div>
    )
  }

  if (ventas.length === 0) {
    return (
      <div className="flex min-h-full flex-col px-gutter py-4">
        <HistorialHeader />
        <EmptyState
          illustrated
          className="flex-1 justify-center"
          icon="receipt_long"
          title="Aún no hay ventas hoy"
          description="Las ventas que registres aparecerán aquí con su recibo y medio de pago."
          action={
            <Button
              variant="primary"
              size="lg"
              icon="point_of_sale"
              onClick={() => navigate(ROUTES.vender)}
            >
              Ir a Vender
            </Button>
          }
        />
      </div>
    )
  }

  const resumen = resumenDia(ventas)

  return (
    <div className="flex flex-col gap-4 px-gutter py-4">
      <HistorialHeader />
      <ResumenDiaCard resumen={resumen} />
      <VentasDelDiaList ventas={ventas} />
    </div>
  )
}
