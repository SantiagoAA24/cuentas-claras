import { useEffect, useState } from 'react'
import { BottomSheet } from '../../../components/ui/BottomSheet'
import { Button } from '../../../components/ui/Button'
import { MoneyField } from '../../../components/ui/MoneyField'
import { SegmentedControl } from '../../../components/ui/SegmentedControl'
import { SwitchRow } from '../../../components/ui/Switch'
import { TextField } from '../../../components/ui/TextField'
import type { Categoria, Producto } from '../../../domain/types'
import {
  productoFormEsValido,
  validarProductoForm,
} from '../lib/validarProductoForm'

export type ProductoFormDraft = {
  nombre: string
  precio: number | null
  categoria: Categoria
  activo: boolean
}

const CATEGORIA_OPTIONS: { value: Categoria; label: string }[] = [
  { value: 'Arepas', label: 'Arepas' },
  { value: 'Bebidas', label: 'Bebidas' },
  { value: 'Adicionales', label: 'Adicionales' },
]

const BLANK: ProductoFormDraft = {
  nombre: '',
  precio: null,
  categoria: 'Arepas',
  activo: true,
}

function draftFromProducto(producto: Producto): ProductoFormDraft {
  return {
    nombre: producto.nombre,
    precio: producto.precio,
    categoria: producto.categoria,
    activo: producto.activo,
  }
}

type ProductoFormSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** null = nuevo producto; Producto = edición. */
  producto: Producto | null
  submitting?: boolean
  onSave: (draft: ProductoFormDraft) => void
}

export function ProductoFormSheet({
  open,
  onOpenChange,
  producto,
  submitting = false,
  onSave,
}: ProductoFormSheetProps) {
  const esEdicion = producto != null
  const [draft, setDraft] = useState<ProductoFormDraft>(BLANK)
  const [tried, setTried] = useState(false)

  useEffect(() => {
    if (!open) return
    setDraft(producto != null ? draftFromProducto(producto) : BLANK)
    setTried(false)
  }, [open, producto])

  const errors = tried ? validarProductoForm(draft) : {}
  const nombreError = errors.nombre
  const precioError = errors.precio

  function handleSave() {
    const nextErrors = validarProductoForm(draft)
    if (!productoFormEsValido(nextErrors)) {
      setTried(true)
      return
    }
    onSave({
      ...draft,
      nombre: draft.nombre.trim(),
    })
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={esEdicion ? 'Editar producto' : 'Nuevo producto'}
      showClose
      dismissible={!submitting}
      footer={
        <Button
          variant="primary"
          size="cta"
          fullWidth
          icon="check"
          loading={submitting}
          loadingLabel="Guardando…"
          disabled={submitting}
          onClick={handleSave}
        >
          Guardar
        </Button>
      }
    >
      <div className="flex flex-col gap-3.5 pb-1">
        <TextField
          label="Nombre"
          value={draft.nombre}
          onChange={(e) =>
            setDraft((d) => ({ ...d, nombre: e.target.value }))
          }
          placeholder="Ej. Arepa de huevo"
          error={nombreError}
          disabled={submitting}
          autoComplete="off"
        />

        <MoneyField
          label="Precio"
          value={draft.precio}
          onChange={(precio) => setDraft((d) => ({ ...d, precio }))}
          error={precioError}
          disabled={submitting}
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-label font-extrabold text-tostado-700">
            Categoría
          </span>
          <SegmentedControl
            variant="segmented"
            aria-label="Categoría"
            options={CATEGORIA_OPTIONS}
            value={draft.categoria}
            onChange={(value) =>
              setDraft((d) => ({ ...d, categoria: value as Categoria }))
            }
          />
        </div>

        <SwitchRow
          label="Activo"
          description={
            draft.activo
              ? 'Se muestra en la pantalla de venta'
              : 'Oculto en la pantalla de venta'
          }
          checked={draft.activo}
          onCheckedChange={(activo) => setDraft((d) => ({ ...d, activo }))}
          disabled={submitting}
        />
      </div>
    </BottomSheet>
  )
}
