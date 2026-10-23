import type { FormEvent } from 'react'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { PasswordField } from '../../../components/ui/PasswordField'
import { TextField } from '../../../components/ui/TextField'

type LoginFormProps = {
  usuario: string
  password: string
  error: boolean
  loading: boolean
  onUsuarioChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: () => void
}

/** Panel inferior del login: campos, banner 7b e Ingresar. */
export function LoginForm({
  usuario,
  password,
  error,
  loading,
  onUsuarioChange,
  onPasswordChange,
  onSubmit,
}: LoginFormProps) {
  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex shrink-0 flex-col gap-3.5 rounded-t-lg bg-superficie px-gutter pt-6 pb-7 shadow-panel"
    >
      <TextField
        label="Usuario"
        name="username"
        autoComplete="username"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        placeholder="Tu usuario"
        value={usuario}
        invalid={error}
        disabled={loading}
        onChange={(e) => onUsuarioChange(e.target.value)}
      />

      <PasswordField
        label="Contraseña"
        name="password"
        autoComplete="current-password"
        placeholder="Tu contraseña"
        value={password}
        invalid={error}
        disabled={loading}
        onChange={(e) => onPasswordChange(e.target.value)}
      />

      {error ? (
        <Card variant="alert-danger" padding="sm">
          Usuario o contraseña incorrectos
        </Card>
      ) : null}

      <Button
        type="submit"
        variant="primary"
        size="cta"
        fullWidth
        className="mt-1"
        loading={loading}
        loadingLabel="Ingresando…"
      >
        Ingresar
      </Button>
    </form>
  )
}
