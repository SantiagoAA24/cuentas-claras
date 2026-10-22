import { Button } from '../../../components/ui/Button'
import { useSessionStore } from '../../../stores/sessionStore'

/** Placeholder Login · 7a */
export function LoginPage() {
  const login = useSessionStore((s) => s.login)

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-crema px-gutter">
      <h1 className="text-title font-black text-tostado-700">Cuentas Claras</h1>
      <p className="text-body text-tinta-suave">Login · 7a</p>
      <Button type="button" variant="primary" size="cta" fullWidth onClick={login}>
        Ingresar
      </Button>
    </div>
  )
}
