import { useState, type ChangeEvent, type ReactNode } from 'react'
import { ROUTES } from '../../app/routes'
import { AmountPresetBar } from '../../components/ui/AmountPresetBar'
import { AnulacionBanner } from '../../components/ui/AnulacionBanner'
import {
  BottomNav,
  type BottomNavTab,
} from '../../components/ui/BottomNav'
import { BottomActionBar } from '../../components/ui/BottomActionBar'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { Button } from '../../components/ui/Button'
import { Card, SectionTitle } from '../../components/ui/Card'
import { ChipGroup } from '../../components/ui/Chip'
import { DetalleSkeleton } from '../../components/ui/DetalleSkeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { Fab } from '../../components/ui/Fab'
import { Icon } from '../../components/ui/Icon'
import { IconButton } from '../../components/ui/IconButton'
import { MoneyField } from '../../components/ui/MoneyField'
import { ProductoListItem } from '../../components/ui/ProductoListItem'
import { ProductosListSkeleton } from '../../components/ui/ProductosListSkeleton'
import { SearchField } from '../../components/ui/SearchField'
import { NumericKeypad } from '../../components/ui/NumericKeypad'
import { OfflineBanner } from '../../components/ui/OfflineBanner'
import { PasswordField } from '../../components/ui/PasswordField'
import { ProductCard } from '../../components/ui/ProductCard'
import { QuantityStepper } from '../../components/ui/QuantityStepper'
import { SegmentedControl } from '../../components/ui/SegmentedControl'
import { StatusChip } from '../../components/ui/StatusChip'
import { SuccessMark } from '../../components/ui/SuccessMark'
import { Switch, SwitchRow } from '../../components/ui/Switch'
import { TextField } from '../../components/ui/TextField'
import { Toaster, useToast } from '../../components/ui/Toast'
import { TopBar } from '../../components/ui/TopBar'
import { UserBadge } from '../../components/ui/UserBadge'
import { VentaListItem } from '../../components/ui/VentaListItem'
import { VueltasBanner } from '../../components/ui/VueltasBanner'
import { formatCOP } from '../../lib/format'
import {
  amountToDigits,
  digitsToAmount,
} from '../../lib/moneyDigits'

function DemoLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 font-mono text-caption font-medium text-tinta-suave">
      {children}
    </p>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-title font-black text-tostado-700">{title}</h2>
      {children}
    </section>
  )
}

function DemoCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={
        className ??
        'rounded-lg bg-superficie p-4 shadow-card'
      }
    >
      {children}
    </div>
  )
}

function ColorSwatch({
  name,
  hex,
  className,
  tall,
}: {
  name: string
  hex: string
  className: string
  tall?: boolean
}) {
  return (
    <div className="overflow-hidden rounded-lg bg-superficie shadow-card">
      <div className={`${className} ${tall ? 'h-24' : 'h-12'} w-full`} />
      <div className="flex flex-col gap-0.5 px-3 py-2">
        <span className="text-label font-extrabold text-tinta">{name}</span>
        <span className="font-mono text-caption text-tinta-suave">{hex}</span>
      </div>
    </div>
  )
}

