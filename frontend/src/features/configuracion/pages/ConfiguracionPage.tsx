import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ROUTES } from '../../../app/routes'
import { ConfiguracionSkeleton } from '../../../components/ui/ConfiguracionSkeleton'
import { toast } from '../../../components/ui/Toast'
import { authRepo, configuracionRepo } from '../../../data/client'
import { useLiveQuery } from '../../../data/useLiveQuery'
import { imprimirPrueba, useImpresoraStore } from '../../../lib/impresora'
import { useSessionStore } from '../../../stores/sessionStore'
import { ConfigCuentaSection } from '../components/ConfigCuentaSection'
import { ConfigDispositivoSection } from '../components/ConfigDispositivoSection'
import { ConfigImpresoraSection } from '../components/ConfigImpresoraSection'
import { ConfigNegocioSection } from '../components/ConfigNegocioSection'
import type { NegocioPatch } from '../lib/autoGuardarNegocio'

/** Configuración · 6a (conectada) / 6b (desconectada). */
export function ConfiguracionPage() {
  const navigate = useNavigate()
  const user = useSessionStore((s) => s.user)
  const logout = useSessionStore((s) => s.logout)
  const refreshToken = useSessionStore((s) => s.refreshToken)
  const connected = useImpresoraStore((s) => s.connected)
  const deviceRuntime = useImpresoraStore((s) => s.device)

  const config = useLiveQuery(() => configuracionRepo.obtener(), [])
  const [imprimiendo, setImprimiendo] = useState(false)

  if (config === undefined) {
    return <ConfiguracionSkeleton />
  }

  const nombreEmparejada =
    deviceRuntime?.nombre ?? config.impresora?.nombre

  async function handleGuardarNegocio(patch: NegocioPatch) {
    await configuracionRepo.guardar({ negocio: patch })
  }

  async function handleImprimirPrueba() {
    if (imprimiendo) return
    setImprimiendo(true)
    try {
      await imprimirPrueba()
      toast({
        message: 'Prueba enviada a la impresora',
        variant: 'success',
        icon: 'print',
      })
    } catch {
      toast({
        message: 'No se pudo imprimir la prueba',
        variant: 'error',
      })
    } finally {
      setImprimiendo(false)
    }
  }

  async function handleCerrarSesion() {
    await authRepo.cerrarSesion(refreshToken)
    logout()
    navigate(ROUTES.login, { replace: true })
  }

  return (
    <div className="flex flex-col gap-6 px-gutter py-5 pb-8">
      <ConfigImpresoraSection
        connected={connected}
        nombreEmparejada={nombreEmparejada}
        onBuscar={() => navigate(ROUTES.impresora)}
        onImprimirPrueba={() => void handleImprimirPrueba()}
        imprimiendo={imprimiendo}
      />
      <ConfigNegocioSection
        negocio={config.negocio}
        onGuardar={handleGuardarNegocio}
      />
      <ConfigDispositivoSection dispositivo={config.dispositivo} />
      <ConfigCuentaSection
        nombre={user?.nombre ?? 'Usuario'}
        onCerrarSesion={() => {
          void handleCerrarSesion()
        }}
      />
    </div>
  )
}
