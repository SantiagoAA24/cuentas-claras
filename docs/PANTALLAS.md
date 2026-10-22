# Cuentas Claras — Guía de pantallas

Documento de referencia para construir el frontend a partir de los diseños. PWA para Android, ancho de diseño **390 px**, todo en español de Colombia.

Cada archivo `.dc.html` se abre directamente en el navegador. Dentro, cada estado aparece como un teléfono de 390 × 844 px con una etiqueta (`1a`, `2b`…) que se usa como referencia en este documento. Casi todos los estados son interactivos: se pueden tocar para ver el comportamiento.

---

## 1. Archivos

| Archivo | Contenido | Estados |
|---|---|---|
| `Hoja de Estilo.dc.html` | Sistema visual: colores, tipografía, botones, campos, chips, tarjetas, barras | — |
| `Login.dc.html` | Inicio de sesión | 7a, 7b |
| `Vender.dc.html` | Pantalla de venta + hoja de cobro | 1a, 1b, 2a, 2b, 2c |
| `Historial.dc.html` | Ventas del día | 3a, 3b |
| `Detalle Venta.dc.html` | Detalle, anulación y venta anulada | 4a, 4b, 4c |
| `Productos.dc.html` | Catálogo + formulario crear/editar | 5a, 5b, 5c |
| `Configuracion.dc.html` | Configuración + emparejar impresora | 6a–6e |
| `Recibo.dc.html` | Vista previa del recibo térmico 58 mm | 8a, 8b |
| `Estados Sistema.dc.html` | Conexión, sincronización, fallo de impresión | 9a–9d |
| `tailwind/` | Tokens como tema Tailwind v3 y v4 | — |

---

## 2. Mapa de navegación

```
Login ──► Vender (pestaña por defecto)
            ├─ Cobrar ──► Hoja de cobro ──► Venta exitosa ──► Nueva venta (vuelve a Vender vacío)
            │                          └─► (falla impresora) Diálogo 9d
          Historial ──► Detalle de venta ──► Diálogo de anulación ──► Venta anulada
          Productos ──► Hoja crear/editar producto
          ⚙ (barra superior, en cualquier pestaña) ──► Configuración ──► Emparejar impresora
```

- Barra inferior con 3 pestañas: **Vender**, **Historial**, **Productos**.
- Detalle de venta, Configuración y Emparejar impresora son pantallas apiladas: tienen flecha atrás y **no** muestran la barra inferior.
- Login no muestra barras. La sesión queda guardada; se sale desde Configuración → Cerrar sesión.

---

## 3. Convenciones globales

**Principios**
- Una venta típica en **3 toques**: producto → Cobrar → Cobrar e imprimir.
- Uso con una mano: acciones principales abajo; hojas inferiores (bottom sheets) en lugar de diálogos centrados.
- Nada bloquea la venta: sin conexión o sin impresora la venta se registra igual.

**Medidas**
- Botón mínimo 48 px de alto. Campos y botones secundarios 56 px. Botón primario 60 px.
- Barra superior 64 px. Barra inferior 72 px. Margen lateral 16 px. Radio 12 px.
- Texto mínimo 14 px (excepción: indicadores de 12 px en la barra superior).

**Colores de estado** (ver `tailwind/`)
- Maíz `#F5B400`: acción principal, selección, contadores. Texto encima siempre `#2B1D12`.
- Verde `#1F7A3D`: éxito, sincronizado, vueltas.
- Rojo `#C0322B`: anular, errores, impresora desconectada.
- Naranja `#C25E00`: pendiente, sin conexión.

**Formato**
- Moneda: `$12.500` — punto como separador de miles, sin decimales, cifras tabulares (`font-variant-numeric: tabular-nums`).
- Hora: `12:46 p. m.` Fecha larga: `martes 22 de septiembre`.
- Recibo: `<prefijo>-<consecutivo de 4 dígitos>` → `A-0042`.

```js
const cop = n => '$' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
```

**Componentes compartidos**
- **Barra superior:** "Cuentas Claras" + dos indicadores pequeños (conexión e impresora) + engranaje (48 px). Indicador de conexión: verde "En línea" / naranja "Sin conexión". Impresora: verde `print` / rojo `print_disabled`. Con ventas pendientes se añade la etiqueta naranja "N pendientes".
- **Barra inferior:** 3 pestañas; la activa lleva una píldora maíz detrás del ícono y texto en negrita.
- **Hoja inferior:** fondo blanco, radio 12 px arriba, asa de 40 × 5 px, velo `rgba(43,29,18,.55)`. Tocar el velo cierra (salvo en cobro, que se cierra con la X).
- **Íconos:** Material Symbols Rounded, relleno, peso 500.

