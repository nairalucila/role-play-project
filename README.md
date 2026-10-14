# Role Play Project

Aplicación web para jugar rol con personajes interpretados por IA.

## Requisitos

- Node.js 24+
- pnpm (se descarga automáticamente para este proyecto vía `devEngines`; no hace falta instalarlo global)

## Estructura

```
apps/
  api/        Backend Express 5
  web/        Frontend React + Vite (en construcción)
packages/
  shared/     Esquemas Zod y tipos compartidos
```

## Primeros pasos

```bash
pnpm install
cp .env.example .env   # completar DATABASE_URL, AI_API_KEY y AI_MODEL
pnpm typecheck
```

## Scripts

| Script | Qué hace |
|---|---|
| `pnpm dev` | Levanta todos los paquetes que tengan script `dev` (con recarga automática) |
| `pnpm dev:api` | Levanta solo la API en modo desarrollo |
| `pnpm start` | Levanta la API sin recarga automática |
| `pnpm build` | Build de todos los paquetes |
| `pnpm typecheck` | Chequeo de tipos en todo el monorepo |
| `pnpm db:generate` | Genera una migración SQL a partir de `apps/api/src/db/schema.ts` |
| `pnpm db:migrate` | Aplica las migraciones pendientes en la base |
| `pnpm db:studio` | Abre un visor web de la base de datos |
