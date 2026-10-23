import { Card, SectionTitle } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { UserBadge } from '../../../components/ui/UserBadge'

type ConfigCuentaSectionProps = {
  nombre: string
  onCerrarSesion: () => void
}

/** Usuario de la sesión + cerrar sesión. */
export function ConfigCuentaSection({
  nombre,
  onCerrarSesion,
}: ConfigCuentaSectionProps) {
  return (
    <section className="flex flex-col gap-2.5">
      <SectionTitle>Cuenta</SectionTitle>
      <Card className="flex flex-col gap-3.5">
        <UserBadge
          nombre={nombre}
          size="lg"
          subtitle="Sesión iniciada en este celular"
        />
        <Button
          type="button"
          variant="danger-outline"
          size="lg"
          fullWidth
          icon="logout"
          onClick={onCerrarSesion}
        >
          Cerrar sesión
        </Button>
      </Card>
    </section>
  )
}
