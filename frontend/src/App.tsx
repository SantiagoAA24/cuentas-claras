import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import { AppShell } from './components/AppShell'

const UiKitPage = import.meta.env.DEV
  ? lazy(() => import('./pages/dev/UiKitPage'))
  : null

function HomePage() {
  return (
    <AppShell>
      <h1>Cuentas Claras</h1>
    </AppShell>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {UiKitPage ? (
        <Route
          path="/dev/ui"
          element={
            <Suspense fallback={null}>
              <UiKitPage />
            </Suspense>
          }
        />
      ) : null}
    </Routes>
  )
}

export default App
