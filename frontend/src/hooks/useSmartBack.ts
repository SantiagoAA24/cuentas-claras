import { useNavigate } from 'react-router'

type HistoryState = { idx?: number }

/**
 * Vuelve con el historial del navegador si hay entradas previas en la app;
 * si no (deep link / URL directa), navega al fallback con replace.
 */
export function useSmartBack(fallback: string) {
  const navigate = useNavigate()

  return () => {
    const idx = (window.history.state as HistoryState | null)?.idx ?? 0
    if (idx > 0) {
      navigate(-1)
    } else {
      navigate(fallback, { replace: true })
    }
  }
}
