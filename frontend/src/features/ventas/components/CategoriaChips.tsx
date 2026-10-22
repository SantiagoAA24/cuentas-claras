import { ChipGroup } from '../../../components/ui/Chip'
import type { Categoria } from '../../../domain/types'

export type FiltroCategoria = 'Todas' | Categoria

const OPCIONES: FiltroCategoria[] = [
  'Todas',
  'Arepas',
  'Bebidas',
  'Adicionales',
]

type CategoriaChipsProps = {
  value: FiltroCategoria
  onChange: (value: FiltroCategoria) => void
}

export function CategoriaChips({ value, onChange }: CategoriaChipsProps) {
  return (
    <ChipGroup
      options={OPCIONES}
      value={value}
      onChange={(next) => onChange(next as FiltroCategoria)}
      className="px-gutter py-3"
    />
  )
}
