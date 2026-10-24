/**
 * Humo de sync con dos dispositivos contra el backend local.
 * Uso: node scripts/smoke-sync.mjs
 */
const BASE = process.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

async function api(path, { method = 'GET', token, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status} ${JSON.stringify(data)}`)
  }
  return data
}

async function login(usuario) {
  return api('/api/v1/auth/login', {
    method: 'POST',
    body: { usuario, password: 'arepa12' },
  })
}

async function registrar(token, id) {
  return api('/api/v1/dispositivos/registrar', {
    method: 'POST',
    token,
    body: { id },
  })
}

async function main() {
  const sessionA = await login('carlos')
  const sessionB = await login('laura')
  const idA = crypto.randomUUID()
  const idB = crypto.randomUUID()
  const dispA = await registrar(sessionA.access_token, idA)
  const dispB = await registrar(sessionB.access_token, idB)
  console.log('dispositivos', dispA.prefijo, dispB.prefijo)

  const pullB0 = await api(
    `/api/v1/sync/pull?dispositivo_id=${idB}&desde=0&limite=100`,
    { token: sessionB.access_token },
  )
  console.log(
    'B pull inicial: productos',
    pullB0.productos.length,
    'ventas',
    pullB0.ventas.length,
  )

  const ventaId = crypto.randomUUID()
  const colaId = crypto.randomUUID()
  const consecutivo = dispA.ultimo_consecutivo + 1
  const recibo = `${dispA.prefijo}-${String(consecutivo).padStart(4, '0')}`
  const producto = pullB0.productos[0]
  if (!producto) throw new Error('Sin productos en seed')

  const push = await api('/api/v1/sync/push', {
    method: 'POST',
    token: sessionA.access_token,
    body: {
      dispositivoId: idA,
      cambios: [
        {
          id: colaId,
          operacion: 'venta.registrar',
          entidadId: ventaId,
          payload: {
            id: ventaId,
            recibo,
            fecha: new Date().toISOString(),
            items: [
              {
                productoId: producto.id,
                nombre: producto.nombre,
                precioUnitario: producto.precio,
                cantidad: 1,
              },
            ],
            total: producto.precio,
            medioPago: 'Efectivo',
            pagaCon: producto.precio,
            vueltas: 0,
            impreso: false,
          },
        },
      ],
    },
  })
  console.log('A push', push.resultados[0])

  const pullB1 = await api(
    `/api/v1/sync/pull?dispositivo_id=${idB}&desde=${pullB0.cursor}&limite=100`,
    { token: sessionB.access_token },
  )
  const vista = pullB1.ventas.find((v) => v.id === ventaId)
  if (!vista) throw new Error('B no recibió la venta de A')
  console.log('B vio venta', vista.recibo, vista.total)

  const nuevoPrecio = producto.precio + 500
  const pushPrecio = await api('/api/v1/sync/push', {
    method: 'POST',
    token: sessionA.access_token,
    body: {
      dispositivoId: idA,
      cambios: [
        {
          id: crypto.randomUUID(),
          operacion: 'producto.actualizar',
          entidadId: producto.id,
          payload: {
            id: producto.id,
            nombre: producto.nombre,
            precio: nuevoPrecio,
            categoria: producto.categoria,
            activo: producto.activo,
          },
        },
      ],
    },
  })
  console.log('A precio', pushPrecio.resultados[0])

  const pullB2 = await api(
    `/api/v1/sync/pull?dispositivo_id=${idB}&desde=${pullB1.cursor}&limite=100`,
    { token: sessionB.access_token },
  )
  const prodB = pullB2.productos.find((p) => p.id === producto.id)
  if (!prodB || prodB.precio !== nuevoPrecio) {
    throw new Error('B no recibió el cambio de precio')
  }
  console.log('B precio actualizado', prodB.precio)

  const anulaA = crypto.randomUUID()
  const anulaB = crypto.randomUUID()
  const en = new Date().toISOString()
  const [rA, rB] = await Promise.all([
    api('/api/v1/sync/push', {
      method: 'POST',
      token: sessionA.access_token,
      body: {
        dispositivoId: idA,
        cambios: [
          {
            id: anulaA,
            operacion: 'venta.anular',
            entidadId: ventaId,
            payload: {
              ventaId,
              anulada: { motivo: 'Error al registrar', texto: null, en },
            },
          },
        ],
      },
    }),
    api('/api/v1/sync/push', {
      method: 'POST',
      token: sessionB.access_token,
      body: {
        dispositivoId: idB,
        cambios: [
          {
            id: anulaB,
            operacion: 'venta.anular',
            entidadId: ventaId,
            payload: {
              ventaId,
              anulada: { motivo: 'Cliente canceló', texto: null, en },
            },
          },
        ],
      },
    }),
  ])
  console.log('anulaciones concurrentes', rA.resultados[0].estado, rB.resultados[0].estado)

  console.log('OK smoke-sync')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
