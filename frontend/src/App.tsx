import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { GuestOnly } from './app/GuestOnly'
import { RequireAuth } from './app/RequireAuth'
import { RequireSyncInicial } from './app/RequireSyncInicial'
import { ROUTES } from './app/routes'
import { AppShell } from './components/AppShell'
import { LoginPage } from './features/auth/pages/LoginPage'
import { ConfiguracionPage } from './features/configuracion/pages/ConfiguracionPage'
import { ImpresoraPage } from './features/configuracion/pages/ImpresoraPage'
import { DetalleVentaPage } from './features/historial/pages/DetalleVentaPage'
import { HistorialPage } from './features/historial/pages/HistorialPage'
import { ProductosPage } from './features/productos/pages/ProductosPage'
import { VenderPage } from './features/ventas/pages/VenderPage'
import { StackLayout } from './layouts/StackLayout'
import { TabsLayout } from './layouts/TabsLayout'
import { NotFoundPage } from './pages/NotFoundPage'

const UiKitPage = import.meta.env.DEV
  ? lazy(() => import('./pages/dev/UiKitPage'))
  : null

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={ROUTES.vender} replace />} />

      <Route element={<GuestOnly />}>
        <Route path={ROUTES.login} element={<LoginPage />} />
      </Route>

      {UiKitPage ? (
        <Route
          path={ROUTES.devUi}
          element={
            <Suspense fallback={null}>
              <UiKitPage />
            </Suspense>
          }
        />
      ) : null}

      <Route element={<RequireAuth />}>
        <Route element={<RequireSyncInicial />}>
          <Route element={<AppShell />}>
            <Route element={<TabsLayout />}>
              <Route path={ROUTES.vender} element={<VenderPage />} />
              <Route path={ROUTES.historial} element={<HistorialPage />} />
              <Route path={ROUTES.productos} element={<ProductosPage />} />
            </Route>

            <Route element={<StackLayout />}>
              <Route
                path={`${ROUTES.historial}/:id`}
                element={<DetalleVentaPage />}
              />
              <Route
                path={ROUTES.configuracion}
                element={<ConfiguracionPage />}
              />
              <Route path={ROUTES.impresora} element={<ImpresoraPage />} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
