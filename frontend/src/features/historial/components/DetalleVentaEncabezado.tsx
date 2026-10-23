import { Card } from '../../../components/ui/Card'
import { StatusChip } from '../../../components/ui/StatusChip'
import { UserBadge } from '../../../components/ui/UserBadge'
import { formatFechaLarga, formatHora } from '../../../lib/format'
import { cn } from '../../../lib/cn'

type DetalleVentaEncabezadoProps = {
  recibo: string
  fecha: string
  registradaPor: string
  sincronizada: boolean
  anulada?: boolean
}

export function DetalleVentaEncabezado({
  recibo,
  fecha,
  registradaPor,
  sincronizada,
  anulada = false,
}: DetalleVentaEncabezadoProps) {
  const fechaDate = new Date(fecha)

  return (
    <Card className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            'font-mono text-title-sm font-medium tabular-nums text-tinta',
            anulada && 'text-tinta-suave line-through',
          )}
        >
          {recibo}
        </span>
        <StatusChip
          status={sincronizada ? 'sincronizado' : 'pendiente'}
          size="sm"
        />
      </div>
      <p className="text-body font-bold text-tinta-suave">
        {formatFechaLarga(fechaDate)} · {formatHora(fechaDate)}
      </p>
      <UserBadge nombre={registradaPor} className="mt-1" />
    </Card>
  )
}
