# Frontend — Cuentas Claras

PWA (Vite + React + TypeScript) para registrar ventas de arepas.

## Desarrollo

```bash
npm install
npm run dev
```

Variables en `.env.development`:

- `VITE_API_URL` — base del backend (default `http://127.0.0.1:8000`)

El backend debe estar corriendo (ver `backend/README.md`). Credenciales seed: `carlos` / `laura`, contraseña `arepa12`.

## Tipos OpenAPI

Con el backend arriba:

```bash
npm run api:types
```

Genera `src/lib/api/schema.ts` desde `/openapi.json`. Commitea el archivo generado.

## Scripts

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Vite en desarrollo |
| `npm run build` | Build de producción |
| `npm run test` | Vitest |
| `npm run api:types` | Regenerar tipos desde OpenAPI |
| `npm run lint` | ESLint |
