import { useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Fab } from '../../../components/ui/Fab'
import { ProductosListSkeleton } from '../../../components/ui/ProductosListSkeleton'
import { productosRepo } from '../../../data/client'
import { useLiveQuery } from '../../../data/useLiveQuery'
import type { Producto } from '../../../domain/types'
import {
  ProductoFormSheet,
  type ProductoFormDraft,
} from '../components/ProductoFormSheet'
import { ProductosFiltros } from '../components/ProductosFiltros'
import { ProductosLista } from '../components/ProductosLista'
import {
  filtrarProductos,
  type FiltroCategoriaProductos,
} from '../lib/filtrarProductos'

/** Productos · 5a (lista) / 5b (nuevo) / 5c (editar). */
export function ProductosPage() {
  const productos = useLiveQuery(() => productosRepo.listar(), [])

  const [query, setQuery] = useState('')
  const [categoria, setCategoria] =
    useState<FiltroCategoriaProductos>('Todas')
  const [sheetOpen, setSheetOpen] = useState(false)
  /** null = modo nuevo; Producto = edición. Se conserva al cerrar para no parpadear el título. */
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function openNuevo() {
    setEditingProducto(null)
    setSheetOpen(true)
  }

  function openEditar(producto: Producto) {
    setEditingProducto(producto)
    setSheetOpen(true)
  }

  function handleSheetOpenChange(open: boolean) {
    if (!open && !submitting) {
      setSheetOpen(false)
    }
  }

  async function handleToggleActivo(producto: Producto, activo: boolean) {
    if (activo) {
      await productosRepo.activar(producto.id)
    } else {
      await productosRepo.desactivar(producto.id)
    }
  }

  async function handleSave(draft: ProductoFormDraft) {
    if (submitting) return
    setSubmitting(true)
    try {
      const payload = {
        nombre: draft.nombre,
        precio: draft.precio!,
        categoria: draft.categoria,
        activo: draft.activo,
      }
      if (editingProducto != null) {
        await productosRepo.actualizar(editingProducto.id, payload)
      } else {
        await productosRepo.crear(payload)
      }
      setSheetOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  if (productos === undefined) {
    return (
      <div className="px-gutter py-3">
        <ProductosListSkeleton />
      </div>
    )
  }

  const catalogoVacio = productos.length === 0
  const filtrados = filtrarProductos(productos, { categoria, query })

  return (
    <div className="relative flex min-h-full flex-col">
      {catalogoVacio ? (
        <div className="flex min-h-full flex-col px-gutter py-4">
          <EmptyState
            illustrated
            className="flex-1 justify-center"
            icon="inventory_2"
            title="Aún no hay productos"
            description="Agrega arepas, bebidas y adicionales para venderlos desde la pestaña Vender."
            action={
              <Button
                variant="primary"
                size="lg"
                icon="add"
                onClick={openNuevo}
              >
                Agregar producto
              </Button>
            }
          />
        </div>
      ) : (
        <div className="flex flex-col gap-0 px-gutter pt-3 pb-fab">
          <ProductosFiltros
            query={query}
            onQueryChange={setQuery}
            categoria={categoria}
            onCategoriaChange={setCategoria}
          />
          <ProductosLista
            productos={filtrados}
            onEdit={openEditar}
            onToggleActivo={(producto, activo) => {
              void handleToggleActivo(producto, activo)
            }}
          />
        </div>
      )}

      <Fab
        aria-label="Agregar producto"
        onClick={openNuevo}
        className="fixed right-gutter bottom-[calc(var(--spacing-navbar-safe)+1rem)] z-30"
      />

      <ProductoFormSheet
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        producto={editingProducto}
        submitting={submitting}
        onSave={(draft) => {
          void handleSave(draft)
        }}
      />
    </div>
  )
}
