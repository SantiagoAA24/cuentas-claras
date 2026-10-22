import { useNavigate } from 'react-router'
import { ROUTES } from '../app/routes'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-crema px-gutter">
      <h1 className="text-title font-black text-tostado-700">Página no encontrada</h1>
      <p className="text-center text-body text-tinta-suave">
        La ruta que buscas no existe.
      </p>
      <Button
        type="button"
        variant="primary"
        size="cta"
        fullWidth
        onClick={() => navigate(ROUTES.vender)}
      >
        Ir a Vender
      </Button>
    </div>
  )
}