---

## 4. Pantallas

### Hoja de Estilo — `Hoja de Estilo.dc.html`
Referencia visual del sistema. Muestra paleta con códigos, escala tipográfica (Nunito), variantes de botón (primario, secundario contorno, tonal, peligro relleno y contorno, deshabilitado), selector de cantidad, campos (normal, enfocado con halo maíz, error), chips (filtro, segmentado de pago, estado), tarjetas (producto, venta, resumen, alerta) y barras superior/inferior.

---

### Login — `Login.dc.html`
- **7a · Normal.** Mitad superior: ilustración de arepa, "Cuentas Claras" y nombre del negocio. Mitad inferior (panel blanco): Usuario, Contraseña con botón ojo (mostrar/ocultar), botón **Ingresar**.
- **7b · Error.** Bordes rojos en ambos campos y mensaje "Usuario o contraseña incorrectos". El error desaparece al volver a escribir.

Implementación: `autocomplete="username"` / `"current-password"`, `autocapitalize="none"` en usuario. Tras ingresar, guardar sesión y abrir Vender.

---

### Vender — `Vender.dc.html`

**Estructura (arriba → abajo):** barra superior · chips de categoría deslizables (Todas, Arepas, Bebidas, Adicionales) · grilla de 2 columnas con tarjetas de producto · panel del pedido fijo sobre la barra inferior · barra inferior.

- **1a · Pedido vacío.** Panel: "Pedido vacío / Toca un producto para agregarlo", total $0 en gris, **Cobrar** deshabilitado.
- **1b · Con productos, panel expandido.** Lista de ítems con − / + (48 px); cuando la cantidad es 1, el − se convierte en ícono rojo de borrar. Botón **Vaciar** (contorno rojo). El resto de la pantalla se oscurece; tocar el velo o "Ocultar pedido" colapsa.

**Comportamiento**
- Tocar tarjeta = +1 unidad. La tarjeta se tiñe (`#FFF4CC`, borde maíz) y muestra contador circular arriba a la derecha.
- Panel colapsado: "N productos", total grande (36 px), enlace "Ver pedido ⌃", botón Cobrar.
- Solo se muestran productos **activos**. Categoría sin productos muestra mensaje vacío.
- Al quedar vacío el pedido, el panel se colapsa solo.

**Hoja de cobro** (al tocar Cobrar)
- **2a · Efectivo.** Total muy grande (52 px) · 4 medios de pago en grilla 2×2 (Efectivo, Nequi, Daviplata, Transferencia; uno a la vez) · campo **Paga con** · montos rápidos en una fila ($10 mil, $20 mil, $50 mil, $100 mil, Exacto) · franja de vueltas · teclado numérico propio (1–9, 000, 0, borrar) · **Cobrar e imprimir** · enlace **Cobrar sin imprimir**.
  - Paga con ≥ total → franja verde "Vueltas $X".
  - Paga con < total → franja roja "Monto menor al total. Faltan $X" y ambos botones de cobro deshabilitados.
  - Campo vacío → franja gris "Sin monto: se cobra exacto" (permite cobrar sin escribir, para cumplir los 3 toques).
- **2b · Nequi (o cualquier medio digital).** Sin campo ni teclado; aviso "Confirma que el pago de $X llegó a Nequi antes de cobrar".
- **2c · Venta exitosa.** Check verde, "Venta registrada", recibo A-0042, total, medio de pago, pagó con y vueltas (solo efectivo con vueltas > 0), estado de impresión ("Recibo impreso" / "Guardada sin imprimir"), botón **Nueva venta** que limpia el pedido.

**Orden de operaciones al cobrar:** 1) guardar venta localmente con su consecutivo, 2) mostrar éxito, 3) intentar imprimir, 4) sincronizar en segundo plano. Si la impresión falla, ver 9d.

---