export default function UiKitPage() {
  const { toast } = useToast()

  const [category, setCategory] = useState('todas')
  const [payment, setPayment] = useState('efectivo')
  const [tilePayment, setTilePayment] = useState('efectivo')
  const [radioPayment, setRadioPayment] = useState('efectivo')
  const [stepperQty, setStepperQty] = useState(2)
  const [stepperRemovable, setStepperRemovable] = useState(1)
  const [productQty, setProductQty] = useState(0)
  const [productQty2, setProductQty2] = useState(3)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [switchOn, setSwitchOn] = useState(true)
  const [switchRowOn, setSwitchRowOn] = useState(false)
  const [keypadDigits, setKeypadDigits] = useState('15000')
  const [moneyValue, setMoneyValue] = useState<number | null>(15000)
  const [presetAmount, setPresetAmount] = useState<number | null>(20_000)
  const [textValue, setTextValue] = useState('Arepa de queso')
  const [passwordValue, setPasswordValue] = useState('secreto')
  const [searchValue, setSearchValue] = useState('')
  const [productoActivo, setProductoActivo] = useState(true)
  const [productoInactivo, setProductoInactivo] = useState(false)
  const [navTab, setNavTab] = useState<BottomNavTab>('/vender')

  const keypadAmount = digitsToAmount(keypadDigits)
  const demoTotal = 19_000

  return (
    <div className="min-h-dvh bg-crema text-tinta">
      <div className="mx-auto flex max-w-[1080px] flex-col gap-14 px-gutter py-10">
        <header className="flex flex-col gap-2">
          <p className="font-mono text-caption font-medium text-tinta-suave">
            Sistema visual · v1
          </p>
          <h1 className="text-total font-black text-tostado-700">
            Cuentas Claras
          </h1>
          <p className="max-w-xl text-body-lg font-semibold text-tinta-suave">
            Kit de componentes para comparar con la hoja de estilo. PWA de
            arepas: una mano, sol y hora pico.
          </p>
        </header>

        {/* 1. Colores */}
        <Section title="Colores">
          <DemoLabel>Principales</DemoLabel>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
            <ColorSwatch name="Maíz" hex="#F5B400" className="bg-maiz-500" tall />
            <ColorSwatch name="Maíz activo" hex="#E0A200" className="bg-maiz-600" tall />
            <ColorSwatch name="Tostado" hex="#7A4A1F" className="bg-tostado-500" tall />
            <ColorSwatch name="Títulos" hex="#5A3414" className="bg-tostado-700" tall />
            <ColorSwatch name="Crema" hex="#FFF8EC" className="bg-crema border border-borde" tall />
            <ColorSwatch name="Blanco" hex="#FFFFFF" className="bg-superficie border border-borde" tall />
          </div>
          <DemoLabel>Semánticos</DemoLabel>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
            <ColorSwatch name="Éxito" hex="#1F7A3D" className="bg-exito" />
            <ColorSwatch name="Éxito fondo" hex="#E3F3E7" className="bg-exito-fondo" />
            <ColorSwatch name="Error" hex="#C0322B" className="bg-peligro" />
            <ColorSwatch name="Error fondo" hex="#FBE6E4" className="bg-peligro-fondo" />
            <ColorSwatch name="Pendiente" hex="#C25E00" className="bg-pendiente" />
            <ColorSwatch name="Pendiente fondo" hex="#FDEBD6" className="bg-pendiente-fondo" />
            <ColorSwatch name="Tinta" hex="#2B1D12" className="bg-tinta" />
            <ColorSwatch name="Tinta secundaria" hex="#6B5B4B" className="bg-tinta-suave" />
          </div>
        </Section>

        {/* 2. Tipografía */}
        <Section title="Tipografía">
          <DemoCard>
            <div className="flex flex-col">
              <TypeRow label="Total · 48/900" exampleClass="text-total font-black tabular-nums">
                {formatCOP(37500)}
              </TypeRow>
              <TypeRow label="Título · 24/900" exampleClass="text-title font-black text-tostado-700">
                Venta actual
              </TypeRow>
              <TypeRow label="Subtítulo · 20/800" exampleClass="text-title-sm font-extrabold">
                Arepa de choclo con queso
              </TypeRow>
              <TypeRow label="Cuerpo · 18/600" exampleClass="text-body-lg font-semibold">
                Cobrado en efectivo · cambio listo
              </TypeRow>
              <TypeRow label="Etiqueta · 15/700" exampleClass="text-label font-bold text-tinta-suave">
                Hoy, 12:45 p. m. · Recibo #0142
              </TypeRow>
              <TypeRow label="Mínimo · 14/700" exampleClass="text-caption font-bold">
                Nada por debajo de 14 px
              </TypeRow>
            </div>
          </DemoCard>
        </Section>

        {/* 3. Botones */}
        <Section title="Botones">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
            <DemoCard>
              <DemoLabel>Primario · cta · normal</DemoLabel>
              <Button variant="primary" size="cta" fullWidth icon="payments">
                Cobrar {formatCOP(12500)}
              </Button>
            </DemoCard>
            <DemoCard>
              <DemoLabel>Primario · deshabilitado</DemoLabel>
              <Button variant="primary" size="cta" fullWidth icon="payments" disabled>
                Cobrar {formatCOP(0)}
              </Button>
            </DemoCard>
            <DemoCard>
              <DemoLabel>Primario · presionado (simulado)</DemoLabel>
              <button
                type="button"
                tabIndex={-1}
                className="inline-flex h-cta w-full translate-y-px items-center justify-center gap-2 rounded-lg bg-maiz-600 px-4 text-title-sm font-black text-tinta shadow-primary-pressed"
              >
                <Icon name="payments" size={26} />
                Cobrar {formatCOP(12500)}
              </button>
              <p className="mt-2 text-caption font-bold text-tinta-suave">
                Toca el botón normal para ver el :active real.
              </p>
            </DemoCard>
            <DemoCard>
              <DemoLabel>Primario · loading</DemoLabel>
              <Button
                variant="primary"
                size="cta"
                fullWidth
                loading
                loadingLabel="Intentando…"
              >
                Cobrar
              </Button>
            </DemoCard>
            <DemoCard>
              <DemoLabel>Secundario · lg</DemoLabel>
              <Button variant="secondary" size="lg" fullWidth>
                Cancelar
              </Button>
            </DemoCard>
            <DemoCard>
              <DemoLabel>Tonal · md</DemoLabel>
              <Button variant="tonal" size="md" fullWidth>
                Ocultar pedido
              </Button>
            </DemoCard>
            <DemoCard>
              <DemoLabel>Peligro · lg</DemoLabel>
              <Button variant="danger" size="lg" fullWidth icon="block">
                Anular venta
              </Button>
            </DemoCard>
            <DemoCard>
              <DemoLabel>Peligro contorno · md</DemoLabel>
              <Button variant="danger-outline" size="md" fullWidth>
                Vaciar
              </Button>
            </DemoCard>
            <DemoCard>
              <DemoLabel>Enlace</DemoLabel>
              <Button variant="link" size="md">
                Olvidé mi contraseña
              </Button>
            </DemoCard>
          </div>

          <DemoLabel>Ícono</DemoLabel>
          <div className="flex flex-wrap gap-3">
            <DemoCard className="rounded-lg bg-superficie p-3 shadow-card">
              <DemoLabel>ghost</DemoLabel>
              <IconButton icon="settings" aria-label="Configuración" />
            </DemoCard>
            <DemoCard className="rounded-lg bg-superficie p-3 shadow-card">
              <DemoLabel>tonal</DemoLabel>
              <IconButton icon="search" variant="tonal" aria-label="Buscar" />
            </DemoCard>
            <DemoCard className="rounded-lg bg-superficie p-3 shadow-card">
              <DemoLabel>deshabilitado</DemoLabel>
              <IconButton icon="settings" aria-label="Configuración" disabled />
            </DemoCard>
          </div>

          <DemoLabel>Selector de cantidad</DemoLabel>
          <div className="flex flex-wrap gap-6">
            <div>
              <DemoLabel>Interactivo</DemoLabel>
              <QuantityStepper
                value={stepperQty}
                itemName="arepa de queso"
                onIncrement={() => setStepperQty((q) => q + 1)}
                onDecrement={() => setStepperQty((q) => Math.max(1, q - 1))}
                max={9}
              />
            </div>
            <div>
              <DemoLabel>Removable (qty 1 → borrar)</DemoLabel>
              <QuantityStepper
                value={stepperRemovable}
                itemName="jugo de guanábana"
                removable
                onIncrement={() => setStepperRemovable((q) => q + 1)}
                onDecrement={() =>
                  setStepperRemovable((q) => Math.max(1, q - 1))
                }
                onRemove={() => setStepperRemovable(1)}
              />
            </div>
          </div>
        </Section>

        {/* 4. Campos */}
        <Section title="Campos de texto">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
            <DemoCard>
              <DemoLabel>Texto · normal</DemoLabel>
              <TextField
                label="Nombre del producto"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                placeholder="Ej. Arepa de queso"
              />
            </DemoCard>
            <DemoCard>
              <DemoLabel>Texto · error</DemoLabel>
              <TextField
                label="Nombre del producto"
                defaultValue=""
                error="Escribe el nombre del producto"
              />
            </DemoCard>
            <DemoCard>
              <DemoLabel>Texto · deshabilitado</DemoLabel>
              <TextField
                label="Nombre del producto"
                value="No editable"
                disabled
              />
            </DemoCard>
            <DemoCard>
              <DemoLabel>Monto · lg · con ayuda</DemoLabel>
              <MoneyField
                label="Recibido en efectivo"
                size="lg"
                value={moneyValue}
                onChange={setMoneyValue}
                help={
                  moneyValue != null && moneyValue >= 12500
                    ? `Cambio: ${formatCOP(moneyValue - 12500)}`
                    : 'Ingresa lo que te pagaron'
                }
              />
            </DemoCard>
            <DemoCard>
              <DemoLabel>Monto · md · error</DemoLabel>
              <MoneyField
                label="Precio"
                size="md"
                value={null}
                onChange={() => {}}
                error="El precio debe ser mayor a cero"
              />
            </DemoCard>
            <DemoCard>
              <DemoLabel>Contraseña</DemoLabel>
              <PasswordField
                label="Contraseña"
                value={passwordValue}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPasswordValue(e.target.value)
                }
                autoComplete="current-password"
              />
            </DemoCard>
            <DemoCard>
              <DemoLabel>Contraseña · error</DemoLabel>
              <PasswordField
                label="Contraseña"
                defaultValue="xxx"
                error="Usuario o contraseña incorrectos"
              />
            </DemoCard>
            <DemoCard>
              <DemoLabel>SearchField</DemoLabel>
              <SearchField
                value={searchValue}
                onChange={setSearchValue}
                placeholder="Buscar producto"
                aria-label="Buscar producto"
              />
            </DemoCard>
          </div>
        </Section>

        {/* 5. Chips */}
        <Section title="Chips">
          <DemoCard>
            <DemoLabel>Filtro / categoría · ChipGroup</DemoLabel>
            <ChipGroup
              options={[
                { value: 'todas', label: 'Todas' },
                { value: 'arepas', label: 'Arepas' },
                { value: 'bebidas', label: 'Bebidas' },
                { value: 'adiciones', label: 'Adiciones' },
              ]}
              value={category}
              onChange={setCategory}
            />
          </DemoCard>

          <DemoCard>
            <DemoLabel>Método de pago · segmented</DemoLabel>
            <SegmentedControl
              variant="segmented"
              aria-label="Método de pago"
              options={[
                { value: 'efectivo', label: 'Efectivo', icon: 'payments' },
                { value: 'nequi', label: 'Nequi', icon: 'smartphone' },
                { value: 'otro', label: 'Otro', icon: 'more_horiz' },
              ]}
              value={payment}
              onChange={setPayment}
            />
          </DemoCard>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
            <DemoCard>
              <DemoLabel>tiles</DemoLabel>
              <SegmentedControl
                variant="tiles"
                aria-label="Método de pago mosaico"
                options={[
                  { value: 'efectivo', label: 'Efectivo', icon: 'payments' },
                  { value: 'nequi', label: 'Nequi', icon: 'smartphone' },
                ]}
                value={tilePayment}
                onChange={setTilePayment}
              />
            </DemoCard>
            <DemoCard>
              <DemoLabel>radio-list</DemoLabel>
              <SegmentedControl
                variant="radio-list"
                aria-label="Método de pago lista"
                options={[
                  { value: 'efectivo', label: 'Efectivo' },
                  { value: 'nequi', label: 'Nequi' },
                  { value: 'otro', label: 'Otro' },
                ]}
                value={radioPayment}
                onChange={setRadioPayment}
              />
            </DemoCard>
          </div>

          <DemoCard>
            <DemoLabel>Estado · StatusChip</DemoLabel>
            <div className="flex flex-wrap gap-2">
              <StatusChip status="sincronizado" />
              <StatusChip status="pendiente" />
              <StatusChip status="sin-conexion" />
              <StatusChip status="anulada" />
              <StatusChip status="sincronizado" size="sm" />
              <StatusChip status="pendiente" size="sm" />
            </div>
          </DemoCard>
        </Section>

        {/* 6. Tarjetas */}
        <Section title="Tarjetas">
          <DemoLabel>Producto · idle vs seleccionado</DemoLabel>
          <div className="grid max-w-md grid-cols-2 gap-3">
            <ProductCard
              name="Arepa de queso"
              price={4500}
              quantity={productQty}
              onAdd={() => setProductQty((q) => q + 1)}
            />
            <ProductCard
              name="Jugo de guanábana"
              price={5000}
              quantity={productQty2}
              onAdd={() => setProductQty2((q) => q + 1)}
            />
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
            <div>
              <DemoLabel>VentaListItem</DemoLabel>
              <Card padding="none">
                <Card.List>
                  <VentaListItem
                    to={ROUTES.historialDetalle('demo-vigente')}
                    hora="12:46 p. m."
                    recibo="A-0042"
                    resumenItems="1 Arepa mixta, 1 Arepa de queso, 1 Gaseosa"
                    medioPago="Efectivo"
                    total={19000}
                    pendiente
                  />
                  <VentaListItem
                    to={ROUTES.historialDetalle('demo-nequi')}
                    hora="11:22 a. m."
                    recibo="A-0035"
                    resumenItems="1 Arepa de huevo, 1 Café"
                    medioPago="Nequi"
                    total={9000}
                  />
                  <VentaListItem
                    to={ROUTES.historialDetalle('demo-anulada')}
                    hora="12:20 p. m."
                    recibo="A-0039"
                    resumenItems="3 Arepa de huevo"
                    medioPago="Efectivo"
                    total={21000}
                    anulada
                  />
                </Card.List>
              </Card>
            </div>

            <div>
              <DemoLabel>ProductoListItem</DemoLabel>
              <Card padding="none">
                <Card.List>
                  <ProductoListItem
                    nombre="Arepa de huevo"
                    meta="Arepas"
                    precio={7000}
                    activo={productoActivo}
                    onEdit={() => {}}
                    onActivoChange={setProductoActivo}
                  />
                  <ProductoListItem
                    nombre="Chocolate"
                    meta="Bebidas · Inactivo · no aparece en Vender"
                    precio={3000}
                    activo={productoInactivo}
                    onEdit={() => {}}
                    onActivoChange={setProductoInactivo}
                  />
                </Card.List>
              </Card>
            </div>

            <div>
              <DemoLabel>EmptyState illustrated</DemoLabel>
              <EmptyState
                illustrated
                icon="receipt_long"
                title="Aún no hay ventas hoy"
                description="Las ventas que registres aparecerán aquí con su recibo y medio de pago."
                action={
                  <Button variant="primary" size="lg" icon="point_of_sale">
                    Ir a Vender
                  </Button>
                }
              />
            </div>

            <div>
              <DemoLabel>Resumen / total</DemoLabel>
              <Card variant="summary" padding="md">
                <p className="text-label font-bold text-tostado-on-dark">
                  Total del pedido
                </p>
                <p className="mt-1 text-total-sm font-black tabular-nums text-maiz-on-dark">
                  {formatCOP(37500)}
                </p>
              </Card>
            </div>

            <div>
              <DemoLabel>Alerta</DemoLabel>
              <Card variant="alert-danger" icon="print_disabled">
                No encontramos la impresora. La venta quedó guardada.
              </Card>
            </div>

            <div>
              <DemoLabel>AnulacionBanner · 4c</DemoLabel>
              <AnulacionBanner
                motivo="Producto equivocado"
                meta="Anulada por Laura · hoy, 12:24 p. m."
              />
            </div>

            <div>
              <DemoLabel>UserBadge</DemoLabel>
              <DemoCard>
                <UserBadge nombre="Carlos" />
              </DemoCard>
            </div>

            <div>
              <DemoLabel>BottomActionBar</DemoLabel>
              <div className="overflow-hidden rounded-lg border border-borde">
                <BottomActionBar>
                  <Button
                    variant="secondary"
                    size="lg"
                    icon="print"
                    className="min-w-0 flex-[1.2]"
                  >
                    Reimprimir recibo
                  </Button>
                  <Button
                    variant="danger"
                    size="lg"
                    icon="block"
                    className="min-w-0 flex-1"
                  >
                    Anular venta
                  </Button>
                </BottomActionBar>
              </div>
            </div>

            <div>
              <DemoLabel>DetalleSkeleton</DemoLabel>
              <div className="h-80 overflow-hidden rounded-lg border border-borde">
                <DetalleSkeleton />
              </div>
            </div>

            <div>
              <DemoLabel>ProductosListSkeleton</DemoLabel>
              <div className="overflow-hidden rounded-lg border border-borde p-4">
                <ProductosListSkeleton rows={4} />
              </div>
            </div>

            <div>
              <DemoLabel>OfflineBanner</DemoLabel>
              <div className="overflow-hidden rounded-lg shadow-card">
                <OfflineBanner />
              </div>
            </div>

            <div>
              <DemoLabel>SectionTitle</DemoLabel>
              <SectionTitle>Impresora</SectionTitle>
            </div>
          </div>
        </Section>

        {/* 7. Barras */}
        <Section title="Barras de navegación · 390 px">
          <div className="flex flex-wrap gap-6">
            <div className="w-lienzo">
              <DemoLabel>TopBar · en línea</DemoLabel>
              <div className="overflow-hidden rounded-lg border border-borde shadow-card">
                <TopBar
                  connectionKind="online"
                  printerConnected
                  pendingCount={0}
                  onSettings={() =>
                    toast({
                      message: 'Abriría Configuración',
                      variant: 'info',
                    })
                  }
                />
              </div>
            </div>
            <div className="w-lienzo">
              <DemoLabel>TopBar · sin conexión + pendientes</DemoLabel>
              <div className="overflow-hidden rounded-lg border border-borde shadow-card">
                <TopBar
                  connectionKind="offline"
                  printerConnected={false}
                  pendingCount={3}
                  onSettings={() => {}}
                />
              </div>
            </div>
            <div className="w-lienzo">
              <DemoLabel>TopBar · stacked</DemoLabel>
              <div className="overflow-hidden rounded-lg border border-borde shadow-card">
                <TopBar
                  variant="stacked"
                  title="Detalle de venta"
                  onBack={() =>
                    toast({ message: 'Volver', variant: 'info' })
                  }
                />
              </div>
            </div>
            <div className="w-lienzo">
              <DemoLabel>BottomNav · controlado</DemoLabel>
              <div className="relative h-navbar overflow-hidden rounded-lg border border-borde shadow-card">
                <BottomNav
                  className="!static"
                  activeTo={navTab}
                  onNavigate={setNavTab}
                />
              </div>
            </div>
          </div>
        </Section>

        {/* 8. Switch */}
        <Section title="Interruptor">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
            <DemoCard>
              <DemoLabel>Switch · encendido</DemoLabel>
              <Switch
                checked={switchOn}
                onCheckedChange={setSwitchOn}
                aria-label="Imprimir automáticamente"
              />
            </DemoCard>
            <DemoCard>
              <DemoLabel>Switch · apagado</DemoLabel>
              <Switch
                checked={false}
                onCheckedChange={() => {}}
                aria-label="Ejemplo apagado"
              />
            </DemoCard>
            <DemoCard>
              <DemoLabel>Switch · deshabilitado</DemoLabel>
              <Switch
                checked
                disabled
                onCheckedChange={() => {}}
                aria-label="No disponible"
              />
            </DemoCard>
            <DemoCard>
              <DemoLabel>SwitchRow</DemoLabel>
              <SwitchRow
                label="Imprimir al cobrar"
                description="Manda el recibo en cuanto se confirma la venta"
                checked={switchRowOn}
                onCheckedChange={setSwitchRowOn}
              />
            </DemoCard>
            <DemoCard>
              <DemoLabel>Fab</DemoLabel>
              <Fab aria-label="Agregar producto" onClick={() => {}} />
            </DemoCard>
          </div>
        </Section>

        {/* 9. Cobro · montos y teclado */}
        <Section title="Cobro · montos y teclado">
          <div className="flex flex-col gap-4">
            <DemoCard>
              <DemoLabel>VueltasBanner</DemoLabel>
              <div className="flex flex-col gap-2">
                <VueltasBanner total={demoTotal} pagaCon={null} />
                <VueltasBanner total={demoTotal} pagaCon={10_000} />
                <VueltasBanner total={demoTotal} pagaCon={25_000} />
              </div>
            </DemoCard>
            <DemoCard>
              <DemoLabel>AmountPresetBar + SuccessMark</DemoLabel>
              <AmountPresetBar
                exactAmount={demoTotal}
                value={presetAmount}
                onChange={setPresetAmount}
              />
              <div className="mt-4 flex justify-center">
                <SuccessMark />
              </div>
            </DemoCard>
            <DemoCard className="mx-auto max-w-sm rounded-lg bg-superficie p-4 shadow-card">
              <MoneyField
                label="Recibido"
                size="lg"
                value={keypadAmount}
                onChange={(v) => setKeypadDigits(amountToDigits(v))}
                readOnly
              />
              <AmountPresetBar
                className="mt-2"
                exactAmount={demoTotal}
                value={keypadAmount}
                onChange={(n) => setKeypadDigits(amountToDigits(n))}
              />
              <VueltasBanner
                className="mt-2"
                total={demoTotal}
                pagaCon={keypadAmount}
              />
              <NumericKeypad
                className="mt-4"
                value={keypadDigits}
                onChange={setKeypadDigits}
              />
            </DemoCard>
          </div>
        </Section>

        {/* 10. BottomSheet */}
        <Section title="Hoja inferior">
          <DemoCard>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setSheetOpen(true)}
            >
              Abrir hoja inferior
            </Button>
            <BottomSheet
              open={sheetOpen}
              onOpenChange={setSheetOpen}
              title="Cobrar"
              showClose
              footer={
                <Button
                  variant="primary"
                  size="cta"
                  fullWidth
                  icon="print"
                  onClick={() => {
                    setSheetOpen(false)
                    toast({
                      message: 'Venta registrada',
                      variant: 'success',
                    })
                  }}
                >
                  Cobrar e imprimir
                </Button>
              }
            >
              <p className="text-body-lg font-semibold text-tinta-suave">
                Total a cobrar{' '}
                <span className="font-black tabular-nums text-tinta">
                  {formatCOP(12500)}
                </span>
              </p>
            </BottomSheet>
          </DemoCard>
        </Section>

        {/* 11. Toasts */}
        <Section title="Toasts">
          <DemoCard>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="tonal"
                size="md"
                onClick={() =>
                  toast({
                    message: 'Ventas sincronizadas',
                    variant: 'success',
                  })
                }
              >
                Toast éxito
              </Button>
              <Button
                variant="tonal"
                size="md"
                onClick={() =>
                  toast({
                    message: 'No se pudo imprimir el recibo',
                    variant: 'error',
                  })
                }
              >
                Toast error
              </Button>
              <Button
                variant="tonal"
                size="md"
                onClick={() =>
                  toast({
                    message: '3 ventas pendientes de enviar',
                    variant: 'info',
                  })
                }
              >
                Toast info
              </Button>
            </div>
          </DemoCard>
        </Section>

        {/* 12. Íconos */}
        <Section title="Íconos">
          <DemoCard>
            <div className="flex flex-wrap gap-4 text-tostado-700">
              {(
                [
                  'payments',
                  'print',
                  'print_disabled',
                  'block',
                  'remove',
                  'add',
                  'settings',
                  'search',
                  'error',
                  'cloud_done',
                  'cloud_upload',
                  'cloud_off',
                  'smartphone',
                  'more_horiz',
                  'point_of_sale',
                  'receipt_long',
                  'inventory_2',
                ] as const
              ).map((name) => (
                <div
                  key={name}
                  className="flex w-16 flex-col items-center gap-1"
                >
                  <Icon name={name} size={28} />
                  <span className="w-full truncate text-center font-mono text-caption text-tinta-suave">
                    {name}
                  </span>
                </div>
              ))}
            </div>
          </DemoCard>
        </Section>
      </div>

      <Toaster />
    </div>
  )
}

function TypeRow({
  label,
  exampleClass,
  children,
}: {
  label: string
  exampleClass: string
  children: ReactNode
}) {
  return (
    <div className="grid grid-cols-[minmax(140px,180px)_1fr] items-baseline gap-4 border-t border-borde py-3 first:border-t-0 first:pt-0">
      <span className="font-mono text-caption font-medium text-tinta-suave">
        {label}
      </span>
      <span className={exampleClass}>{children}</span>
    </div>
  )
}
