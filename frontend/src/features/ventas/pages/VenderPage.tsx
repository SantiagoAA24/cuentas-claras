import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { productosRepo } from '../../../data/client'
import { useLiveQuery } from '../../../data/useLiveQuery'
import {
  selectCantidadTotal,
  selectIsEmpty,
  selectPedidoItems,
  selectTotalPesos,
  usePedidoStore,
} from '../../../stores/pedidoStore'
import { useSessionStore } from '../../../stores/sessionStore'
import {
  CategoriaChips,
  type FiltroCategoria,
} from '../components/CategoriaChips'
import { CobroSheet } from '../components/CobroSheet'
import { PedidoPanel } from '../components/PedidoPanel'
import { ProductosGrid } from '../components/ProductosGrid'
import { useCobroState } from '../hooks/useCobroState'

/** Vender · 1a / 1b + cobro 2a / 2b / 2c. */
export function VenderPage() {
  const [categoria, setCategoria] = useState<FiltroCategoria>('Todas')

  const productos = useLiveQuery(
    () => productosRepo.listar({ soloActivos: true }),
    [],
  )

  const items = usePedidoStore(useShallow(selectPedidoItems))
  const cantidadTotal = usePedidoStore(selectCantidadTotal)
  const totalPesos = usePedidoStore(selectTotalPesos)
  const empty = usePedidoStore(selectIsEmpty)
  const expanded = usePedidoStore((s) => s.expanded)
  const quantities = usePedidoStore((s) => s.items)
  const add = usePedidoStore((s) => s.add)
  const increment = usePedidoStore((s) => s.increment)
  const decrement = usePedidoStore((s) => s.decrement)
  const remove = usePedidoStore((s) => s.remove)
  const clear = usePedidoStore((s) => s.clear)
  const toggleExpanded = usePedidoStore((s) => s.toggleExpanded)

  const registradaPor = useSessionStore((s) => s.user?.nombre ?? '')

  const cobro = useCobroState()

  function handleCobrar() {
    if (empty) return
    cobro.openCobro(items, totalPesos, cantidadTotal)
  }

  function handleRegistrada() {
    clear()
  }

  return (
    <div className="relative flex min-h-full flex-col pb-panel-pedido">
      <CategoriaChips value={categoria} onChange={setCategoria} />
      <div className="pb-4">
        <ProductosGrid
          productos={productos}
          categoria={categoria}
          cantidadDe={(id) => quantities[id]?.cantidad ?? 0}
          onAdd={add}
        />
      </div>

      <PedidoPanel
        items={items}
        cantidadTotal={cantidadTotal}
        totalPesos={empty ? 0 : totalPesos}
        expanded={expanded}
        onToggle={toggleExpanded}
        onClear={clear}
        onIncrement={increment}
        onDecrement={decrement}
        onRemove={remove}
        onCobrar={handleCobrar}
      />

      {cobro.open ? (
        <CobroSheet
          open={cobro.open}
          onOpenChange={cobro.handleOpenChange}
          paso={cobro.paso}
          total={cobro.snapshot?.total ?? 0}
          cantidadTotal={cobro.snapshot?.cantidadTotal ?? 0}
          medioPago={cobro.medioPago}
          onMedioPagoChange={cobro.setMedioPago}
          pagaDigits={cobro.pagaDigits}
          onPagaDigitsChange={cobro.setPagaDigits}
          bloqueado={cobro.bloqueado}
          submitting={cobro.submitting}
          venta={cobro.venta}
          printStatus={cobro.printStatus}
          retrying={cobro.retrying}
          onCobrarConImpresion={() =>
            void cobro.cobrar(true, registradaPor, handleRegistrada)
          }
          onCobrarSinImpresion={() =>
            void cobro.cobrar(false, registradaPor, handleRegistrada)
          }
          onNuevaVenta={cobro.closeCobro}
          onReintentarImpresion={() => void cobro.reintentarImpresion()}
          onContinuarSinImprimir={cobro.continuarSinImprimir}
        />
      ) : null}
    </div>
  )
}