### Historial — `Historial.dc.html`
- **3a · Con ventas.** Encabezado "Hoy · martes 22 de septiembre". Tarjeta resumen tostada: total vendido (48 px), "8 ventas · 1 anulada (no suman)", desglose por los 4 medios con monto y cantidad. Debajo, lista cronológica (más reciente arriba).
  - Fila: hora + recibo (mono) + nube naranja si está pendiente · resumen corto de productos ("2 queso, 1 gaseosa") · ícono y nombre del medio de pago · total a la derecha.
  - Anulada: productos y total tachados en gris, etiqueta roja "Anulada", fondo levemente crema. **No suma** al total ni al desglose.
  - Toda la fila es tocable → Detalle de venta.
- **3b · Vacío.** Ilustración simple (ícono de recibo sobre círculos), "Aún no hay ventas hoy", texto de ayuda y botón **Ir a Vender**.

---

### Detalle de venta — `Detalle Venta.dc.html`
Pantalla apilada con flecha atrás, título "Detalle de venta".

- **4a · Detalle.** Tarjeta encabezado: recibo grande (mono), etiqueta de sincronización, fecha y hora, "Registrada por Carlos" con inicial. Tarjeta de ítems: cantidad (`1×`), nombre, precio unitario "c/u", subtotal; total 40 px al final. Tarjeta de pago: medio con ícono y, si es efectivo, "Pagó con" y "Vueltas" en verde. Barra de acciones fija abajo: **Reimprimir recibo** (secundario) y **Anular venta** (peligro).
- **4b · Diálogo de anulación** (hoja inferior). Ícono de advertencia, "¿Anular la venta A-0042?", "Esta acción no se puede deshacer. La venta de $X dejará de sumar al total del día." Motivo como opciones de radio de 52 px: Error al registrar, Cliente canceló, Producto equivocado, Otro. Si es **Otro**, aparece campo de texto obligatorio. Botones **Cancelar** y **Anular venta** (rojo; deshabilitado hasta tener motivo válido).
- **4c · Venta anulada.** Aviso rojo arriba: etiqueta "Anulada", "Motivo: …", "Anulada por Laura · hoy, 12:24 p. m.". Ítems y total tachados. Solo queda **Reimprimir recibo**.

Datos a guardar en la anulación: `motivo`, `motivoTexto` (si Otro), `anuladaPor`, `anuladaEn`.

---

### Productos — `Productos.dc.html`
- **5a · Lista.** Buscador (filtra por nombre) · chips de categoría · lista en una tarjeta: nombre, categoría, precio y **interruptor** Activo/Inactivo (verde encendido). Inactivos: opacidad 50 %, fondo crema y texto "Inactivo · no aparece en Vender". Botón flotante **+** (64 px, maíz) abajo a la derecha, sobre la barra inferior. Tocar la fila (no el interruptor) abre la edición.
- **5b · Nuevo producto con validaciones** (hoja inferior). Campos: Nombre, Precio (teclado numérico, prefijo $, puntos de miles automáticos), Categoría (segmentado de 3: Arepas, Bebidas, Adicionales), fila Activo con interruptor y ayuda, botón **Guardar**.
  - Errores visibles solo después de intentar guardar: "El nombre es obligatorio", "El precio debe ser mayor a $0" (borde rojo + mensaje con ícono).
- **5c · Editar producto.** Mismo formulario con título "Editar producto" y datos cargados.

Precio: guardar como entero en pesos; en el campo solo se aceptan dígitos (máx. 7).

---

### Configuración — `Configuracion.dc.html`
Pantalla apilada desde el engranaje. Secciones:

1. **Impresora:** estado con ícono (Conectada verde / Desconectada rojo) y nombre del dispositivo; **Buscar impresora**; **Imprimir prueba**.
2. **Negocio:** Nombre del negocio, Cédula o NIT, Pie del recibo. Se guarda automáticamente ("Los cambios se guardan solos").
3. **Dispositivo:** Prefijo del consecutivo (solo lectura, ej. "A") con explicación, y Último recibo emitido.
4. **Cuenta:** usuario actual con inicial y **Cerrar sesión** (contorno rojo).

- **6a · Impresora conectada.** Buscar e Imprimir prueba como secundarios.
- **6b · Impresora desconectada.** Buscar impresora pasa a primario; Imprimir prueba deshabilitado; "Última usada: …".

