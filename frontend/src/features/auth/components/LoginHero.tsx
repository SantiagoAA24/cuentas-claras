type LoginHeroProps = {
  /** Nombre del negocio; vacío mientras carga. */
  nombreNegocio?: string
}

/** Mitad superior del login: arepa CSS + marca + nombre del negocio. */
export function LoginHero({ nombreNegocio }: LoginHeroProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <div
        className="relative flex size-42 items-center justify-center"
        aria-hidden
      >
        <span className="absolute inset-0 rounded-full bg-maiz-100" />
        <span className="absolute bottom-6 h-4 w-28 rounded-full bg-tostado-500/20" />
        <span
          className="relative size-28 rounded-full bg-arepa"
          style={{
            boxShadow:
              'inset 0 0 0 7px var(--color-arepa-borde), inset 0 -10px 0 7px color-mix(in srgb, var(--color-arepa-grano) 35%, transparent)',
          }}
        >
          <span className="absolute top-8 left-8 size-4 rounded-full bg-arepa-grano" />
          <span className="absolute top-12 left-18 size-3 rounded-full bg-arepa-grano" />
          <span className="absolute top-18 left-10 h-3 w-4 rounded-full bg-arepa-grano-oscuro" />
          <span className="absolute top-6 left-17 size-2.5 rounded-full bg-arepa-grano" />
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-total-sm font-black tracking-tight text-tostado-700">
          Cuentas Claras
        </h1>
        <p
          className="min-h-6 text-item font-bold text-tinta-suave"
          aria-live="polite"
        >
          {nombreNegocio ?? '\u00a0'}
        </p>
      </div>
    </div>
  )
}
