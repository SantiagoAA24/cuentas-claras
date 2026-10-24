import { configuracionRepo } from '../../data/client'
import { syncPullApi, syncPushApi } from '../api'
import { db, type EntradaColaSync } from '../db'
import { aplicarPull } from './applyPull'
import { asegurarDispositivo } from './dispositivo'
import { cambioDesdeEntrada } from './payloads'

const LOTE_PUSH = 50
const LIMITE_PULL = 100
const BACKOFF_INICIAL_MS = 1000
const BACKOFF_MAX_MS = 60_000

let syncing = false
/** Si llega otra petición mientras corre, repetir al terminar. */
let rerun = false
let backoffMs = BACKOFF_INICIAL_MS
let nextAllowedAt = 0

export type SyncResultado = {
  /** Cambios confirmados (aplicado / ya_existia) en esta corrida. */
  confirmados: number
  error?: string
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function leerPendientes(limite: number): Promise<EntradaColaSync[]> {
  const todas = await db.colaSync
    .where('estado')
    .equals('pendiente')
    .sortBy('creadoEn')
  return todas.slice(0, limite)
}

async function aplicarResultadosPush(
  entradas: EntradaColaSync[],
  resultados: {
    id: string
    estado: string
    codigo?: string | null
    mensaje?: string | null
    aviso?: { codigo: string; mensaje: string } | null
  }[],
): Promise<number> {
  const porId = new Map(resultados.map((r) => [r.id, r]))
  let confirmados = 0

  await db.transaction('rw', db.colaSync, db.ventas, async () => {
    for (const entrada of entradas) {
      const r = porId.get(entrada.id)
      if (!r) continue

      if (r.estado === 'aplicado' || r.estado === 'ya_existia') {
        await db.colaSync.delete(entrada.id)
        confirmados += 1

        if (
          entrada.operacion === 'venta.registrar' ||
          entrada.operacion === 'venta.anular'
        ) {
          const venta = await db.ventas.get(entrada.entidadId)
          if (venta) {
            venta.sincronizada = true
            if (r.aviso?.codigo === 'recibo_duplicado') {
              venta.conflictoRecibo = true
            }
            await db.ventas.put(venta)
          }
        }
      } else if (r.estado === 'rechazado') {
        entrada.estado = 'error'
        entrada.intentos += 1
        entrada.ultimoIntentoEn = new Date().toISOString()
        entrada.ultimoError = r.mensaje ?? r.codigo ?? 'rechazado'
        await db.colaSync.put(entrada)
      }
    }
  })

  return confirmados
}

async function pushLotes(dispositivoId: string): Promise<number> {
  let total = 0
  for (;;) {
    const lote = await leerPendientes(LOTE_PUSH)
    if (lote.length === 0) break

    const res = await syncPushApi({
      dispositivoId,
      cambios: lote.map(cambioDesdeEntrada),
    })
    total += await aplicarResultadosPush(lote, res.resultados)

    if (lote.length < LOTE_PUSH) break
  }
  return total
}

async function pullHastaFecha(
  dispositivoId: string,
  desde: number,
): Promise<number> {
  let cursor = desde
  for (;;) {
    const page = await syncPullApi({
      dispositivoId,
      desde: cursor,
      limite: LIMITE_PULL,
    })
    await aplicarPull(db, {
      productos: page.productos,
      ventas: page.ventas,
      anulaciones: page.anulaciones,
      dispositivo: page.dispositivo,
      cursor: page.cursor,
    })
    cursor = page.cursor
    if (!page.hayMas) break
  }
  return cursor
}

/**
 * Ciclo push → pull. Mutex global; reintentos con espera creciente ante fallos de red.
 * @returns cantidad de cambios confirmados en push (para toast 9c).
 */
export async function sincronizar(): Promise<SyncResultado> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { confirmados: 0 }
  }

  if (syncing) {
    rerun = true
    return { confirmados: 0 }
  }

  const ahora = Date.now()
  if (ahora < nextAllowedAt) {
    return { confirmados: 0 }
  }

  syncing = true
  let confirmados = 0
  try {
    const dispositivo = await asegurarDispositivo()
    const config = await configuracionRepo.obtener()

    confirmados = await pushLotes(dispositivo.id)
    await pullHastaFecha(dispositivo.id, config.sync.cursor)

    if (!config.sync.inicialCompleto) {
      await configuracionRepo.guardarSync({ inicialCompleto: true })
    }

    backoffMs = BACKOFF_INICIAL_MS
    nextAllowedAt = 0
    return { confirmados }
  } catch (err) {
    nextAllowedAt = Date.now() + backoffMs
    backoffMs = Math.min(backoffMs * 2, BACKOFF_MAX_MS)
    const mensaje = err instanceof Error ? err.message : 'Error de sincronización'
    return { confirmados, error: mensaje }
  } finally {
    syncing = false
    if (rerun) {
      rerun = false
      void sincronizar()
    }
  }
}

/**
 * Pull inicial completo (primer arranque). Registra dispositivo y pagina desde 0.
 */
export async function sincronizarInicial(): Promise<SyncResultado> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      confirmados: 0,
      error: 'Necesitas conexión la primera vez',
    }
  }

  if (syncing) {
    rerun = true
    return { confirmados: 0 }
  }

  syncing = true
  try {
    const dispositivo = await asegurarDispositivo()
    // Desde 0 aunque haya cursor parcial fallido.
    await configuracionRepo.guardarSync({ cursor: 0, inicialCompleto: false })
    await pullHastaFecha(dispositivo.id, 0)
    await pushLotes(dispositivo.id)
    await configuracionRepo.guardarSync({ inicialCompleto: true })
    backoffMs = BACKOFF_INICIAL_MS
    nextAllowedAt = 0
    return { confirmados: 0 }
  } catch (err) {
    nextAllowedAt = Date.now() + backoffMs
    backoffMs = Math.min(backoffMs * 2, BACKOFF_MAX_MS)
    const mensaje =
      err instanceof Error ? err.message : 'No se pudo preparar el dispositivo'
    return { confirmados: 0, error: mensaje }
  } finally {
    syncing = false
    if (rerun) {
      rerun = false
      void sincronizar()
    }
  }
}

/** Espera el backoff pendiente (p. ej. reintento manual del gate). */
export async function esperarBackoffSiHaceFalta(): Promise<void> {
  const wait = nextAllowedAt - Date.now()
  if (wait > 0) await sleep(wait)
}

export function isSyncing(): boolean {
  return syncing
}
