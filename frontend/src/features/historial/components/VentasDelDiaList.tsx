import { ROUTES } from '../../../app/routes'
import { Card, SectionTitle } from '../../../components/ui/Card'
import { VentaListItem } from '../../../components/ui/VentaListItem'
import type { Venta } from '../../../domain/types'
import { formatHora } from '../../../lib/format'
import { resumenItemsLabel } from '../lib/resumenLabel'

type VentasDelDiaListProps = {
  ventas: Venta[]
}

/** Lista cronológica de ventas del día (más reciente arriba). */
export function VentasDelDiaList({ ventas }: VentasDelDiaListProps) {
  return (
    <div className="flex flex-col gap-2">
      <SectionTitle>Ventas</SectionTitle>
      <Card padding="none">
        <Card.List>
          {ventas.map((v) => (
            <VentaListItem
              key={v.id}
              to={ROUTES.historialDetalle(v.id)}
              hora={formatHora(new Date(v.fecha))}
              recibo={v.recibo}
              resumenItems={resumenItemsLabel(v.items)}
              medioPago={v.medioPago}
              total={v.total}
              pendiente={!v.sincronizada}
              anulada={v.anulada != null}
            />
          ))}
        </Card.List>
      </Card>
    </div>
  )
}