**Emparejar impresora** (pantalla apilada)
- **6c · Instrucciones.** Ilustración, "Enciende la impresora y mantenla cerca", 3 pasos numerados, botón **Buscar impresora**.
- **6d · Buscando.** Ícono Bluetooth con ondas animadas, "Buscando impresoras…", lista "Encontradas" (cada una con **Conectar**), fila con indicador giratorio "Buscando más dispositivos", botón **Cancelar**.
- **6e · Conectada.** Check verde, "Impresora conectada", tarjeta del dispositivo, **Imprimir prueba** y **Listo**.

Implementación: Web Bluetooth (`navigator.bluetooth.requestDevice`) para impresoras ESC/POS. Guardar el dispositivo y reconectar automáticamente al abrir la app.

---

### Recibo — `Recibo.dc.html`
Vista previa del recibo térmico de 58 mm, **32 caracteres por línea**, solo texto negro, monoespaciado.

Orden: nombre del negocio centrado en mayúsculas (negrita) · cédula/NIT · "No responsable de IVA" · separador · "Recibo de venta A-0042" (negrita) · fecha y hora · atendido por · separador · ítems (cantidad, nombre, subtotal alineado a la derecha; nombres largos continúan en la línea siguiente) · separador · **TOTAL a doble tamaño** (16 caracteres por línea) · medio de pago · paga con y vueltas (solo efectivo) · separador · pie del recibo · 2 líneas de avance.

- **8a · Efectivo con vueltas.**
- **8b · Pago digital con nombre largo** (muestra el salto de línea).

Nunca debe decir "Factura de venta". La función `build()` del archivo genera las líneas y advierte en consola si alguna excede el ancho; se puede reutilizar para generar el texto ESC/POS (TOTAL con `ESC ! 0x30`, negritas con `ESC E 1`). En Tweaks hay una guía de 32 caracteres.

---

### Estados del sistema — `Estados Sistema.dc.html`
Aplicados sobre Vender. Ninguno bloquea la venta.

- **9a · Sin conexión.** Banner naranja delgado bajo la barra superior: "**Sin conexión** · Las ventas se guardan y se enviarán después". Indicador de conexión naranja. Todo funciona igual.
- **9b · Ventas pendientes.** Etiqueta naranja "3 pendientes" con nube junto al engranaje. En Historial y Detalle cada venta pendiente lleva la nube naranja.
- **9c · Sincronización completa.** Toast verde "Ventas sincronizadas" sobre el panel del pedido; desaparece a los ~3 s. Indicador pasa a "Sincronizado".
- **9d · Impresora desconectada al cobrar.** Hoja inferior: "No se pudo imprimir" + confirmación verde "La venta quedó registrada.", recibo y total, ayuda breve. **Reintentar** (primario) y **Continuar sin imprimir**. El pedido de fondo ya está vacío porque la venta se guardó antes de imprimir.

---

## 5. Modelo de datos sugerido

```ts
type Categoria = 'Arepas' | 'Bebidas' | 'Adicionales';
type MedioPago = 'Efectivo' | 'Nequi' | 'Daviplata' | 'Transferencia';

interface Producto { id: string; nombre: string; precio: number; categoria: Categoria; activo: boolean; }

interface ItemVenta { productoId: string; nombre: string; precioUnitario: number; cantidad: number; }

interface Venta {
  id: string;
  recibo: string;            // 'A-0042'
  fecha: string;             // ISO
  registradaPor: string;     // 'Carlos' | 'Laura'
  items: ItemVenta[];
  total: number;
  medioPago: MedioPago;
  pagaCon?: number;          // solo efectivo
  vueltas?: number;
  impreso: boolean;
  sincronizada: boolean;
  anulada?: { motivo: string; texto?: string; por: string; en: string; };
}

interface Configuracion {
  negocio: { nombre: string; documento: string; pieRecibo: string; };
  dispositivo: { prefijo: string; ultimoConsecutivo: number; };
  impresora?: { nombre: string; id: string; };
}
```

Guardar nombre y precio en cada `ItemVenta` para que cambios posteriores en Productos no alteren ventas pasadas. Persistencia local (IndexedDB) + cola de sincronización.

---

## 6. Decisiones pendientes

- Medios de pago definitivos (se usaron los 4 solicitados).
- Si se necesita cambiar rápidamente de usuario (Carlos/Laura) en el mismo celular; hoy se asume el usuario de la sesión.
- Si **Vaciar** pedido debe pedir confirmación.
- Nombre, documento y pie reales del negocio (se usó "Arepas La Esquina" como ejemplo).
- Pantalla de detalle para ventas pendientes con error de sincronización (no diseñada).
