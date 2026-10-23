import { useEffect, useRef, useState } from 'react'
import { Card, SectionTitle } from '../../../components/ui/Card'
import { Icon } from '../../../components/ui/Icon'
import { TextField } from '../../../components/ui/TextField'
import type { Configuracion } from '../../../domain/types'
import {
  createAutoGuardarNegocio,
  type NegocioPatch,
} from '../lib/autoGuardarNegocio'

type ConfigNegocioSectionProps = {
  negocio: Configuracion['negocio']
  onGuardar: (patch: NegocioPatch) => Promise<void>
}

/** Sección Negocio con auto-guardado debounced. */
export function ConfigNegocioSection({
  negocio,
  onGuardar,
}: ConfigNegocioSectionProps) {
  const [nombre, setNombre] = useState(negocio.nombre)
  const [documento, setDocumento] = useState(negocio.documento)
  const [pieRecibo, setPieRecibo] = useState(negocio.pieRecibo)

  const onGuardarRef = useRef(onGuardar)
  onGuardarRef.current = onGuardar

  const autoRef = useRef(
    createAutoGuardarNegocio((patch) => onGuardarRef.current(patch)),
  )

  useEffect(() => {
    const auto = autoRef.current
    return () => {
      void auto.flush()
      auto.cancel()
    }
  }, [])

  function schedule(partial: NegocioPatch) {
    autoRef.current.schedule(partial)
  }

  return (
    <section className="flex flex-col gap-2.5">
      <SectionTitle>Negocio</SectionTitle>
      <Card className="flex flex-col gap-3.5">
        <TextField
          label="Nombre del negocio"
          value={nombre}
          onChange={(e) => {
            const value = e.target.value
            setNombre(value)
            schedule({ nombre: value })
          }}
          autoComplete="organization"
        />
        <TextField
          label="Cédula o NIT"
          value={documento}
          inputMode="numeric"
          onChange={(e) => {
            const value = e.target.value
            setDocumento(value)
            schedule({ documento: value })
          }}
        />
        <TextField
          label="Pie del recibo"
          multiline
          rows={2}
          value={pieRecibo}
          help="Se imprime al final de cada recibo."
          onChange={(e) => {
            const value = e.target.value
            setPieRecibo(value)
            schedule({ pieRecibo: value })
          }}
        />
        <p className="flex items-center gap-1 text-caption font-bold text-exito">
          <Icon name="cloud_done" size={18} />
          Los cambios se guardan solos
        </p>
      </Card>
    </section>
  )
}
