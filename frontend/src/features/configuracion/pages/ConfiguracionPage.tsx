import { Link, useNavigate } from 'react-router'
import { ROUTES } from '../../../app/routes'
import { Button } from '../../../components/ui/Button'
import { useSessionStore } from '../../../stores/sessionStore'

/** Placeholder Configuración · 6a */
export function ConfiguracionPage() {
  const logout = useSessionStore((s) => s.logout)
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-4 px-gutter py-4">
      <h1 className="text-title-sm font-black text-tostado-700">
        Configuración · 6a
      </h1>
      <Link
        to={ROUTES.impresora}
        className="text-body font-extrabold text-tostado-500 underline underline-offset-enlace"
      >
        Emparejar impresora
      </Link>
      <Button
        type="button"
        variant="danger-outline"
        fullWidth
        onClick={() => {
          logout()
          navigate(ROUTES.login, { replace: true })
        }}
      >
        Cerrar sesión
      </Button>
    </div>
  )
}
