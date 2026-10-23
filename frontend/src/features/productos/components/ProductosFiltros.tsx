import { ChipGroup } from '../../../components/ui/Chip'
import { SearchField } from '../../../components/ui/SearchField'
import type { FiltroCategoriaProductos } from '../lib/filtrarProductos'

const OPCIONES: FiltroCategoriaProductos[] = [
  'Todas',
  'Arepas',
  'Bebidas',
  'Adicionales',
]

type ProductosFiltrosProps = {
  query: string
  onQueryChange: (query: string) => void
  categoria: FiltroCategoriaProductos
  onCategoriaChange: (categoria: FiltroCategoriaProductos) => void
}

export function ProductosFiltros({
  query,
  onQueryChange,
  categoria,
  onCategoriaChange,
}: ProductosFiltrosProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <SearchField
        value={query}
        onChange={onQueryChange}
        placeholder="Buscar producto"
        aria-label="Buscar producto"
      />
      <ChipGroup
        options={OPCIONES}
        value={categoria}
        onChange={(next) => onCategoriaChange(next as FiltroCategoriaProductos)}
        className="pb-2.5"
      />
    </div>
  )
}
