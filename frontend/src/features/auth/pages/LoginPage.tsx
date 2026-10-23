import { useState } from 'react'
import { authRepo, configuracionRepo } from '../../../data/client'
import { useLiveQuery } from '../../../data/useLiveQuery'
import { useSessionStore } from '../../../stores/sessionStore'
import { LoginForm } from '../components/LoginForm'
import { LoginHero } from '../components/LoginHero'

/** Login · 7a (normal) / 7b (error). */
export function LoginPage() {
  const login = useSessionStore((s) => s.login)
  const config = useLiveQuery(() => configuracionRepo.obtener(), [])

  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  function clearErrorOnChange() {
    if (error) setError(false)
  }

  async function handleSubmit() {
    if (loading) return
    setLoading(true)
    try {
      const user = await authRepo.login(usuario, password)
      login(user)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-crema">
      <LoginHero nombreNegocio={config?.negocio.nombre} />
      <LoginForm
        usuario={usuario}
        password={password}
        error={error}
        loading={loading}
        onUsuarioChange={(value) => {
          clearErrorOnChange()
          setUsuario(value)
        }}
        onPasswordChange={(value) => {
          clearErrorOnChange()
          setPassword(value)
        }}
        onSubmit={() => {
          void handleSubmit()
        }}
      />
    </div>
  )
}
