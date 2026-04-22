# StatTracker — System Design

Decisiones de arquitectura tomadas en Sprint 2 (2026-04). Este doc es la fuente de verdad; el README raíz es aspiracional.

## Vista general

```
┌──────────────────────────────────────────────────────────────┐
│                         Client (Web)                          │
│  Next.js 16 App Router · React 19 · Tailwind 4 · TanStack    │
│            Query + tRPC client · NextAuth (pendiente)         │
└──────────────────────────┬───────────────────────────────────┘
                           │ tRPC over HTTP (batched)
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                       API (Fastify)                           │
│   @trpc/server · Zod · Pino · @fastify/cors                   │
│   Routers: health, user (+ lol/tft/val/... vienen después)    │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                 packages/database (Prisma)                    │
│   Prisma Client compartido · schema.prisma · migrations       │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
                   ┌───────────────┐        ┌──────────────┐
                   │ Postgres 16   │        │ Redis 7      │
                   │ (dev: docker) │        │ (cache/queue)│
                   └───────────────┘        └──────────────┘
```

Los **workers** (`apps/workers`, futuro) se suscriben al mismo Prisma client y escribirán snapshots de matches + stats agregadas que la API lee.

## Layout del monorepo

```
apps/
  web/          Next.js 16 (@trackerstat/web)
  api/          Fastify + tRPC (@trackerstat/api)
  workers/      Jobs / ingesters (scaffold vacío)
  desktop/      Tauri (futuro)
packages/
  database/     Prisma schema + cliente compartido (@trackerstat/database)
  ui/           Sistema de diseño (pendiente extraer de web)
  types/        Tipos compartidos adicionales (pendiente)
docs/architecture/
  system-design.md  (este archivo)
```

**Gestor**: `pnpm` workspaces (`pnpm-workspace.yaml`). Lockfile único en raíz. Dependencias shared via `catalog:` en el workspace.

**Tooling**: Biome 2 (lint + format), Lefthook (pre-commit biome + pre-push typecheck), GitHub Actions (quality + typecheck + build en paralelo).

## Decisiones y por qué

| Decisión | Elección | Alternativas rechazadas | Razón |
|---|---|---|---|
| Monorepo | pnpm workspaces | Turborepo, Nx | Suficiente hoy; escalamos a Turborepo cuando builds cruzados se vuelvan lentos |
| Backend | Fastify + tRPC | NestJS, FastAPI, Hono | Types end-to-end con web sin generar clientes; cero boilerplate de DTOs; encaja con Zod que ya existe |
| ORM | Prisma 6 | Drizzle | Ya instalado; buena DX; si topamos con edge/serverless problems migramos |
| DB | Postgres 16 | MySQL, SQLite | Estándar; rico en JSON, CTEs, índices GIN para búsqueda |
| Cache/queue | Redis 7 | Upstash, DragonflyDB | Todo local en Docker Compose para dev determinista |
| Validación | Zod 4 | Yup, Valibot | Ya en uso; integra con tRPC nativamente |
| Auth | NextAuth v5 (Auth.js) pendiente | Clerk, Supabase Auth | Evitar vendor lock; credenciales + OAuth (Discord, Riot) se implementarán local |

## Data model (mínimo)

Ver [`packages/database/prisma/schema.prisma`](../../packages/database/prisma/schema.prisma).

- **User** — cuenta de StatTracker (email + display).
- **RiotAccount** — mapeo `puuid ↔ user`. Un usuario puede linkear varias cuentas Riot.
- **MatchSnapshot** — snapshot por partida (kda, champion, win, queue). JSON crudo en `raw` para no perder data antes de decidir el shape final.
- **ChampionStat** — agregados por patch + rol + champion. Unique en `(game, patch, championKey, role)`. Los workers los recalculan por patch.

Enum `Game` centraliza los 9 juegos del README.

## Flujo de dev

```bash
# 1. Arrancar servicios
pnpm docker:up                  # Postgres + Redis

# 2. Configurar entorno
cp .env.example .env            # editar según corresponda

# 3. Setup DB (primera vez)
pnpm db:generate                # genera Prisma Client
pnpm db:push                    # pushea schema (sin migrations aún)

# 4. Correr apps
pnpm dev:api                    # http://localhost:4000
pnpm dev:web                    # http://localhost:3000

# Otras
pnpm db:studio                  # GUI de Prisma
pnpm typecheck                  # todo el workspace
pnpm check:fix                  # Biome auto-fix
```

## Estado actual

- ✅ Monorepo con pnpm workspaces
- ✅ Postgres + Redis vía Docker Compose
- ✅ `@trackerstat/database` con schema inicial
- ✅ `@trackerstat/api` con Fastify + tRPC: `health.ping`, `user.me`, `lol.getChampionStats`
- ✅ `@trackerstat/web` conectado al tRPC client (LoL ya en vivo vía tRPC)
- ✅ `@trackerstat/sdk` con cliente Data Dragon tipado (`getVersions`, `getChampions`, `getLoLRole`)
- ✅ Seed de `ChampionStat` para LoL (`pnpm db:seed`)
- ✅ NextAuth v5 con Credentials + Discord + Prisma adapter; API valida JWT via cookie compartida
- ✅ `@trackerstat/workers` con job `lol-data-dragon` (reemplaza el seed de Prisma)
- ✅ Riot API client v4/v5 en `@trackerstat/sdk` (account-v1, match-v5) con rate limiter
- ✅ Endpoint `lol.getMatchHistory` autenticado (resuelve Riot ID → puuid → últimas N partidas)
- ⏳ Riot API v4/v5 client (match-v5, rate limiter) — Sprint 3 Fase B
- ⏳ Reemplazar mocks restantes (`tft`, `valorant`, `dota2`, etc.) — post vertical slice

## Próximos hitos (Sprint 3 · Fase B restante)

1. UI de login/registro + provider Riot RSO (ampliar auth)
2. Persistir `MatchSnapshot` cuando `lol.getMatchHistory` trae partidas nuevas
3. Scheduler (cron/Redis) que dispare `workers:lol` a diario en prod
4. Replicar el patrón LoL → TFT (segundo vertical slice)

## Auth flow

- Web corre NextAuth v5 en `apps/web/src/lib/auth.ts` con Prisma adapter + JWT strategy.
- `/api/auth/[...nextauth]/route.ts` expone los handlers de Auth.js (signin, callback, session, etc.).
- Cookie `authjs.session-token` se emite en `localhost` (dev) y se comparte con el API gracias a `credentials: 'include'` en el tRPC client + `origin` exacto en CORS.
- En el API, `createContext` decodifica la cookie con `next-auth/jwt` (`AUTH_SECRET` compartido) y poblá `ctx.userId`. `authedProcedure` rechaza sin sesión.
