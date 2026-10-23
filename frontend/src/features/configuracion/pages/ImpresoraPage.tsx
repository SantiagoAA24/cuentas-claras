import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { ROUTES } from '../../../app/routes'
import { toast } from '../../../components/ui/Toast'
import { configuracionRepo } from '../../../data/client'
import {
  cancelarBusqueda,
  conectarDispositivo,
  imprimirPrueba,
  iniciarBusqueda,
  type ImpresoraDispositivo,
  type ImpresoraEncontrada,
} from '../../../lib/impresora'
import { EmparejarBuscando } from '../components/EmparejarBuscando'
import { EmparejarConectada } from '../components/EmparejarConectada'
import { EmparejarInstrucciones } from '../components/EmparejarInstrucciones'
import type { EmparejarFase } from '../lib/emparejarFases'

/** Emparejar impresora · 6c / 6d / 6e. */
export function ImpresoraPage() {
  const navigate = useNavigate()
  const [fase, setFase] = useState<EmparejarFase>('instrucciones')
  const [devices, setDevices] = useState<ImpresoraEncontrada[]>([])
  const [conectada, setConectada] = useState<ImpresoraDispositivo | null>(null)
  const [connectingId, setConnectingId] = useState<string | null>(null)
  const [imprimiendo, setImprimiendo] = useState(false)
  const pickingRef = useRef(false)

  useEffect(() => {
    return () => {
      cancelarBusqueda()
    }
  }, [])

  async function persistAndDone(device: ImpresoraDispositivo) {
    if (pickingRef.current) return
    pickingRef.current = true
    setConnectingId(device.id)
    try {
      await conectarDispositivo(device)
      await configuracionRepo.guardar({
        impresora: { id: device.id, nombre: device.nombre },
      })
      setConectada(device)
      setFase('conectada')
    } catch {
      toast({
        message: 'No se pudo conectar la impresora',
        variant: 'error',
      })
      setFase('instrucciones')
    } finally {
      setConnectingId(null)
      pickingRef.current = false
    }
  }

  function handleBuscar() {
    setDevices([])
    setFase('buscando')
    iniciarBusqueda({
      onDevices: setDevices,
      onDevicePicked: (device) => {
        void persistAndDone(device)
      },
    })
  }

  function handleCancelar() {
    cancelarBusqueda()
    setDevices([])
    setConnectingId(null)
    pickingRef.current = false
    setFase('instrucciones')
  }

  function handleConectar(device: ImpresoraEncontrada) {
    void persistAndDone(device)
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

  if (fase === 'buscando') {
    return (
      <EmparejarBuscando
        devices={devices}
        connectingId={connectingId}
        onConectar={handleConectar}
        onCancelar={handleCancelar}
      />
    )
  }

  if (fase === 'conectada' && conectada) {
    return (
      <EmparejarConectada
        nombre={conectada.nombre}
        imprimiendo={imprimiendo}
        onImprimirPrueba={() => void handleImprimirPrueba()}
        onListo={() => navigate(ROUTES.configuracion)}
      />
    )
  }

  return <EmparejarInstrucciones onBuscar={handleBuscar} />
}
